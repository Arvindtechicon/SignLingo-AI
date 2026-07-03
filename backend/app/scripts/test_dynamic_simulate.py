import os
import sys
import json
from fastapi.testclient import TestClient

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.main import app
from app.services.assessment import REFERENCE_WORDS

def main():
    print("Starting simulated dynamic gesture assessment test...")
    
    # Check if 'drink' is loaded
    if 'drink' not in REFERENCE_WORDS:
        print("Error: 'drink' reference not found in templates.")
        return

    drink_frames = REFERENCE_WORDS['drink']
    print(f"Loaded 'drink' template containing {len(drink_frames)} frames.")
    
    client = TestClient(app)
    
    # Establish WebSocket connection
    print("Connecting to WebSocket endpoint...")
    with client.websocket_connect("/api/v1/gestures/ws/1/sign_drink") as ws:
        # Stream each frame from the reference template
        frames_sent = 0
        for frame in drink_frames:
            # Re-format frame to match frontend output structure
            hands_data = []
            for hand in frame.get("hands", []):
                points_data = []
                # In reference_words, points is [[x,y,z], ...]
                for pt in hand.get("points", []):
                    points_data.append({"x": pt[0], "y": pt[1], "z": pt[2]})
                
                hands_data.append({
                    "hand_label": hand.get("hand_label", "Right"),
                    "points": points_data
                })
            
            # Send FRAME message if hands are present (just like frontend)
            # Or always send frame
            frame_payload = {
                "type": "FRAME",
                "data": {
                    "timestamp": 1719600000000 + (frames_sent * 33), # ~30fps
                    "hands": hands_data
                }
            }
            ws.send_json(frame_payload)
            frames_sent += 1
            
        print(f"Streamed {frames_sent} coordinates frames to WebSocket.")
        
        # Stop recording and request assessment
        print("Sending STOP_RECORDING message...")
        ws.send_json({"type": "STOP_RECORDING"})
        
        # Wait for assessment result
        response = ws.receive_json()
        print("\n--- Assessment Result Received ---")
        print(json.dumps(response, indent=2))
        print("-----------------------------------")
        
        # Assertions
        assert response["type"] == "ASSESSMENT_RESULT"
        score = response["payload"]["score"]
        print(f"\nSimulated attempt achieved score: {score}%")
        assert score == 100.0, f"Expected perfect 100.0% score for exact match, got {score}%"
        print("Dynamic gesture assessment verification PASSED successfully!")

if __name__ == "__main__":
    main()
