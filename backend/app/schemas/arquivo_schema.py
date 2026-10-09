"""
Schemas de Arquivo para validação de entrada e documentação de saída.

- ArquivoUpload: o que o usuário envia (arquivo em form-data)
- DocumentoChunkResponse: o que o BD retorna (chunks extraídos)
- ArquivoResponse: arquivo completo com seus chunks
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum


class StatusArquivoEnum(str, Enum):
    """Estados possíveis de um arquivo."""
    PENDENTE = "pendente"
    PROCESSANDO = "processando"
    PRONTO = "pronto"
    ERRO = "erro"


class DocumentoChunkResponse(BaseModel):
    """Chunk extraído de um documento."""
    id: int
    arquivo_id: int
    indice: int
    conteudo: str
    numero_pagina: Optional[int] = None
    quantidade_palavras: Optional[int] = None
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class ArquivoResponse(BaseModel):
    """Arquivo com seus chunks aninhados."""
    id: int
    usuario_id: int
    topico_id: int
    nome_original: str
    tipo_arquivo: str
    tamanho_bytes: Optional[int] = None
    status: StatusArquivoEnum
    criado_em: datetime
    atualizado_em: datetime
    
    chunks: List[DocumentoChunkResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ArquivoSimplificadoResponse(BaseModel):
    """Arquivo sem chunks (para listas)."""
    id: int
    usuario_id: int
    topico_id: int
    nome_original: str
    tipo_arquivo: str
    status: StatusArquivoEnum
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
