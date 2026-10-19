from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.project import Project
from ..models.task import Task
from ..models.user import User
from ..schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/api", tags=["tasks"])


def require_project(project_id: int, database: Session):
    if database.get(Project, project_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )


def require_assigned_user(user_id: int | None, database: Session):
    if user_id is not None and database.get(User, user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found",
        )


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, database: Session = Depends(get_db)):
    require_project(task_data.project_id, database)
    require_assigned_user(task_data.assigned_to, database)

    task = Task(**task_data.model_dump())
    database.add(task)
    try:
        database.commit()
        database.refresh(task)
    except SQLAlchemyError:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create task",
        )
    return task


@router.get("/tasks", response_model=list[TaskResponse])
def list_tasks(database: Session = Depends(get_db)):
    return database.query(Task).order_by(Task.id).all()


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, database: Session = Depends(get_db)):
    task = database.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.get("/projects/{project_id}/tasks", response_model=list[TaskResponse])
def list_project_tasks(project_id: int, database: Session = Depends(get_db)):
    require_project(project_id, database)
    return (
        database.query(Task)
        .filter(Task.project_id == project_id)
        .order_by(Task.id)
        .all()
    )


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    database: Session = Depends(get_db),
):
    task = database.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    update_data = task_data.model_dump(exclude_unset=True)
    require_assigned_user(update_data.get("assigned_to"), database)

    for field, value in update_data.items():
        setattr(task, field, value)

    try:
        database.commit()
        database.refresh(task)
    except SQLAlchemyError:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update task",
        )
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, database: Session = Depends(get_db)):
    task = database.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    try:
        database.delete(task)
        database.commit()
    except SQLAlchemyError:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete task",
        )
