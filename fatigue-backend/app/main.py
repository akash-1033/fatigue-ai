"""
FatigueAI Platform Backend
Physics-Informed Fatigue Life Prediction using Deep Learning
Main application entry point
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from datetime import datetime
import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

# ── SETUP LOGGING ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(name)s - %(message)s',
    handlers=[
        # logging.FileHandler('logs/fatigue_backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ── INITIALIZE FASTAPI APP ───────────────────────────────────────────────────
app = FastAPI(
    title="FatigueAI Physics-Informed Platform API",
    description="Deep Learning Platform for Multiaxial Fatigue Life Prediction",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS CONFIGURATION ───────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://localhost:5173",  # Vite dev server
        "*"  # Allow all origins (adjust for production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── IMPORT ROUTES (after app initialization) ────────────────────────────────
try:
    from app.routes import prediction, health_models
    logger.info("Routes imported successfully")
except ImportError as e:
    logger.error(f"Failed to import routes: {e}")
    raise

# ── INCLUDE ROUTERS ──────────────────────────────────────────────────────────
app.include_router(health_models.router, prefix="/health", tags=["Health"])
app.include_router(health_models.models_router, prefix="/models", tags=["Models"])
app.include_router(prediction.router, prefix="/predict", tags=["Prediction"])

logger.info("All routers registered successfully")

# ── ROOT ENDPOINT ────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    """Root endpoint - returns API information"""
    return {
        "name": "FatigueAI Physics-Informed Fatigue Life Prediction Platform",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "description": "AI-driven multiaxial fatigue analysis using waveform-aware deep learning",
        "endpoints": {
            "health": "/health/status",
            "models": "/models/status",
            "predict": "POST /predict/fatigue",
            "docs": "/docs",
            "redoc": "/redoc"
        },
        "models_deployed": 6,
        "loading_modes": ["stress-controlled", "strain-controlled"],
        "architectures": ["LSTM + FCNN", "GRU + FCNN", "CNN + FCNN"]
    }

# ── ERROR HANDLERS ───────────────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

# ── STARTUP EVENT ────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """Initialize models and prepare for inference"""
    logger.info("=" * 80)
    logger.info("FatigueAI Backend Initialization")
    logger.info("=" * 80)
    
    try:
        from app.services.model_manager import ModelManager
        
        logger.info("[STARTUP] Loading Physics-Informed Neural Network models...")
        ModelManager.load_all_models()
        
        # status = ModelManager.get_status()
        # logger.info(f"[STARTUP] Successfully loaded {status['count']} models")
        # logger.info(f"[STARTUP] Inference device: {status['device']}")
        # logger.info(f"[STARTUP] Models: {', '.join(status['models'])}")
        
    except Exception as e:
        logger.error(f"[STARTUP] Model loading failed: {str(e)}", exc_info=True)
        logger.warning("[STARTUP] Proceeding without models - inference will fail")
    
    logger.info("=" * 80)
    logger.info("Backend ready on http://0.0.0.0:8000")
    logger.info("API Docs: http://localhost:8000/docs")
    logger.info("=" * 80)

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("[SHUTDOWN] Cleaning up resources...")
    logger.info("[SHUTDOWN] Backend stopped")

# ── RUN SERVER ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting FatigueAI Backend Server...")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Set to False in production
        log_level="info"
    )