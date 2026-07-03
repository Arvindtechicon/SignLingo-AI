import os
import cv2
import json
import time
import math
from datetime import datetime
import mediapipe as mp

class HandTracker:
    def __init__(self, max_num_hands=2, min_detection_confidence=0.5):
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=max_num_hands,
            min_detection_confidence=min_detection_confidence
        )

    def detect(self, frame):
        # Convert BGR frame to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)
        return results

    def draw(self, frame, results):
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                self.mp_drawing.draw_landmarks(
                    frame, 
                    hand_landmarks, 
                    self.mp_hands.HAND_CONNECTIONS
                )
        return frame

    def get_landmarks(self, results):
        landmarks_list = []
        if results.multi_hand_landmarks:
            for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                hand_data = []
                for lm_id, lm in enumerate(hand_landmarks.landmark):
                    hand_data.append({
                        "id": lm_id,
                        "x": lm.x,
                        "y": lm.y,
                        "z": lm.z
                    })
                landmarks_list.append(hand_data)
        return landmarks_list

def run_tracker_gui():
    print("Initializing Hand Tracker Webcam Feed...")
    tracker = HandTracker()
    
    # Initialize webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam. Checking alternative ports...")
        cap = cv2.VideoCapture(1)
        if not cap.isOpened():
            print("Critical Error: Webcam initialization failed completely.")
            return

    # Create captures directory
    captures_dir = "d:/Infosys project/captures"
    os.makedirs(captures_dir, exist_ok=True)
    capture_count = len(os.listdir(captures_dir))

    prev_time = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab webcam frame.")
            break
            
        # Flip the frame horizontally for mirror effect
        frame = cv2.flip(frame, 1)
        
        # 1. Run Detection
        results = tracker.detect(frame)
        
        # 2. Draw Landmarks
        frame = tracker.draw(frame, results)
        
        # 3. Extract Landmark List
        landmarks = tracker.get_landmarks(results)
        num_hands = len(landmarks)

        # 4. Calculate FPS
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time) if prev_time > 0 else 0.0
        prev_time = curr_time

        # 5. Draw Information Overlays on Screen (FPS, Hand Count)
        cv2.putText(frame, f"FPS: {int(fps)}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (10, 191, 80), 2)
        
        if num_hands > 0:
            cv2.putText(frame, f"Hands: {num_hands}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (10, 191, 80), 2)
            
            # Print coordinates of Hand 1 to console for verification
            print(f"\n--- Frame Hand Coordinates ---")
            for idx, lm in enumerate(landmarks[0]):
                if idx <= 5:  # Only print first few to keep terminal readable
                    print(f"Landmark {lm['id']}: x={lm['x']:.3f} y={lm['y']:.3f} z={lm['z']:.3f}")
            print("...")

            # BONUS CHALLENGE: Euclidean distance between Thumb Tip (4) and Index Tip (8)
            thumb_tip = landmarks[0][4]
            index_tip = landmarks[0][8]
            
            # Convert normalized values back to pixel space for distance rendering
            h, w, _ = frame.shape
            pt1 = (int(thumb_tip['x'] * w), int(thumb_tip['y'] * h))
            pt2 = (int(index_tip['x'] * w), int(index_tip['y'] * h))
            
            # Calculate Euclidean distance
            distance = math.sqrt(
                (thumb_tip['x'] - index_tip['x'])**2 + 
                (thumb_tip['y'] - index_tip['y'])**2 + 
                (thumb_tip['z'] - index_tip['z'])**2
            )
            
            # Draw line and distance
            cv2.line(frame, pt1, pt2, (255, 100, 0), 2)
            cv2.putText(frame, f"Tip Dist: {distance:.3f}", (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 100, 0), 2)
        else:
            cv2.putText(frame, "No Hand Detected", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # 6. Render Frame
        cv2.imshow("SignLingo-AI: Hand Tracker Debugger", frame)
        
        key = cv2.waitKey(1) & 0xFF
        
        # 'S' key: Save current hand coordinates to JSON
        if key == ord('s') or key == ord('S'):
            if num_hands > 0:
                capture_count += 1
                filename = os.path.join(captures_dir, f"capture_{capture_count:03d}.json")
                
                payload = {
                    "timestamp": datetime.now().isoformat(),
                    "hand_count": num_hands,
                    "hands": landmarks
                }
                
                with open(filename, "w") as f:
                    json.dump(payload, f, indent=4)
                print(f"\n[SAVED] Saved hand landmarks to: {filename}")
            else:
                print("\n[WARNING] Cannot save: No hands visible in camera frame.")

        # 'Q' key: Graceful shutdown
        elif key == ord('q') or key == ord('Q'):
            print("Webcam closed gracefully by user command.")
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_tracker_gui()
