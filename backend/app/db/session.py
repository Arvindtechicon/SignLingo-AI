import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

fallback_db_url = "sqlite:///./test.db"
db_url = settings.DATABASE_URL

try:
    # Test PostgreSQL connection with a short timeout
    if db_url.startswith("postgresql"):
        temp_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
        with temp_engine.connect() as conn:
            pass
        temp_engine.dispose()
        logger.info("Database: Successfully connected to PostgreSQL database.")
    else:
        logger.info("Database: PostgreSQL is not configured, using direct URL.")
except Exception:
    logger.warning("Database: PostgreSQL connection failed. Falling back to local SQLite (test.db).")
    db_url = fallback_db_url

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
engine = create_engine(db_url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Auto-create tables if falling back to SQLite for instant local play
if db_url.startswith("sqlite"):
    from app.db.models import Base
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

