# SignLingo AI: Sign Language Learning & Assessment Platform

SignLingo AI is a modern web application designed to help users master American Sign Language (ASL) with real-time AI-based feedback. 

This repository contains the complete codebase for both **Milestone 1: Setup & Design** and **Milestone 2: Gesture Recognition & Assessment**.

---

## 1. System Architecture & Real-Time Data Flow

### A. High-Level Gateway Architecture
The platform follows a decoupled Client-Server architecture pattern:
```mermaid
graph TD
    Client["React Frontend (Vite)"] -->|HTTP Requests| API["FastAPI Gateway"]
    API -->|JSON Responses| Client
    API -->|SQL queries| DB[("SQLite / PostgreSQL DB")]
    DB -->|Data| API
    API -->|Ingests| Resource["backend/app/resources/*.json"]
```

### B. Real-Time WebSockets Ingestion Flow
The platform utilizes WebSockets to handle real-time sign recognition:
```mermaid
graph TD
    A[Webcam Feed] -->|Video Frame| B(React Frontend)
    B -->|Sequential Processing| C[MediaPipe Hands & Pose WASM]
    C -->|Coordinates Payload| E[WebSocket Client]
    E -->|High-Frequency Stream| F[FastAPI WebSocket Router]
    F -->|Frame Queue Ingestion| G[Session State Manager]
    G -->|On Stop Recording| H[Assessment Engine]
    H -->|Templates Cache| I[(JSON Templates)]
    H -->|Cosine + Procrustes + DTW| J[Assessment Evaluator]
    J -->|Log Attempt| K[(SQLite / PostgreSQL DB)]
    J -->|Accuracy HUD & Corrective Alerts| E
```

### C. Relational Database Model

#### 1. Milestone 1 Relational Database Model (4 Core Tables)
The initial database structure consist of four core tables:
```mermaid
erDiagram
    users ||--|| profiles : "has profile"
    users ||--o{ sessions : "creates session"
    users ||--|| notification_settings : "manages settings"

    users {
        int id PK
        string email
        string hashed_password
        boolean is_active
        boolean is_superuser
        datetime created_at
        datetime updated_at
    }
    profiles {
        int id PK
        int user_id FK
        string first_name
        string last_name
        string bio
        string preferred_language
        string skill_level
    }
    sessions {
        int id PK
        int user_id FK
        string session_token
        datetime expires_at
        string ip_address
        string user_agent
    }
    notification_settings {
        int id PK
        int user_id FK
        boolean email_notifications
        boolean push_notifications
        boolean weekly_digest
    }
```

#### 2. Milestone 2 Relational Database Model (5 Core Tables with Attempt Logs)
Milestone 2 expands the database schema to introduce the `attempt_logs` table:
```mermaid
erDiagram
    users ||--|| profiles : "has profile"
    users ||--o{ sessions : "creates session"
    users ||--|| notification_settings : "manages settings"
    users ||--o{ attempt_logs : "records attempt"

    users {
        int id PK
        string email
        string hashed_password
        boolean is_active
        boolean is_superuser
        datetime created_at
        datetime updated_at
    }
    profiles {
        int id PK
        int user_id FK
        string first_name
        string last_name
        string bio
        string preferred_language
        string skill_level
    }
    sessions {
        int id PK
        int user_id FK
        string session_token
        datetime expires_at
        string ip_address
        string user_agent
    }
    notification_settings {
        int id PK
        int user_id FK
        boolean email_notifications
        boolean push_notifications
        boolean weekly_digest
    }
    attempt_logs {
        int id PK
        int user_id FK
        string sign_id
        float score
        boolean is_correct
        text feedback
        float duration_seconds
        datetime timestamp
        json landmarks_series
    }
```


---

## 2. Authentication & Data Flow

### A. Registration & Session Authentication Flow (Milestone 1)
Shows the user signup and OAuth2 JWT authentication flow:
```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (React)
    participant API as FastAPI Gateway
    participant DB as Database

    Note over Client, DB: Registration Flow
    Client->>API: POST /api/v1/auth/register
    API->>DB: Check email uniqueness
    alt Unique Email
        API->>API: Hash password via bcrypt
        API->>DB: Save User, Profile & Settings
        DB-->>API: Commit Transaction
        API-->>Client: 201 Created (Success)
    else Email Exists
        API-->>Client: 400 Bad Request
    end

    Note over Client, DB: JWT Token Login Flow
    Client->>API: POST /api/v1/auth/token
    API->>DB: Query User by email
    API->>API: Validate password hash via bcrypt
    API->>API: Generate Access JWT Token (24-hour expiration)
    API-->>Client: 200 OK (access_token)
```

