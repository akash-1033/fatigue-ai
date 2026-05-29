import logging
from pathlib import Path
from typing import Dict

import torch
import torch.nn as nn
import torch.nn.functional as F

from app.config import DEVICE, MODEL_PATHS

logger = logging.getLogger(__name__)

# =========================================================
# SHARED DNN BLOCK
# =========================================================

class DNNModel(nn.Module):

    def __init__(self, dim_num=4):
        super().__init__()

        self.bn = nn.BatchNorm1d(dim_num)

        self.lin1 = nn.Linear(dim_num, 200)
        self.lin2 = nn.Linear(200, 100)
        self.lin3 = nn.Linear(100, 100)

    def forward(self, x):

        x = self.bn(x)

        x = F.relu(self.lin1(x))
        x = F.relu(self.lin2(x))
        x = F.relu(self.lin3(x))

        return x


# =========================================================
# ATTENTION BLOCK
# =========================================================

class AttentionBlock(nn.Module):

    def __init__(self, embed_dim=100):
        super().__init__()

        self.self_attn = nn.MultiheadAttention(
            embed_dim=embed_dim,
            num_heads=2,
            batch_first=True
        )

        self.linear1 = nn.Linear(embed_dim, 2048)

        self.linear2 = nn.Linear(2048, embed_dim)

        self.norm1 = nn.LayerNorm(embed_dim)

        self.norm2 = nn.LayerNorm(embed_dim)

    def forward(self, x):

        attn_output, _ = self.self_attn(x, x, x)

        x = self.norm1(x + attn_output)

        ff = F.relu(self.linear1(x))

        ff = self.linear2(ff)

        x = self.norm2(x + ff)

        return x


# =========================================================
# LSTM BLOCK
# =========================================================

class LSTMBlock(nn.Module):

    def __init__(self):
        super().__init__()

        self.lstm = nn.LSTM(
            input_size=2,
            hidden_size=5,
            batch_first=True
        )

        self.flatten = nn.Flatten()

        self.lin1 = nn.Linear(241 * 5, 100)

    def forward(self, x):

        x, _ = self.lstm(x)

        x = self.flatten(x)

        x = self.lin1(x)

        return x


# =========================================================
# GRU BLOCK
# =========================================================

class GRUBlock(nn.Module):

    def __init__(self):
        super().__init__()

        self.gru = nn.GRU(
            input_size=2,
            hidden_size=5,
            batch_first=True
        )

        self.lin1 = nn.Linear(241 * 5, 100)

    def forward(self, x):

        x, _ = self.gru(x)

        x = x.reshape(x.size(0), -1)

        x = self.lin1(x)

        return x


# =========================================================
# CNN BLOCK
# =========================================================

class CNNBlock(nn.Module):

    def __init__(self):
        super().__init__()

        self.conv1 = nn.Conv1d(
            in_channels=2,
            out_channels=50,
            kernel_size=3,
            padding=1
        )

        self.conv2 = nn.Conv1d(
            in_channels=50,
            out_channels=50,
            kernel_size=3,
            padding=1
        )

        self.flatten = nn.Flatten()

        self.lin1 = nn.Linear(12050, 100)

    def forward(self, x):

        x = x.permute(0, 2, 1)

        x = F.relu(self.conv1(x))

        x = F.relu(self.conv2(x))

        x = self.flatten(x)

        x = self.lin1(x)

        return x


# =========================================================
# BIG LSTM MODEL
# =========================================================

class BigLSTMModel(nn.Module):

    def __init__(self, dim_num=4):
        super().__init__()

        self.strct_block = DNNModel(dim_num)

        self.lstm_block = LSTMBlock()

        self.att = AttentionBlock()

        self.lin1 = nn.Linear(200, 100)

        self.lin2 = nn.Linear(100, 100)

        self.out = nn.Linear(100, 1)

    def forward(self, b_x, b_x_csv):

        x_strct = self.strct_block(b_x)

        x_lstm = self.lstm_block(b_x_csv)

        x = torch.stack((x_strct, x_lstm), dim=1)

        # x = self.att(x)

        x = x.reshape(x.size(0), -1)

        x = F.relu(self.lin1(x))

        x = F.relu(self.lin2(x))

        x = self.out(x)

        return x


# =========================================================
# BIG GRU MODEL
# =========================================================

class BigGRUModel(nn.Module):

    def __init__(self, dim_num=4):
        super().__init__()

        self.strct_block = DNNModel(dim_num)

        self.gru_block = GRUBlock()

        self.lin1 = nn.Linear(200, 100)

        self.lin2 = nn.Linear(100, 100)

        self.out = nn.Linear(100, 1)

    def forward(self, b_x, b_x_csv):

        x_strct = self.strct_block(b_x)

        x_gru = self.gru_block(b_x_csv)

        x = torch.stack((x_strct, x_gru), dim=1)

        x = x.reshape(x.size(0), -1)

        x = F.relu(self.lin1(x))

        x = F.relu(self.lin2(x))

        x = self.out(x)

        return x


# =========================================================
# BIG CNN MODEL
# =========================================================

class BigCNNModel(nn.Module):

    def __init__(self, dim_num=4):
        super().__init__()

        self.strct_block = DNNModel(dim_num)

        self.cnn_block = CNNBlock()

        self.lin1 = nn.Linear(200, 100)

        self.lin2 = nn.Linear(100, 100)

        self.out = nn.Linear(100, 1)

    def forward(self, b_x, b_x_csv):

        x_strct = self.strct_block(b_x)

        x_cnn = self.cnn_block(b_x_csv)

        x = torch.stack((x_strct, x_cnn), dim=1)

        x = x.reshape(x.size(0), -1)

        x = F.relu(self.lin1(x))

        x = F.relu(self.lin2(x))

        x = self.out(x)

        return x


# =========================================================
# MODEL MANAGER
# =========================================================

class ModelManager:

    _models: Dict = {}

    _loaded = False

    @classmethod
    def load_all_models(cls):

        logger.info("=" * 80)

        logger.info("Loading fatigue models")

        logger.info("=" * 80)

        for mode in ["strain", "stress"]:

            for arch in ["lstm", "gru", "cnn"]:

                key = f"{mode}_{arch}"

                path = MODEL_PATHS[key]

                logger.info(f"Loading {key}")

                if not Path(path).exists():

                    raise FileNotFoundError(
                        f"Missing model: {path}"
                    )

                try:

                    model = cls._create_architecture(arch)

                    state_dict = torch.load(
                        path,
                        map_location=DEVICE
                    )

                    print("LOADING:", key)
                    print("PATH:", path)
                    model.load_state_dict(state_dict, strict=False)

                    model.to(DEVICE)

                    model.eval()

                    cls._models[key] = model

                    logger.info(f" Loaded {key}")

                except Exception as e:
                    print(f"FAILED {key}")
                    print(e)
                    continue

        cls._loaded = True

        logger.info("=" * 80)

        logger.info("All models loaded")

        logger.info("=" * 80)

    @classmethod
    def _create_architecture(cls, arch):

        if arch == "lstm":
            return BigLSTMModel()

        elif arch == "gru":
            return BigGRUModel()

        elif arch == "cnn":
            return BigCNNModel()

        else:
            raise ValueError(f"Unknown architecture: {arch}")

    @classmethod
    def get_model(cls, mode, architecture):

        key = f"{mode}_{architecture}"

        if key not in cls._models:

            raise ValueError(
                f"Model {key} not loaded"
            )

        return cls._models[key]

    @classmethod
    def is_ready(cls):

        return cls._loaded and len(cls._models) == 6
