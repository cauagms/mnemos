from pydantic import BaseModel
from typing import Optional

class DisciplinaCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None

class TopicoCreate(BaseModel):
    nome: str

    