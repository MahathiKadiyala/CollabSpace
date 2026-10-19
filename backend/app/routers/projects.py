from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.project import Project
from ..models.user import User
from ..schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/api/projects", tags=["projects"])


def require_user(user_id: int, database: Session):
    if database.get(User, user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Owner user not found")


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_data: ProjectCreate, database: Session = Depends(get_db)):
    require_user(project_data.owner_id, database)
    project = Project(**project_data.model_dump())
    database.add(project)
    database.commit()
    database.refresh(project)
    return project


@router.get("", response_model=list[ProjectResponse])
def list_projects(database: Session = Depends(get_db)):
    return database.query(Project).order_by(Project.id).all()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, database: Session = Depends(get_db)):
    project = database.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    database: Session = Depends(get_db),
):
    project = database.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = project_data.model_dump(exclude_unset=True)
    if "owner_id" in update_data:
        require_user(update_data["owner_id"], database)

    for field, value in update_data.items():
        setattr(project, field, value)

    database.commit()
    database.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, database: Session = Depends(get_db)):
    project = database.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    database.delete(project)
    database.commit()
