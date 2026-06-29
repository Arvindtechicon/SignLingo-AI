# SignLingo AI: Sign Language Learning & Assessment Platform

SignLingo AI is a modern web application designed to help users master American Sign Language (ASL) with real-time AI-based feedback. 

This repository contains the complete codebase for **Milestone 1: Project Initialization, Design Process & Core Setup**.

---

## 1. System Architecture

The platform follows a decoupled Client-Server architecture pattern:

```mermaid
graph TD
    Client["React Frontend (Vite)"] -->|HTTP Requests| API["FastAPI Gateway"]
    API -->|JSON Responses| Client
    API -->|SQL queries| DB[("SQLite / PostgreSQL DB")]
    DB -->|Data| API
    API -->|Ingests| Resource["backend/app/resources/*.json"]
```

### Relational Database Model
The relational database structure consists of four core tables:

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

---

## 2. Authentication & Data Flow

Authentication is built using standard OAuth2 routes with JSON Web Tokens (JWT) and direct `bcrypt` password hashing for optimal database security.

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
        API-->>Client: 400 Bad Request (Duplicate Error)
    end

    Note over Client, DB: JWT Token Login Flow
    Client->>API: POST /api/v1/auth/token
    API->>DB: Query User by email
    API->>API: Validate password hash via bcrypt
    API->>API: Generate Access JWT Token (24-hour expiration)
    API-->>Client: 200 OK (access_token)
```

---

## 3. Tech Stack

- **Frontend**: React (v18), Vite, Tailwind CSS, Lucide Icons, React Router DOM.
- **Backend API**: FastAPI (Python 3.11), Uvicorn.
- **Database ORM**: SQLAlchemy (v2).
- **Security & Crypto**: PyJWT, Bcrypt.
- **Unit Testing**: Pytest, HTTPX, FastAPI TestClient.

---

## 4. Milestone 1 Completed Features

### Backend Components
- **Config & Core Settings**: Handled using `pydantic-settings` to dynamically parse environment variables from `.env`.
- **Database Sessions**: Configured database engine routing and connection pooling in `app/db/session.py`.
- **Relational Schemas**: Created model schemas for User accounts, Profiles, Session histories, and Notification preferences.
- **Security Utilities**: Set up token creation utilities and direct bcrypt hashing wrappers in `app/core/security.py`.
- **Auth Routes**: Built and tested endpoint controllers for `/register` and `/token` JWT logins.

### Frontend Components
- **Off-White Design System**: Set up slate-50 (`#F8FAFC`) styling using Tailwind configurations.
- **Landing Page**: Implemented a responsive header navigation, hero banner section, and landing feature grids.
- **Login & Registration forms**: Developed responsive visual input fields with custom state validations.
- **Role Selector Grid**: Configured an interactive 2x2 grid letting users select their account roles (*Learner, Instructor, Accessibility Trainer, Admin*) with scale animations.
- **Dashboard Sidebar Shell**: Designed a responsive layout featuring menu indicator lines, notification bell center, initials-based user avatar, and a profile management center with proficiency toggle chips and hour sliders.

---

## 5. Local Setup and Installation

### A. Run Backend API
Navigate to the `/backend` directory:
```powershell
# Initialize Python virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```
API docs will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### B. Run Backend Tests
Run the test suite from the `/backend` directory:
```powershell
.\.venv\Scripts\pytest tests/
```

### C. Run Frontend Dev Server
Navigate to the `/frontend` directory:
```powershell
# Install packages
npm install

# Start local server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### D. Compile Frontend Build
Run from the `/frontend` directory:
```powershell
npm run build
```
The optimized bundle will be compiled into `frontend/dist/`.
