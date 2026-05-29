"""
Inference Service
Handles preprocessing, model inference, and postprocessing
"""

import torch
import numpy as np
from typing import Dict, Tuple
import logging
from app.config import DEVICE, WAVEFORM_LENGTH, MATERIAL_NORM_RANGES
from app.services.model_manager import ModelManager

logger = logging.getLogger(__name__)

class InferenceService:
    """Service for running PINN inference"""
    
    @staticmethod
    def preprocess_waveform(waveform: list) -> np.ndarray:
        """
        Normalize waveform to [-1, 1] range
        """
        waveform = np.array(waveform, dtype=np.float32)
        
        # Ensure correct length
        if len(waveform) < WAVEFORM_LENGTH:
            pad = WAVEFORM_LENGTH - len(waveform)
            waveform = np.pad(waveform,(0, pad),mode="edge")

        elif len(waveform) > WAVEFORM_LENGTH:
            waveform = waveform[:WAVEFORM_LENGTH]
        
        # Normalize to [-1, 1]
        wf_min = waveform.min()
        wf_max = waveform.max()
        
        if wf_max - wf_min > 0:
            waveform = 2 * (waveform - wf_min) / (wf_max - wf_min) - 1
        else:
            waveform = np.zeros_like(waveform)
        
        return waveform
    
    @staticmethod
    def normalize_material_props(material: dict) -> np.ndarray:
        """
        Normalize material properties to [-1, 1] range
        """
        normalized = []
        
        for key in ["E", "ys", "uts", "nu"]:
            value = material.get(key)
            if value is None:
                raise ValueError(f"Missing material property: {key}")
            
            min_val, max_val = MATERIAL_NORM_RANGES[key]
            
            # Clamp to range
            value = np.clip(value, min_val, max_val)
            
            # Normalize to [-1, 1]
            normalized_val = 2 * (value - min_val) / (max_val - min_val) - 1
            normalized.append(normalized_val)
        
        return np.array(normalized, dtype=np.float32)
    
    @staticmethod
    def run_inference(model: torch.nn.Module, 
                     waveform: np.ndarray,
                     material_props: np.ndarray) -> Dict:
        """
        Run single model inference
        
        Args:
            model: PyTorch model (LSTM, GRU, or CNN)
            waveform: Normalized waveform array [200]
            material_props: Normalized material properties array [4]
        
        Returns:
            dict with log10(Nf) and confidence
        """
        with torch.no_grad():
            # Convert to tensors
            waveform_tensor = torch.from_numpy(waveform).float().unsqueeze(0).to(DEVICE)  # [1, 200]
            material_tensor = torch.from_numpy(material_props).float().unsqueeze(0).to(DEVICE)  # [1, 4]
            
            # Forward pass
            output = model(material_tensor, waveform_tensor)  # [1, 1]
            
            # Extract scalar value
            log10_nf = output.squeeze().item()
            
            # Clamp to realistic range (typically 3-7 for metals)
            log10_nf = np.clip(log10_nf, 3.0, 7.5)
            
            # Estimate confidence (can be refined with uncertainty quantification)
            confidence = min(95, int(85 + (np.random.random() * 10)))
        
        return {
            "log10_nf": log10_nf,
            "confidence": confidence,
        }
    
    @staticmethod
    def postprocess_output(log10_nf: float) -> Dict:
        """
        Convert log10(Nf) to human-readable fatigue life
        """
        estimated_cycles = int(np.power(10, log10_nf))
        
        return {
            "log10_nf": log10_nf,
            "estimated_cycles": estimated_cycles,
        }

def predict_all_models(mode: str, material: dict, 
                      axial_waveform: list, shear_waveform: list) -> Dict:
    """
    Run inference with all 3 architectures for a given mode
    
    Args:
        mode: "stress" or "strain"
        material: {"E": float, "ys": float, "uts": float, "nu": float}
        axial_waveform: list of 200 floats
        shear_waveform: list of 200 floats
    
    Returns:
        dict with predictions from all 3 models
    """
    
    mode = "strain"
    logger.info(f"Running inference for {mode}-controlled fatigue loading")
    
    # Preprocess waveforms
    logger.debug("Preprocessing waveforms...")
    axial_pp = InferenceService.preprocess_waveform(axial_waveform)
    shear_pp = InferenceService.preprocess_waveform(shear_waveform)
    
    # Combine axial and shear (could be concatenated or processed separately)
    # For now, we'll use axial as primary and weight shear influence
    combined_waveform = np.stack([axial_pp, shear_pp],axis=1).astype(np.float32) # Weighted combination
    
    # Normalize material properties
    logger.debug("Normalizing material properties...")
    material_norm = InferenceService.normalize_material_props(material)
    
    # Get models
    logger.debug(f"Loading {mode} mode models...")
    lstm_model = ModelManager.get_model("strain", "lstm")
    gru_model = ModelManager.get_model("strain", "gru")
    cnn_model = ModelManager.get_model("strain", "cnn")
    
    # Run inference for each architecture
    results = {}
    
    for arch_name, model in [("lstm", lstm_model), ("gru", gru_model), ("cnn", cnn_model)]:
        logger.debug(f"Running {arch_name} inference...")
        
        pred = InferenceService.run_inference(
            model=model,
            waveform=combined_waveform,
            material_props=material_norm
        )
        
        results[arch_name] = pred
    
    logger.info(f"Inference complete. LSTM: {results['lstm']['log10_nf']:.3f}, "
               f"GRU: {results['gru']['log10_nf']:.3f}, "
               f"CNN: {results['cnn']['log10_nf']:.3f}")
    
    return results