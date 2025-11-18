"""
Feature Flag Management System - Python SDK

A Python client library for interacting with the Feature Flag Management System.
Supports REST API, WebSocket, and gRPC protocols.
"""

from .client import FeatureFlagClient
from .grpc_client import GrpcFeatureFlagClient
from .websocket_client import WebSocketClient
from .exceptions import (
    FeatureFlagError,
    FlagNotFoundError,
    EvaluationError,
    ConnectionError,
)

__version__ = "1.0.0"
__all__ = [
    "FeatureFlagClient",
    "GrpcFeatureFlagClient",
    "WebSocketClient",
    "FeatureFlagError",
    "FlagNotFoundError",
    "EvaluationError",
    "ConnectionError",
]