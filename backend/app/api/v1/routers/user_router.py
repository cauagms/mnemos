from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.usuario_model import UsuarioModel
from app.schemas.usuario_schema import UsuarioCreate, UsuarioResponse
from app.security import hash_password

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UsuarioResponse)
def create_user(user: UsuarioCreate, db: Session = Depends(get_db)):
    """Cria um novo usuário no banco."""

    existing_user = (
        db.query(UsuarioModel)
        .filter(UsuarioModel.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado.",
        )

    senha_hash = hash_password(user.senha)

    new_user = UsuarioModel(
        email=user.email,
        nome=user.nome,
        senha=senha_hash,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    except Exception:
        db.rollback()
        raise
