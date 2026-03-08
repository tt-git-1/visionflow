from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Node(BaseModel):
    id: str
    type: str
    position: dict[str, float]
    data: dict


class Connection(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: str
    targetHandle: str


class Workflow(BaseModel):
    id: Optional[str] = None
    name: str
    nodes: list[Node] = []
    connections: list[Connection] = []
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)
