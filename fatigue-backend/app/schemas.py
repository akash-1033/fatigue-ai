"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
from datetime import datetime

# ── MATERIAL PROPERTIES ──────────────────────────────────────────────────────
class MaterialProperties(BaseModel):
    """Material mechanical properties input"""
    E: float = Field(..., description="Young's Modulus (GPa)", ge=10, le=400)
    ys: float = Field(..., description="Yield Strength (MPa)", ge=50, le=2000)
    uts: float = Field(..., description="Ultimate Tensile Strength (MPa)", ge=100, le=2500)
    nu: float = Field(..., description="Poisson's Ratio", ge=0.1, le=0.5)

    class Config:
        schema_extra = {
            "example": {
                "E": 193,
                "ys": 205,
                "uts": 515,
                "nu": 0.28
            }
        }

# ── PREDICTION REQUEST ───────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    """Fatigue life prediction request"""
    mode: str = Field(..., description="Loading mode: 'stress' or 'strain'")
    material: MaterialProperties = Field(..., description="Material properties")
    axial_waveform: List[float] = Field(..., description="Axial stress/strain waveform (241 floats)")
    shear_waveform: List[float] = Field(..., description="Shear stress/strain waveform (241 floats)")
    waveform_type: str = Field(..., description="Waveform type: sinusoidal, triangular, square, random")

    @validator("mode")
    def validate_mode(cls, v):
        if v.lower() not in ["stress", "strain"]:
            raise ValueError("mode must be 'stress' or 'strain'")
        return v.lower()

    @validator("axial_waveform", "shear_waveform")
    def validate_waveform_length(cls, v):
        print("LENGTH =", len(v))
        return v

    @validator("waveform_type")
    def validate_waveform_type(cls, v):
        valid_types = ["sinusoidal", "triangular", "square", "random"]
        if v.lower() not in valid_types:
            raise ValueError(f"waveform_type must be one of: {valid_types}")
        return v.lower()

    class Config:
        schema_extra = {
            "example": {
                "mode": "strain",
                "material": {
                    "E": 193,
                    "ys": 205,
                    "uts": 515,
                    "nu": 0.28
                },
                "axial_waveform": [0.0, 0.1, 0.2, -0.1, -0.2, 0.1, 0.2, -0.1, -0.2, 0.0],
                "shear_waveform": [0.0, 0.05, 0.1, -0.05, -0.1, 0.05, 0.1, -0.05, -0.1, 0.0],
                "waveform_type": "sinusoidal"
            }
        }

# ── MODEL PREDICTION OUTPUT ──────────────────────────────────────────────────
class ModelPrediction(BaseModel):
    """Single model prediction output"""
    log: float = Field(..., description="Predicted log₁₀(Nf)")
    conf: int = Field(..., description="Confidence percentage (0-100)")
    time: int = Field(..., description="Inference time in milliseconds")

    class Config:
        schema_extra = {
            "example": {
                "log": 5.83,
                "conf": 92,
                "time": 22
            }
        }

# ── PREDICTION RESPONSE ──────────────────────────────────────────────────────
class PredictionResponse(BaseModel):
    """Response from fatigue life prediction with all 3 models"""
    lstm: ModelPrediction = Field(..., description="LSTM + FCNN prediction")
    gru: ModelPrediction = Field(..., description="GRU + FCNN prediction")
    cnn: ModelPrediction = Field(..., description="CNN + FCNN prediction")
    timestamp: str = Field(..., description="ISO 8601 timestamp")

    class Config:
        schema_extra = {
            "example": {
                "lstm": {"log": 5.83, "conf": 92, "time": 22},
                "gru": {"log": 5.76, "conf": 88, "time": 18},
                "cnn": {"log": 5.91, "conf": 85, "time": 15},
                "timestamp": "2024-01-15T10:30:45.123456"
            }
        }

# ── EXPORT REQUEST ───────────────────────────────────────────────────────────
class ExportRequest(BaseModel):
    """Request to export results as PDF or JSON"""
    format: str = Field(..., description="Export format: 'pdf' or 'json'")
    include_plots: bool = Field(True, description="Include waveform and scatter plots in PDF")

    @validator("format")
    def validate_format(cls, v):
        if v.lower() not in ["pdf", "json"]:
            raise ValueError("format must be 'pdf' or 'json'")
        return v.lower()

# ── MODEL STATUS ─────────────────────────────────────────────────────────────
class ModelStatus(BaseModel):
    """Status of a single model"""
    name: str = Field(..., description="Model identifier (e.g., 'strain_lstm')")
    loaded: bool = Field(..., description="Whether model is loaded into memory")
    size_mb: Optional[float] = Field(None, description="Model file size in MB")
    device: str = Field(..., description="Device model is loaded on (cpu/cuda)")

class ModelsStatus(BaseModel):
    """Status of all 6 models"""
    all_loaded: bool = Field(..., description="Whether all models are loaded")
    count: int = Field(..., description="Number of loaded models")
    models: Dict[str, bool] = Field(..., description="Individual model status")
    device: str = Field(..., description="Inference device")
    timestamp: str = Field(..., description="Status check timestamp")

# ── HEALTH CHECK ─────────────────────────────────────────────────────────────
class HealthStatus(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Status: 'healthy' or 'degraded'")
    message: str = Field(..., description="Human-readable status message")
    models_ready: bool = Field(..., description="Whether all models are loaded")
    inference_available: bool = Field(..., description="Whether prediction is available")
    timestamp: str = Field(..., description="Health check timestamp")

# ── ERROR RESPONSE ───────────────────────────────────────────────────────────
class ErrorResponse(BaseModel):
    """Standard error response"""
    detail: str = Field(..., description="Error message")
    timestamp: str = Field(..., description="Error timestamp")
    status_code: int = Field(..., description="HTTP status code")

    class Config:
        schema_extra = {
            "example": {
                "detail": "Invalid waveform length",
                "timestamp": "2024-01-15T10:30:45.123456",
                "status_code": 400
            }
        }