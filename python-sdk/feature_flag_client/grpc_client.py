"""gRPC client for Feature Flag Management System."""

import grpc
from typing import Dict, Any, Optional
from .exceptions import FeatureFlagError, FlagNotFoundError, ConnectionError

try:
    from . import feature_flag_pb2
    from . import feature_flag_pb2_grpc
except ImportError:
    # If protobuf files don't exist, provide instructions
    feature_flag_pb2 = None
    feature_flag_pb2_grpc = None


class GrpcFeatureFlagClient:
    """Client for interacting with Feature Flag Management System via gRPC."""

    def __init__(self, host: str = "localhost", port: int = 50051):
        """
        Initialize the gRPC Feature Flag client.

        Args:
            host: gRPC server host
            port: gRPC server port
        """
        if feature_flag_pb2 is None or feature_flag_pb2_grpc is None:
            raise ImportError(
                "gRPC protobuf files not found. Generate them using:\n"
                "python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. feature_flag.proto"
            )

        self.host = host
        self.port = port
        self.channel = None
        self.stub = None

    def connect(self):
        """Establish connection to gRPC server."""
        try:
            self.channel = grpc.insecure_channel(f"{self.host}:{self.port}")
            self.stub = feature_flag_pb2_grpc.FeatureFlagServiceStub(self.channel)
        except Exception as e:
            raise ConnectionError(f"Failed to connect to gRPC server: {str(e)}")

    def disconnect(self):
        """Close the gRPC channel."""
        if self.channel:
            self.channel.close()

    def evaluate_flag(
        self,
        flag_id: str,
        user_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Evaluate a feature flag via gRPC.

        Args:
            flag_id: Flag identifier
            user_id: User identifier
            context: Evaluation context

        Returns:
            Dictionary with 'enabled' and 'reason' keys

        Raises:
            FlagNotFoundError: If flag doesn't exist
            FeatureFlagError: If evaluation fails
        """
        if not self.stub:
            self.connect()

        try:
            import json

            request = feature_flag_pb2.EvaluateRequest(
                flag_id=flag_id,
                user_id=user_id or "",
                context=json.dumps(context or {}),
            )

            response = self.stub.EvaluateFlag(request)

            return {"enabled": response.enabled, "reason": response.reason}

        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.NOT_FOUND:
                raise FlagNotFoundError(f"Flag {flag_id} not found")
            raise FeatureFlagError(f"gRPC evaluation failed: {str(e)}")

    def get_flag(self, flag_id: str) -> Dict[str, Any]:
        """
        Get flag details via gRPC.

        Args:
            flag_id: Flag identifier

        Returns:
            Flag details dictionary

        Raises:
            FlagNotFoundError: If flag doesn't exist
            FeatureFlagError: If request fails
        """
        if not self.stub:
            self.connect()

        try:
            import json

            request = feature_flag_pb2.GetFlagRequest(flag_id=flag_id)
            response = self.stub.GetFlag(request)

            return {
                "id": response.id,
                "name": response.name,
                "description": response.description,
                "enabled": response.enabled,
                "environment": response.environment,
                "rules": json.loads(response.rules) if response.rules else [],
            }

        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.NOT_FOUND:
                raise FlagNotFoundError(f"Flag {flag_id} not found")
            raise FeatureFlagError(f"gRPC request failed: {str(e)}")

    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()