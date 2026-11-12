from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    func,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class NotificacaoModel(Base):
    __tablename__ = "notificacoes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False,
        index=True,
    )

    tipo = Column(String(50), nullable=False)

    data_envio = Column(
        DateTime,
        nullable=True,
    )

    enviada = Column(Boolean, nullable=False, default=False)

    usuario = relationship("UsuarioModel", back_populates="notificacoes")