### B. WebSockets Gesture Ingestion & Assessment Flow (Milestone 2)
Shows the real-time coordinate streaming, buffering, and AI evaluation sequence:
```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (React/Webcam)
    participant WS as FastAPI WebSocket Router
    participant Engine as Assessment Engine
    participant DB as Database

    Note over Client, WS: Establish Session
    Client->>WS: Connect to /ws/{user_id}/{sign_id}
    WS-->>Client: Connection Accepted (Connected status)

    Note over Client, WS: Stream Coordinates
    Client->>Client: Capture camera frame & track landmarks
    Client->>WS: Stream FRAME payload (timestamp, hands, pose points)
    WS->>WS: Buffer frames in session queue (max 90 frames)

    Note over Client, WS: Trigger Assessment
    Client->>WS: Send STOP_RECORDING
    WS->>Engine: Run evaluation (Cosine + Procrustes + DTW)
    Engine->>Engine: Calculate accuracy & finger corrective offsets
    Engine->>DB: Log attempt (score, correct, feedback, landmarks_series)
    DB-->>Engine: Commit transaction
    Engine-->>WS: Return result payload
    WS-->>Client: Send ASSESSMENT_RESULT (score, is_correct, feedback)
```

---



## 3. Tech Stack

- **Frontend**: React (v18), Vite, Tailwind CSS, Lucide Icons, `@mediapipe/hands`, `@mediapipe/pose`, `react-webcam`.
- **Backend API**: FastAPI (Python 3.11), Uvicorn, WebSockets.
- **Data Science**: NumPy, SciPy (v1.12+).
- **Database ORM**: SQLAlchemy (v2).
- **Security**: PyJWT, Bcrypt.
- **Unit Testing**: Pytest, HTTPX, FastAPI TestClient.

---

## 4. Completed Milestone Features

### Milestone 1: Core Setup & Authentication
- **Database Pooling**: Dynamic ORM session handling with an automatic local SQLite (`test.db`) fallback if PostgreSQL is offline.
- **User Dashboard**: Left sidebar layout featuring proficiency toggles, sliding stats, and role selectors.
- **JWT Auth**: Full OAuth2 flow (register/login) protecting user sessions.

### Milestone 2: Gesture Recognition & Assessment
- **Real-Time Hand Overlay**: Integrates `@mediapipe/hands` to track wrist, palm base, and 21 finger joints.Skeletons are overlayed using a cobalt-blue and emerald-green coordinate map.
- **Upper Body Pose tracking**: Integrates `@mediapipe/pose` sequentially to track shoulders, elbows, and arms, rendering them in violet.
- **Camera Controls**: Interactive camera **Enable/Disable** buttons with visual placeholder cards.
- **Pattern Matching Algorithms**:
  - **Cosine Similarity**: Identifies coordinate angle directions.
  - **Procrustes Shape Comparison**: Scale, translation, and rotation-invariant shape distance mapping.
  - **Dynamic Time Warping (DTW)**: Movement velocity matching for gesture sequences (e.g. dynamic words).
- **Corrective HUD Alerts**: Direct vector pointing evaluation (MCP to Tip) showing user exactly which finger needs correction.

---

## 5. Local Setup and Installation

### A. Run Backend API
Navigate to the `/backend` directory:
```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### B. Run Backend Tests
Run the pytest suite to verify routers, buffers, databases, and assessment engines:
```powershell
.\.venv\Scripts\pytest -v
```

### C. Run Template & Ingestion Simulation Scripts
To verify coordinate reference files or run a dynamic mock ingestion simulation:
```powershell
# Verify templates loading
python app/scripts/verify_templates.py

# Simulate perfect "drink" sequence stream (outputs 100%)
python app/scripts/test_dynamic_simulate.py
```

### D. Run Frontend Dev Server
Navigate to the `/frontend` directory:
```powershell
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

