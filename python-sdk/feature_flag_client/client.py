"""REST API client for Feature Flag Management System."""

import requests
from typing import Dict, List, Any, Optional
from .exceptions import FeatureFlagError, FlagNotFoundError, EvaluationError


class FeatureFlagClient:
    """Client for interacting with Feature Flag Management System via REST API."""

    def __init__(self, base_url: str = "http://localhost:3001/api", timeout: int = 10):
        """
        Initialize the Feature Flag client.

        Args:
            base_url: Base URL of the Feature Flag API
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def get_all_flags(self, environment: str = "development") -> List[Dict[str, Any]]:
        """
        Get all feature flags for an environment.

        Args:
            environment: Environment name (development, staging, production)

        Returns:
            List of feature flags

        Raises:
            FeatureFlagError: If the request fails
        """
        try:
            response = self.session.get(
                f"{self.base_url}/flags",
                params={"environment": environment},
                timeout=self.timeout,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise FeatureFlagError(f"Failed to get flags: {str(e)}")

    def get_flag(self, flag_id: str) -> Dict[str, Any]:
        """
        Get a specific feature flag by ID.

        Args:
            flag_id: Flag identifier

        Returns:
            Feature flag details

        Raises:
            FlagNotFoundError: If flag doesn't exist
            FeatureFlagError: If the request fails
        """
        try:
            response = self.session.get(
                f"{self.base_url}/flags/{flag_id}", timeout=self.timeout
            )
            if response.status_code == 404:
                raise FlagNotFoundError(f"Flag {flag_id} not found")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise FeatureFlagError(f"Failed to get flag: {str(e)}")

    def create_flag(self, flag_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new feature flag.

        Args:
            flag_data: Flag configuration

        Returns:
            Created flag details

        Raises:
            FeatureFlagError: If creation fails
        """
        try:
            response = self.session.post(
                f"{self.base_url}/flags", json=flag_data, timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise FeatureFlagError(f"Failed to create flag: {str(e)}")

    def update_flag(self, flag_id: str, flag_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing feature flag.

        Args:
            flag_id: Flag identifier
            flag_data: Updated flag configuration

        Returns:
            Updated flag details

        Raises:
            FlagNotFoundError: If flag doesn't exist
            FeatureFlagError: If update fails
        """
        try:
            response = self.session.put(
                f"{self.base_url}/flags/{flag_id}", json=flag_data, timeout=self.timeout
            )
            if response.status_code == 404:
                raise FlagNotFoundError(f"Flag {flag_id} not found")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise FeatureFlagError(f"Failed to update flag: {str(e)}")

    def delete_flag(self, flag_id: str) -> Dict[str, str]:
        """
        Delete a feature flag.

        Args:
            flag_id: Flag identifier

        Returns:
            Deletion confirmation

        Raises:
            FlagNotFoundError: If flag doesn't exist
            FeatureFlagError: If deletion fails
        """
        try:
            response = self.session.delete(
                f"{self.base_url}/flags/{flag_id}", timeout=self.timeout
            )
            if response.status_code == 404:
                raise FlagNotFoundError(f"Flag {flag_id} not found")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise FeatureFlagError(f"Failed to delete flag: {str(e)}")

    def toggle_flag(self, flag_id: str) -> Dict[str, Any]:
        """
        Toggle a feature flag on/off.

        Args:
            flag_id: Flag identifier

        Returns:
            Updated flag details

        Raises:
            FlagNotFoundError: If flag doesn't exist
            FeatureFlagError: If toggle fails
        """
        try:
            response = self.session.patch(
                f"{self.base_url}/flags/{flag_id}/toggle", timeout=self.timeout
            )
            if response.status_code == 404:
                raise FlagNotFoundError(f"Flag {flag_id} not found")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise FeatureFlagError(f"Failed to toggle flag: {str(e)}")

    def kill_switch(self, flag_id: str, reason: str) -> Dict[str, Any]:
        """
        Activate kill switch for a flag (emergency disable).

        Args:
            flag_id: Flag identifier
            reason: Reason for kill switch activation

        Returns:
            Kill switch confirmation

        Raises:
            FlagNotFoundError: If flag doesn't exist
            FeatureFlagError: If kill switch fails
        """
        try:
            response = self.session.post(
                f"{self.base_url}/flags/{flag_id}/kill-switch",
                json={"reason": reason},
                timeout=self.timeout,
            )
            if response.status_code == 404:
                raise FlagNotFoundError(f"Flag {flag_id} not found")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise FeatureFlagError(f"Failed to activate kill switch: {str(e)}")

    def evaluate_flag(
        self, flag_id: str, user_id: Optional[str] = None, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate a feature flag for a user/context.

        Args:
            flag_id: Flag identifier
            user_id: User identifier
            context: Evaluation context (IP, device, custom fields)

        Returns:
            Evaluation result with enabled status and reason

        Raises:
            EvaluationError: If evaluation fails
        """
        try:
            response = self.session.post(
                f"{self.base_url}/evaluate",
                json={"flagId": flag_id, "userId": user_id, "context": context or {}},
                timeout=self.timeout,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise EvaluationError(f"Failed to evaluate flag: {str(e)}")

    def bulk_evaluate(
        self, flag_ids: List[str], user_id: Optional[str] = None, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        Evaluate multiple flags at once.

        Args:
            flag_ids: List of flag identifiers
            user_id: User identifier
            context: Evaluation context

        Returns:
            Dictionary mapping flag IDs to evaluation results

        Raises:
            EvaluationError: If bulk evaluation fails
        """
        try:
            response = self.session.post(
                f"{self.base_url}/evaluate/bulk",
                json={"flagIds": flag_ids, "userId": user_id, "context": context or {}},
                timeout=self.timeout,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise EvaluationError(f"Failed to bulk evaluate flags: {str(e)}")

    def get_analytics(self, flag_id: str, time_range: str = "24h") -> Dict[str, Any]:
        """
        Get analytics for a specific flag.

        Args:
            flag_id: Flag identifier
            time_range: Time range (1h, 24h, 7d, 30d)

        Returns:
            Analytics data with stats and timeline

        Raises:
            FeatureFlagError: If request fails
        """
        try:
            response = self.session.get(
                f"{self.base_url}/analytics/flags/{flag_id}",
                params={"timeRange": time_range},
                timeout=self.timeout,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise FeatureFlagError(f"Failed to get analytics: {str(e)}")

    def get_system_metrics(self) -> Dict[str, int]:
        """
        Get system-wide metrics.

        Returns:
            System metrics (total flags, enabled flags, etc.)

        Raises:
            FeatureFlagError: If request fails
        """
        try:
            response = self.session.get(
                f"{self.base_url}/analytics/metrics", timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise FeatureFlagError(f"Failed to get system metrics: {str(e)}")

    def close(self):
        """Close the HTTP session."""
        self.session.close()

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()