---
name: run-and-test-project
description: Automatically boots both backend and frontend development servers, runs unit tests, or executes template matching verifications for this workspace when requested.
---

# Instructions for Running and Testing the SignLingo-AI Project

Whenever the user asks to "run this project", "start the servers", "run the app", or "test this project", follow these automated instructions to manage the background tasks.

## 1. Running the Project

To boot both servers concurrently, run them as background tasks using `run_command` with a short delay:

### Step A: Start the Backend FastAPI Server
- **Directory (Cwd)**: `backend`
- **Command**: `.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`
- **WaitMsBeforeAsync**: `1000` (to send it immediately to the background)

### Step B: Start the Frontend Vite Server
- **Directory (Cwd)**: `frontend`
- **Command**: `npm run dev`
- **WaitMsBeforeAsync**: `1000` (to send it immediately to the background)

### Step C: Report Status to User
Once both commands have been issued, let the user know they are running in the background and provide the local access links:
- **Backend Access**: http://127.0.0.1:8000
- **Frontend Access**: http://localhost:5173

---

## 2. Testing the Project

When requested to run verification or tests, execute these commands sequentially and report results:

### Step A: Run Backend Pytest Suite
- **Directory (Cwd)**: `backend`
- **Command**: `.venv\Scripts\pytest -v`
- **Action**: Wait for completion and report if all tests pass.

### Step B: Run Template Match Validation
- **Directory (Cwd)**: `backend`
- **Command**: `.venv\Scripts\python app/scripts/verify_templates.py`
- **Action**: Verify template files load correctly in memory.

### Step C: Run Dynamic Simulation Assessment
- **Directory (Cwd)**: `backend`
- **Command**: `.venv\Scripts\python app/scripts/test_dynamic_simulate.py`
- **Action**: Verify DTW algorithm evaluates a simulated stream successfully to 100%.
