
import os
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash


# Configuração das senhas
password_hash = PasswordHash.recommended()

# Configuração do JWT
SECRET_KEY = 'teste@teste@'
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def hash_password(senha: str) -> str:
    """Gera o hash seguro da senha."""
    return password_hash.hash(senha)


def verify_password(senha: str, senha_hash: str) -> bool:
    """Verifica se a senha corresponde ao hash."""
    return password_hash.verify(senha, senha_hash)


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    """Cria um JWT com prazo de expiração."""

    if not SECRET_KEY:
        raise RuntimeError(
            "A variável de ambiente JWT_SECRET_KEY não foi configurada."
        )

    payload = data.copy()

    agora = datetime.now(timezone.utc)
    expiracao = agora + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload.update({
        "iat": agora,
        "exp": expiracao,
    })

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return token
