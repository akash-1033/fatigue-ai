"""Health Check and Model Status Routes"""

from fastapi import APIRouter, HTTPException
from app.schemas import HealthStatus, ModelsStatus
from app.services.model_manager import ModelManager
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/status", response_model=HealthStatus)
async def health_check():
    """
    Health check endpoint
    
    Returns system health status and model readiness
    """
    is_ready = ModelManager.is_ready()
    
    status = "healthy" if is_ready else "degraded"
    message = "All systems operational" if is_ready else "Some models not loaded"
    
    return HealthStatus(
        status=status,
        message=message,
        models_ready=is_ready,
        inference_available=is_ready,
        timestamp=datetime.now().isoformat()
    )

@router.get("/ping")
async def ping():
    """Simple ping endpoint"""
    return {
        "status": "pong",
        "timestamp": datetime.now().isoformat()
    }

# ── MODELS ROUTER ───────────────────────────────────────────────────────────
models_router = APIRouter()

@models_router.get("/status", response_model=ModelsStatus)
async def models_status():
    """
    Get status of all 6 PINN models
    
    Returns which models are loaded and on which device (CPU/GPU)
    """
    status = ModelManager.get_status()
    
    # Create individual model status dict
    model_status_dict = {key: True for key in status["models"]}
    
    return ModelsStatus(
        all_loaded=status["all_loaded"],
        count=status["count"],
        models=model_status_dict,
        device=status["device"],
        timestamp=datetime.now().isoformat()
    )

@models_router.get("/info")
async def models_info():
    """
    Get information about loaded models
    
    Returns architecture summary and model parameters
    """
    status = ModelManager.get_status()
    
    if not status["all_loaded"]:
        raise HTTPException(status_code=503, detail="Models not fully loaded")
    
    return {
        "loaded_models": status["models"],
        "device": status["device"],
        "architectures": ["LSTM + FCNN", "GRU + FCNN", "CNN + FCNN"],
        "modes": ["strain-controlled", "stress-controlled"],
        "total_models": status["count"],
        "timestamp": datetime.now().isoformat()
    }

@models_router.post("/reload")
async def reload_models():
    """
    Reload all models from disk
    
    WARNING: Only use in development. Causes temporary unavailability.
    """
    logger.warning("Model reload requested - reloading from disk")
    
    try:
        ModelManager._models.clear()
        ModelManager._loaded = False
        ModelManager.load_all_models()
        
        return {
            "status": "success",
            "message": "All models reloaded from disk",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Model reload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Reload failed: {str(e)}")

# Include in main app
router.include_router(models_router, prefix="/models", tags=["Models"])
