from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base

class DisciplinaModel(Base):
    """
    Disciplina: matéria de estudo vinculada a um usuário.
    
    Exemplo: Um aluno cria discipline "Matemática", depois cria tópicos dentro dela.
    """
    __tablename__ = "disciplinas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(String(255), nullable=True)
    criado_em = Column(DateTime, server_default=func.now())

    # Relacionamento para Usuario (many-to-one)
    usuario = relationship("UsuarioModel", back_populates="disciplinas")
    
    # Relacionamento para Tópicos (one-to-many)
    topicos = relationship("TopicoModel", back_populates="disciplina", cascade="all, delete-orphan")

class TopicoModel(Base):
    __tablename__ = "topicos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"), nullable=False)
    criado_em = Column(DateTime, server_default=func.now())

    disciplina = relationship("DisciplinaModel", back_populates="topicos")