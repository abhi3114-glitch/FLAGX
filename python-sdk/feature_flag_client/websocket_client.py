"""WebSocket client for real-time Feature Flag updates."""

import json
import threading
from typing import Callable, Optional, Dict, Any
from websocket import WebSocketApp
from .exceptions import ConnectionError


class WebSocketClient:
    """Client for receiving real-time feature flag updates via WebSocket."""

    def __init__(self, url: str = "ws://localhost:3001/ws"):
        """
        Initialize WebSocket client.

        Args:
            url: WebSocket server URL
        """
        self.url = url
        self.ws = None
        self.connected = False
        self.thread = None
        self._on_flag_update_callback = None
        self._on_message_callback = None
        self._on_error_callback = None

    def on_flag_update(self, callback: Callable[[Dict[str, Any]], None]):
        """
        Register callback for flag update events.

        Args:
            callback: Function to call when a flag is updated
                     Receives dict with 'action', 'flag', and 'timestamp'
        """
        self._on_flag_update_callback = callback

    def on_message(self, callback: Callable[[Dict[str, Any]], None]):
        """
        Register callback for all WebSocket messages.

        Args:
            callback: Function to call for any message
        """
        self._on_message_callback = callback

    def on_error(self, callback: Callable[[Exception], None]):
        """
        Register callback for WebSocket errors.

        Args:
            callback: Function to call on errors
        """
        self._on_error_callback = callback

    def connect(self):
        """Establish WebSocket connection."""
        try:
            self.ws = WebSocketApp(
                self.url,
                on_open=self._on_open,
                on_message=self._on_message,
                on_error=self._on_error,
                on_close=self._on_close,
            )

            self.thread = threading.Thread(target=self.ws.run_forever, daemon=True)
            self.thread.start()

        except Exception as e:
            raise ConnectionError(f"Failed to connect to WebSocket: {str(e)}")

    def disconnect(self):
        """Close WebSocket connection."""
        if self.ws:
            self.ws.close()
        self.connected = False

    def _on_open(self, ws):
        """Handle WebSocket connection opened."""
        self.connected = True
        print("WebSocket connected")

    def _on_message(self, ws, message):
        """Handle incoming WebSocket message."""
        try:
            data = json.loads(message)

            # Call general message callback
            if self._on_message_callback:
                self._on_message_callback(data)

            # Handle flag update events
            if data.get("type") == "flag_update" and self._on_flag_update_callback:
                self._on_flag_update_callback(data)

        except json.JSONDecodeError as e:
            print(f"Failed to parse WebSocket message: {e}")

    def _on_error(self, ws, error):
        """Handle WebSocket error."""
        print(f"WebSocket error: {error}")
        if self._on_error_callback:
            self._on_error_callback(error)

    def _on_close(self, ws, close_status_code, close_msg):
        """Handle WebSocket connection closed."""
        self.connected = False
        print(f"WebSocket disconnected: {close_status_code} - {close_msg}")

    def is_connected(self) -> bool:
        """Check if WebSocket is connected."""
        return self.connected

    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()