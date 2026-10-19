from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .database import (
    APP_ENV,
    CORS_ORIGINS,
    database_configuration_error,
    engine,
    initialize_database,
)
from .routers.projects import router as projects_router
from .routers.tasks import router as tasks_router
from .routers.users import router as users_router


@asynccontextmanager
async def lifespan(application: FastAPI):
    initialize_database()
    yield

app = FastAPI(
    title="CollabSpace API",
    description="Backend API for CollabSpace",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(projects_router)
app.include_router(tasks_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "environment": APP_ENV}


@app.get("/api/db-test")
def database_test():
    configuration_error = database_configuration_error()
    if configuration_error:
        return {"status": "error", "database": "not configured", "detail": configuration_error}

    try:
        with engine.connect() as connection:
            database_name = connection.execute(text("SELECT current_database()")).scalar_one()
        return {"status": "success", "database": database_name}
    except Exception as error:
        return {"status": "error", "database": "unavailable", "detail": str(error)}


@app.get("/api/db-health")
def database_health_check():
    return database_test()
