"""Environment configuration and SQLAlchemy connection setup."""

from pathlib import Path
from os import getenv

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

APP_ENV = getenv("APP_ENV", "development")
FRONTEND_URL = getenv("FRONTEND_URL", "http://localhost:5173")
CORS_ORIGINS = [
    origin.strip()
    for origin in getenv("CORS_ORIGINS", FRONTEND_URL).split(",")
    if origin.strip()
]

DATABASE_URL = getenv("DATABASE_URL", "")


def database_configuration_error():
    if not DATABASE_URL:
        return "Missing DATABASE_URL environment variable"
    return None


Base = declarative_base()

engine = create_engine(DATABASE_URL, pool_pre_ping=True) if DATABASE_URL else None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def initialize_database():
    """Create any missing tables for local development."""
    if engine is None:
        raise RuntimeError(database_configuration_error())

    from . import models

    Base.metadata.create_all(bind=engine)


def get_db():
    """Provide a database session to FastAPI endpoints and close it afterward."""
    if engine is None:
        raise RuntimeError(database_configuration_error())

    database = SessionLocal()
    try:
        yield database
    finally:
        database.close()

