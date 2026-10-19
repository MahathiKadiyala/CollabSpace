from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    name: str
    description: str | None = None
    owner_id: int
    deadline: date | None = None
    status: str = "active"
    progress: int = Field(default=0, ge=0, le=100)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    owner_id: int | None = None
    deadline: date | None = None
    status: str | None = None
    progress: int | None = Field(default=None, ge=0, le=100)


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
