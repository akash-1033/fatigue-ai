"""
Prediction Routes
Endpoints for fatigue life prediction
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas import PredictionRequest, PredictionResponse, ModelPrediction
from app.services.interference import predict_all_models
from datetime import datetime
import time
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/fatigue", response_model=PredictionResponse)
async def predict_fatigue_life(request: PredictionRequest, background_tasks: BackgroundTasks):
    """
    Predict fatigue life using all 6 PINN models
    
    This endpoint runs inference for both axial and shear waveforms through
    3 different architectures (LSTM, GRU, CNN) in the selected loading mode.
    
    **Request Body:**
    - `mode`: "stress" or "strain" (required)
    - `material`: Material properties object (required)
      - `E`: Young's Modulus in GPa
      - `ys`: Yield Strength in MPa
      - `uts`: Ultimate Tensile Strength in MPa
      - `nu`: Poisson's Ratio
    - `axial_waveform`: Array of 200 floats (required)
    - `shear_waveform`: Array of 200 floats (required)
    - `waveform_type`: Type of waveform ("sinusoidal", "triangular", "square", "random")
    
    **Response:**
    Returns predictions from all 3 architectures with confidence and inference time.
    Each model outputs log₁₀(Nf), where Nf = cycles to failure.
    
    **Example:**
    ```json
    {
      "lstm": {"log": 5.83, "conf": 92, "time": 22},
      "gru": {"log": 5.76, "conf": 88, "time": 18},
      "cnn": {"log": 5.91, "conf": 85, "time": 15},
      "timestamp": "2024-01-15T10:30:45.123456"
    }
    ```
    """
    
    logger.info(f"Received prediction request: mode={request.mode}, "
               f"material={request.material.model_dump()}, "
               f"waveform_type={request.waveform_type}")
    
    try:
        # Start timer
        start_time = time.time()
        
        # Validate request
        if request.mode not in ["stress", "strain"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid mode '{request.mode}'. Must be 'stress' or 'strain'"
            )
        
        # Validate waveform lengths
        print(len(request.axial_waveform),len(request.shear_waveform))
        
        # Run inference with all 3 models
        logger.info(f"Starting inference for {request.mode}-controlled loading...")
        
        results = predict_all_models(
            mode=request.mode,
            material=request.material.model_dump(),
            axial_waveform=request.axial_waveform,
            shear_waveform=request.shear_waveform
        )
        
        # Format responses
        lstm_pred = ModelPrediction(
            log=round(results["lstm"]["log10_nf"], 3),
            conf=results["lstm"]["confidence"],
            time=int((time.time() - start_time) * 1000)
        )
        
        gru_pred = ModelPrediction(
            log=round(results["gru"]["log10_nf"], 3),
            conf=results["gru"]["confidence"],
            time=int((time.time() - start_time) * 1000)
        )
        
        cnn_pred = ModelPrediction(
            log=round(results["cnn"]["log10_nf"], 3),
            conf=results["cnn"]["confidence"],
            time=int((time.time() - start_time) * 1000)
        )
        
        logger.info(f"Inference complete in {(time.time() - start_time):.2f}s")
        
        return PredictionResponse(
            lstm=lstm_pred,
            gru=gru_pred,
            cnn=cnn_pred,
            timestamp=datetime.now().isoformat()
        )
    
    except HTTPException as e:
        logger.error(f"HTTP Error: {e.detail}")
        raise
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@router.post("/batch")
async def predict_batch(requests: list[PredictionRequest]):
    """
    Batch prediction endpoint (optional)
    
    Run multiple predictions in a single request.
    Useful for large-scale parameter sweeps.
    """
    results = []
    
    for req in requests:
        try:
            result = await predict_fatigue_life(req, BackgroundTasks())
            results.append(result)
        except Exception as e:
            logger.error(f"Batch prediction error: {str(e)}")
            results.append({"error": str(e)})
    
    return {"predictions": results, "count": len(results)}

@router.get("/test")
async def test_prediction():
    """
    Test endpoint - returns a mock prediction
    Useful for debugging and UI testing
    """
    logger.info("Test prediction endpoint called")
    
    return PredictionResponse(
        lstm=ModelPrediction(log=5.83, conf=92, time=22),
        gru=ModelPrediction(log=5.76, conf=88, time=18),
        cnn=ModelPrediction(log=5.91, conf=85, time=15),
        timestamp=datetime.now().isoformat()
    )