
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.usuario_model import UsuarioModel
from app.schemas.auth_schema import AuthRequest, AuthResponse
from app.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=AuthResponse)
def login(
    authUser: AuthRequest,
    db: Session = Depends(get_db),
):
    # 1. Busca o usuário pelo e-mail
    usuario = (
        db.query(UsuarioModel)
        .filter(UsuarioModel.email == authUser.email)
        .first()
    )

    # 2. Verifica se o usuário existe e se a senha está correta
    if not usuario or not verify_password(
        authUser.senha,
        usuario.senha,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Gera o token de acesso
    access_token = create_access_token(
        data={"sub": str(usuario.id)}
    )

    # 4. Retorna o token e o tipo de autenticação
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
    )
