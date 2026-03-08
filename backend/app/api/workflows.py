from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.workflow import Workflow

router = APIRouter(prefix="/api/workflows", tags=["workflows"])

# インメモリストレージ（後でデータベースに置き換え）
workflows: dict[str, Workflow] = {}


@router.get("/", response_model=List[Workflow])
def get_workflows():
    return list(workflows.values())


@router.post("/", response_model=Workflow)
def create_workflow(workflow: Workflow):
    import uuid

    workflow_id = str(uuid.uuid4())
    workflow.id = workflow_id
    workflows[workflow_id] = workflow
    return workflow


@router.get("/{workflow_id}", response_model=Workflow)
def get_workflow(workflow_id: str):
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflows[workflow_id]


@router.put("/{workflow_id}", response_model=Workflow)
def update_workflow(workflow_id: str, workflow: Workflow):
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow.id = workflow_id
    workflows[workflow_id] = workflow
    return workflow


@router.delete("/{workflow_id}")
def delete_workflow(workflow_id: str):
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    del workflows[workflow_id]
    return {"message": "Workflow deleted"}
