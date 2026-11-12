"""
Modelos de Arquivo e DocumentoChunk para RF01 (Upload e Extração).

Fluxo:
1. Usuário upload arquivo → cria registro ArquivoModel
2. Backend extrai texto → cria registros DocumentoChunkModel
3. Flashcards/Quizzes posteriormente vinculados aos chunks
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class StatusArquivo(str, enum.Enum):
    """Status do processamento do arquivo."""
    PENDENTE = "pendente"           # Recém-enviado, aguardando processamento
    PROCESSANDO = "processando"     # Extração em andamento
    PRONTO = "pronto"               # Extração concluída com sucesso
    ERRO = "erro"                   # Falha na extração


class ArquivoModel(Base):
    """
    Arquivo enviado pelo usuário para estudo.
    
    Exemplo: usuário envia "Aula_Matematica.pdf" → cria registro com status=pendente
    → backend extrai → status=pronto
    """
    __tablename__ = "arquivos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    topico_id = Column(Integer, ForeignKey("topicos.id"), nullable=False, index=True)
    
    nome_original = Column(String(255), nullable=False)  # "Aula_Matematica.pdf"
    tipo_arquivo = Column(String(10), nullable=False)    # "pdf", "docx", "pptx"
    caminho_arquivo = Column(String(500), nullable=True) # Caminho relativo/S3
    tamanho_bytes = Column(Integer, nullable=True)       # Tamanho em bytes
    status = Column(Enum(StatusArquivo), default=StatusArquivo.PENDENTE, index=True)
    
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relacionamentos
    usuario = relationship("UsuarioModel", back_populates="arquivos")
    topico = relationship("TopicoModel", back_populates="arquivos")
    chunks = relationship(
        "DocumentoChunkModel",
        back_populates="arquivo",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<ArquivoModel(id={self.id}, nome='{self.nome_original}', status={self.status})>"


class DocumentoChunkModel(Base):
    """
    Chunk (pedaço) de texto extraído de um arquivo.
    
    Exemplo: um PDF de 10 páginas → 50 chunks de ~500 palavras cada
    Propriedade: cada chunk pode gerar 1+ flashcard
    """
    __tablename__ = "documento_chunks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    arquivo_id = Column(Integer, ForeignKey("arquivos.id"), nullable=False, index=True)
    
    indice = Column(Integer, nullable=False)           # Ordem do chunk (1, 2, 3...)
    conteudo = Column(Text, nullable=False)            # Texto extraído
    numero_pagina = Column(Integer, nullable=True)     # Página de origem (se PDF)
    quantidade_palavras = Column(Integer, nullable=True)
    
    criado_em = Column(DateTime, server_default=func.now())

    # Relacionamento
    arquivo = relationship("ArquivoModel", back_populates="chunks")

    def __repr__(self):
        return f"<DocumentoChunkModel(id={self.id}, arquivo_id={self.arquivo_id}, indice={self.indice})>"
