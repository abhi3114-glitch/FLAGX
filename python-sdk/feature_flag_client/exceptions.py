"""Custom exceptions for Feature Flag client."""


class FeatureFlagError(Exception):
    """Base exception for Feature Flag client errors."""
    pass


class FlagNotFoundError(FeatureFlagError):
    """Exception raised when a flag is not found."""
    pass


class EvaluationError(FeatureFlagError):
    """Exception raised when flag evaluation fails."""
    pass


class ConnectionError(FeatureFlagError):
    """Exception raised when connection to server fails."""
    pass


class ValidationError(FeatureFlagError):
    """Exception raised when input validation fails."""
    pass