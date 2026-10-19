from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    project_id: int = Field(gt=0)
    assigned_to: int | None = Field(default=None, gt=0)
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    status: str = Field(default="todo", min_length=1, max_length=50)
    priority: str = Field(default="medium", min_length=1, max_length=50)
    deadline: date | None = None


class TaskUpdate(BaseModel):
    assigned_to: int | None = Field(default=None, gt=0)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = Field(default=None, min_length=1, max_length=50)
    priority: str | None = Field(default=None, min_length=1, max_length=50)
    deadline: date | None = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    assigned_to: int | None
    title: str
    description: str | None
    status: str
    priority: str
    deadline: date | None
    created_at: datetime
