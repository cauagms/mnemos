from pydantic import BaseModel, EmailStr, Field


class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=150)
    email: EmailStr
    senha: str = Field(min_length=8)


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr