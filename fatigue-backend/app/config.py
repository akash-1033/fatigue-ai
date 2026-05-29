"""
Configuration file for FatigueAI Backend
Defines model paths, material presets, and inference settings
"""

import os
from pathlib import Path
import torch

# ── PATHS ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
MODELS_DIR = BASE_DIR / "models"
UPLOADS_DIR = BASE_DIR / "uploads"
EXPORTS_DIR = BASE_DIR / "exports"

# Create directories if they don't exist
MODELS_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)
EXPORTS_DIR.mkdir(exist_ok=True)

# ── MODEL PATHS (UPDATE IF YOUR FILENAMES ARE DIFFERENT) ─────────────────────
MODEL_PATHS = {
    "strain_lstm": MODELS_DIR / "strain_lstm.pth",
    "strain_gru":  MODELS_DIR / "strain_gru.pth",
    "strain_cnn":  MODELS_DIR / "strain_cnn.pth",
    "stress_lstm": MODELS_DIR / "stress_lstm.pth",
    "stress_gru":  MODELS_DIR / "stress_gru.pth",
    "stress_cnn":  MODELS_DIR / "stress_cnn.pth",
}

# ── DEVICE (CPU or GPU) ──────────────────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[CONFIG] Using device: {DEVICE}")

# ── INFERENCE SETTINGS ───────────────────────────────────────────────────────
WAVEFORM_LENGTH = 241  # Expected length of axial/shear waveforms
BATCH_SIZE = 1
INFERENCE_TIMEOUT = 30  # seconds
MAX_WORKERS = 4

# ── MATERIAL PRESETS (from frontend) ─────────────────────────────────────────
MATERIAL_PRESETS = {
    "Stainless Steel 304": {"E": 193, "ys": 205, "uts": 515, "nu": 0.28},
    "Aluminum Alloy 6061": {"E": 68.9, "ys": 276, "uts": 310, "nu": 0.33},
    "Ti-6Al-4V": {"E": 113.8, "ys": 880, "uts": 950, "nu": 0.34},
    "HEA (CoCrFeMnNi)": {"E": 214, "ys": 350, "uts": 640, "nu": 0.25},
    "Structural Steel A36": {"E": 200, "ys": 250, "uts": 400, "nu": 0.26},
    "Nickel Superalloy IN718": {"E": 200, "ys": 1100, "uts": 1375, "nu": 0.29},
}

# ── PHYSICS LOSS WEIGHTING ───────────────────────────────────────────────────
PHYSICS_LOSS_LAMBDA = 0.5  # Weight of physics constraints vs data loss

# ── COFFIN-MANSON PARAMETERS ────────────────────────────────────────────────
# These are typical values; adjust based on your material
COFFIN_MANSON = {
    "b": -0.095,      # Basquin exponent (elastic fatigue)
    "c": -0.56,       # Strain exponent (plastic fatigue)
    "sigma_f_prime": 500,  # Fatigue strength coefficient (MPa)
    "epsilon_f_prime": 0.5,  # Fatigue ductility coefficient
}

# ── NORMALIZATION RANGES ────────────────────────────────────────────────────
# Used to normalize material properties and waveforms
MATERIAL_NORM_RANGES = {
    "E": (10, 400),      # GPa
    "ys": (50, 2000),    # MPa
    "uts": (100, 2500),  # MPa
    "nu": (0.1, 0.5),    # dimensionless
}

WAVEFORM_NORM_RANGE = (-1.0, 1.0)  # Expected normalized range

# ── LOGGING ──────────────────────────────────────────────────────────────────
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

# ── API SETTINGS ─────────────────────────────────────────────────────────────
API_TITLE = "FatigueAI Physics-Informed Fatigue Life Prediction"
API_VERSION = "1.0.0"
API_DESCRIPTION = "Deep learning platform for multiaxial fatigue analysis"

# ── CORS ORIGINS (adjust for production) ────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

# ── MODEL ARCHITECTURE PARAMETERS ───────────────────────────────────────────
# These must match your training code
MODEL_CONFIG = {
    "input_size": 241,  # Waveform length
    "material_feature_size": 4,  # E, ys, uts, nu
    "lstm": {
        "hidden_size": 128,
        "num_layers": 2,
        "dropout": 0.2,
        "fc_hidden": 64,
        "output_size": 1,
    },
    "gru": {
        "hidden_size": 128,
        "num_layers": 2,
        "dropout": 0.2,
        "fc_hidden": 64,
        "output_size": 1,
    },
    "cnn": {
        "out_channels_1": 32,
        "out_channels_2": 64,
        "kernel_size": 5,
        "pool_size": 2,
        "fc_hidden": 64,
        "output_size": 1,
    }
}

print("[CONFIG] FatigueAI Backend Configuration Loaded")
print(f"  Models directory: {MODELS_DIR}")
print(f"  Device: {DEVICE}")
print(f"  Waveform length: {WAVEFORM_LENGTH}")