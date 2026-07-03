import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from collections import deque
from app.services.assessment import AssessmentEngine
from app.db.session import SessionLocal
from app.db import models
import datetime
import json

router = APIRouter(prefix="/api/v1/gestures", tags=["gestures"])

MAX_BUFFER_FRAMES = 90

class CoordinatePoint(BaseModel):
    x: float
    y: float
    z: float

class HandLandmarkData(BaseModel):
    hand_label: str
    points: List[CoordinatePoint]

class FramePayload(BaseModel):
    timestamp: int
    hands: List[HandLandmarkData]
    pose: Optional[List[CoordinatePoint]] = None


class SessionState:
    def __init__(self):
        self.frame_buffer = deque(maxlen=MAX_BUFFER_FRAMES)
        self.is_recording = False

@router.websocket("/ws/{user_id}/{sign_id}")
async def gesture_websocket_endpoint(websocket: WebSocket, user_id: int, sign_id: str):
    await websocket.accept()
    session = SessionState()
    db = SessionLocal()
    
    try:
        while True:
            raw_data = await websocket.receive_text()
            message = json.loads(raw_data)
            msg_type = message.get("type")
            
            if msg_type == "FRAME":
                payload = FramePayload(**message.get("data", {}))
                session.frame_buffer.append(payload.model_dump())
                
            elif msg_type == "STOP_RECORDING":
                if not session.frame_buffer:
                    await websocket.send_json({
                        "type": "ERROR",
                        "payload": "No tracking data captured."
                    })
                    continue
                score, feedback = await run_assessment(session.frame_buffer, sign_id)
                score = float(score)
                is_correct = bool(score >= 80.0)

                
                # Write log directly to PostgreSQL utilizing JSONB column
                attempt_log = models.AttemptLog(
                    user_id=user_id,
                    sign_id=sign_id,
                    score=score,
                    is_correct=is_correct,
                    feedback=feedback,
                    landmarks_series=list(session.frame_buffer)
                )
                db.add(attempt_log)
                db.commit()
                
                await websocket.send_json({
                    "type": "ASSESSMENT_RESULT",
                    "payload": {
                        "score": score,
                        "is_correct": is_correct,
                        "feedback": feedback
                    }
                })
                session.frame_buffer.clear()
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "ERROR", "payload": str(e)})
        except Exception:
            pass
    finally:
        db.close()

async def run_assessment(buffer: List[Dict[str, Any]], sign_id: str) -> (float, str):
    is_static = await AssessmentEngine.check_sign_type_static(sign_id)
    
    if is_static:
        last_frame = buffer[-1]
        score, feedback = await AssessmentEngine.evaluate_static(last_frame, sign_id)
    else:
        score, feedback = await AssessmentEngine.evaluate_dynamic(buffer, sign_id)
        
    return score, feedback
