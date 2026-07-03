import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

@pytest.fixture
def mock_session():
    # Setup mock PostgreSQL Session Local
    session = MagicMock()
    return session

@patch("app.routers.websocket.SessionLocal")
def test_websocket_gesture_assessment_workflow(mock_session_class, mock_session):
    mock_session_class.return_value = mock_session
    client = TestClient(app)
    
    # Establish mocked WebSocket Connection
    with client.websocket_connect("/api/v1/gestures/ws/1/sign_A") as ws:
        frame_payload = {
            "type": "FRAME",
            "data": {
                "timestamp": 1719600000000,
                "hands": [
                    {
                        "hand_label": "Right",
                        "points": [{"x": float(i) / 21.0, "y": float(i) / 10.0, "z": 0.0} for i in range(21)]
                    }
                ],
                "pose": [{"x": 0.0, "y": 0.0, "z": 0.0} for _ in range(33)]
            }
        }


        ws.send_json(frame_payload)
        
        ws.send_json({"type": "STOP_RECORDING"})
        
        response = ws.receive_json()
        print("DEBUG WS RESPONSE:", response)
        assert response["type"] == "ASSESSMENT_RESULT", f"Expected ASSESSMENT_RESULT, got {response['type']} with payload: {response.get('payload')}"

        assert "score" in response["payload"]
        assert "is_correct" in response["payload"]
        assert "feedback" in response["payload"]
        
        # Verify attempt log was added and committed to PostgreSQL
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
