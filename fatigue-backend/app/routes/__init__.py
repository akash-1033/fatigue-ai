"""Route modules for FatigueAI backend."""

from app.routes import prediction
from app.routes import health as health_models

__all__ = ["prediction", "health_models"]
