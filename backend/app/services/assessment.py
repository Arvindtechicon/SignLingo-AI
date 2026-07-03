import json
import os
import numpy as np
from pathlib import Path
from scipy.spatial import procrustes
from typing import Dict, Any, List, Optional

RESOURCES_DIR = Path(__file__).resolve().parent.parent / "resources"

# Load templates
try:
    with open(RESOURCES_DIR / "reference_letters.json", "r") as f:
        REFERENCE_LETTERS = json.load(f)
except Exception as e:
    print(f"Error loading reference_letters.json: {e}")
    REFERENCE_LETTERS = {}

try:
    with open(RESOURCES_DIR / "reference_words.json", "r") as f:
        REFERENCE_WORDS = json.load(f)
except Exception as e:
    print(f"Error loading reference_words.json: {e}")
    REFERENCE_WORDS = {}

def normalize_sign_id(sign_id: str) -> str:
    if sign_id.startswith("sign_"):
        return sign_id[5:]
    return sign_id

class AssessmentEngine:
    
    @staticmethod
    async def check_sign_type_static(sign_id: str) -> bool:
        norm_id = normalize_sign_id(sign_id)
        if norm_id in REFERENCE_LETTERS:
            return True
        if norm_id in REFERENCE_WORDS:
            return False
        return len(norm_id) == 1

    @staticmethod
    def points_to_array(points: List[Any]) -> np.ndarray:
        if isinstance(points, np.ndarray):
            return points
        if points is None or len(points) == 0:
            return np.zeros((0, 3))
        if isinstance(points[0], dict):
            return np.array([[p.get('x', 0.0), p.get('y', 0.0), p.get('z', 0.0)] for p in points])
        elif isinstance(points[0], (list, tuple)):
            return np.array(points)
        else:
            raise ValueError(f"Unknown point format: {type(points[0])}")


    @staticmethod
    def normalize_hand_landmarks(points: List[Any]) -> np.ndarray:
        arr = AssessmentEngine.points_to_array(points)
        if arr.shape != (21, 3):
            if arr.shape[0] < 21:
                padding = np.zeros((21 - arr.shape[0], 3))
                arr = np.vstack([arr, padding])
            elif arr.shape[0] > 21:
                arr = arr[:21]
        
        wrist = arr[0]
        arr_centered = arr - wrist
        
        scale_factor = np.linalg.norm(arr_centered[9])
        if scale_factor > 0:
            arr_normalized = arr_centered / scale_factor
        else:
            arr_normalized = arr_centered
            
        return arr_normalized

    @classmethod
    async def evaluate_static(cls, frame: Dict[str, Any], target_sign_id: str) -> (float, str):
        hands = frame.get("hands", [])
        if not hands:
            return 0.0, "No hands detected in webcam canvas boundaries."
            
        candidate_pts = cls.normalize_hand_landmarks(hands[0]["points"])
        
        raw_ref_pts = await cls.get_reference_landmarks(target_sign_id)
        if raw_ref_pts is None:
            return 0.0, "Reference sign landmarks database entry missing."
            
        reference_pts = cls.normalize_hand_landmarks(raw_ref_pts)
        
        cosine_sim = cls.compute_cosine_similarity(candidate_pts, reference_pts)
        # Procrustes shape comparison
        try:
            _, _, disparity = procrustes(reference_pts, candidate_pts)
        except ValueError:
            disparity = 1.0

        
        procrustes_score = max(0.0, min(100.0, (1.0 - disparity) * 100))
        cosine_score = max(0.0, min(100.0, cosine_sim * 100))
        
        final_score = (0.4 * cosine_score) + (0.6 * procrustes_score)
        
        feedback = cls.generate_joint_feedback(candidate_pts, reference_pts)
        return round(final_score, 1), feedback

    @classmethod
    def compute_cosine_similarity(cls, a: np.ndarray, b: np.ndarray) -> float:
        a_flat = a.flatten()
        b_flat = b.flatten()
        dot_prod = np.dot(a_flat, b_flat)
        norm_a = np.linalg.norm(a_flat)
        norm_b = np.linalg.norm(b_flat)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(dot_prod / (norm_a * norm_b))

    @classmethod
    async def evaluate_dynamic(cls, sequence: List[Dict[str, Any]], target_sign_id: str) -> (float, str):
        candidate_frames = []
        for frame in sequence:
            hands = frame.get("hands", [])
            if hands:
                norm_pts = cls.normalize_hand_landmarks(hands[0]["points"])
                candidate_frames.append(norm_pts.flatten())
                
        if not candidate_frames:
            return 0.0, "No valid sequences identified."
            
        ref_sequence = await cls.get_reference_sequence(target_sign_id)
        if ref_sequence is None:
            return 0.0, "Reference sign sequence missing."
            
        dtw_dist = cls.compute_dtw(candidate_frames, ref_sequence)
        
        max_acceptable_dist = 5.0 * len(ref_sequence)
        dtw_score = max(0.0, min(100.0, (1.0 - (dtw_dist / max_acceptable_dist)) * 100))
        
        return round(dtw_score, 1), "Sequence velocity matching completed successfully."

    @classmethod
    def compute_dtw(cls, s1: List[np.ndarray], s2: List[np.ndarray]) -> float:
        N, M = len(s1), len(s2)
        cost_matrix = np.zeros((N, M))
        
        cost_matrix[0, 0] = np.linalg.norm(s1[0] - s2[0])
        
        for i in range(1, N):
            cost_matrix[i, 0] = cost_matrix[i-1, 0] + np.linalg.norm(s1[i] - s2[0])
        for j in range(1, M):
            cost_matrix[0, j] = cost_matrix[0, j-1] + np.linalg.norm(s1[0] - s2[j])
            
        for i in range(1, N):
            for j in range(1, M):
                diff = np.linalg.norm(s1[i] - s2[j])
                cost_matrix[i, j] = diff + min(
                    cost_matrix[i-1, j],
                    cost_matrix[i, j-1],
                    cost_matrix[i-1, j-1]
                )
        return float(cost_matrix[N-1, M-1])

    @staticmethod
    def generate_joint_feedback(candidate: np.ndarray, reference: np.ndarray) -> str:
        tips = [4, 8, 12, 16, 20]
        mcps = [2, 5, 9, 13, 17]
        errors = []
        for tip, mcp in zip(tips, mcps):
            c_vec = candidate[tip] - candidate[mcp]
            r_vec = reference[tip] - reference[mcp]
            norm_c = np.linalg.norm(c_vec)
            norm_r = np.linalg.norm(r_vec)
            if norm_c == 0 or norm_r == 0:
                continue
            cos = np.dot(c_vec, r_vec) / (norm_c * norm_r)
            if cos < 0.85:
                finger_names = {1: "Thumb", 2: "Index finger", 3: "Middle finger", 4: "Ring finger", 5: "Pinky"}
                errors.append(f"{finger_names[tip // 4]} joint alignment error")
                
        if errors:
            return "Adjust position: " + ", ".join(errors[:2]) + "."
        return "Excellent hand pose matching."

    @staticmethod
    async def get_reference_landmarks(sign_id: str) -> Optional[np.ndarray]:
        norm_id = normalize_sign_id(sign_id)
        if norm_id in REFERENCE_LETTERS:
            return np.array(REFERENCE_LETTERS[norm_id])
        return None

    @classmethod
    async def get_reference_sequence(cls, sign_id: str) -> Optional[List[np.ndarray]]:
        norm_id = normalize_sign_id(sign_id)
        if norm_id not in REFERENCE_WORDS:
            return None
        
        ref_frames = REFERENCE_WORDS[norm_id]
        ref_sequence = []
        for frame in ref_frames:
            hands = frame.get("hands", [])
            if hands:
                norm_pts = cls.normalize_hand_landmarks(hands[0]["points"])
                ref_sequence.append(norm_pts.flatten())
                
        return ref_sequence
