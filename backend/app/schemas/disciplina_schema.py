from pydantic import BaseModel, Field
from typing import Optional, Literal

class DisciplinaCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    usuario_id: int


class TopicoCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=150)
    formato: Literal["flashcards", "quiz"]


class TopicoResponse(BaseModel):
    nome: str = Field(min_length=1, max_length=150)
    formato: str