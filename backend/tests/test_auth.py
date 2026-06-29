import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.session import get_db
from app.db.models import Base

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_register_user(client):
    payload = {
        "email": "testuser@example.com",
        "password": "strongpassword123",
        "first_name": "Test",
        "last_name": "User"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["email"] == "testuser@example.com"

def test_register_existing_user(client):
    payload = {
        "email": "testuser@example.com",
        "password": "anotherpassword",
        "first_name": "Duplicate",
        "last_name": "User"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_access_token(client):
    payload = {
        "username": "testuser@example.com",
        "password": "strongpassword123"
    }
    response = client.post("/api/v1/auth/token", data=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    payload = {
        "username": "testuser@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/token", data=payload)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]
