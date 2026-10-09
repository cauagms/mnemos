"""
Modelo de Usuário: autentica, rastreia propriedade de dados e vincula disciplinas.

Estrutura:
    usuarios (id, email, nome, criado_em)
        ├─ disciplinas (user_id → disciplinas.user_id)
        ├─ arquivos (user_id → arquivos.user_id)
        ├─ notificacoes (user_id → notificacoes_ativas.user_id)
        └─ fsrs_progresso (user_id → fsrs_progresso.user_id)
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base


class UsuarioModel(Base):
    """
    Usuário da plataforma Mnemos.
    
    Atributos:
        id: Identificador único (PK)
        email: E-mail único (usado para autenticação e notificações)
        nome: Nome completo do aluno
        criado_em: Timestamp de criação (auditoria)
    """
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(254), nullable=False, unique=True, index=True)
    nome = Column(String(150), nullable=False)
    criado_em = Column(DateTime, server_default=func.now())

    # Relacionamentos (lazy loading, carrega sob demanda)
    disciplinas = relationship(
        "DisciplinaModel",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )
    
    arquivos = relationship(
        "ArquivoModel",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )
    
    notificacoes = relationship(
        "NotificacaoAtivaModel",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )
    
    fsrs_progresso = relationship(
        "FSRSProgressoModel",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<UsuarioModel(id={self.id}, email='{self.email}', nome='{self.nome}')>"
