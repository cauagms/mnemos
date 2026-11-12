"""
Router de Arquivos: upload, processamento e extração de texto.

Endpoints:
- POST   /api/v1/arquivos/upload        → Fazer upload de arquivo
- GET    /api/v1/arquivos              → Listar arquivos do tópico
- GET    /api/v1/arquivos/{arquivo_id} → Obter arquivo com chunks
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
from pathlib import Path

from app.db.database import get_db
from app.models.arquivo_model import ArquivoModel, DocumentoChunkModel, StatusArquivo
from app.models.usuario_model import UsuarioModel
from app.models.disciplina_model import TopicoModel
from app.schemas.arquivo_schema import ArquivoResponse, ArquivoSimplificadoResponse
from app.models.historico_revisao_model import HistoricoRevisaoModel
router = APIRouter(prefix="/arquivos", tags=["Arquivos"])

# Diretório para salvar uploads (cria se não existir)
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def extrair_texto_pdf(caminho_arquivo: str) -> List[str]:
    """
    Extrai texto de um PDF e retorna lista de chunks.

    Args:
        caminho_arquivo: Path do arquivo PDF

    Returns:
        Lista de strings (chunks de texto)
    """
    try:
        import PyPDF2

        chunks = []
        with open(caminho_arquivo, "rb") as arquivo:
            leitor = PyPDF2.PdfReader(arquivo)
            num_paginas = len(leitor.pages)

            for num_pagina in range(num_paginas):
                pagina = leitor.pages[num_pagina]
                texto = pagina.extract_text()

                # Divide o texto da página em chunks de ~500 palavras
                palavras = texto.split()
                tamanho_chunk = 500

                for i in range(0, len(palavras), tamanho_chunk):
                    chunk = " ".join(palavras[i:i + tamanho_chunk])
                    if chunk.strip():
                        chunks.append({
                            "texto": chunk,
                            "pagina": num_pagina + 1,
                            "palavras": len(chunk.split())
                        })

        return chunks
    except Exception as e:
        raise Exception(f"Erro ao extrair PDF: {str(e)}")


def extrair_texto_docx(caminho_arquivo: str) -> List[str]:
    """
    Extrai texto de um DOCX e retorna lista de chunks.

    Args:
        caminho_arquivo: Path do arquivo DOCX

    Returns:
        Lista de dicts com texto, pagina, palavras
    """
    try:
        from docx import Document

        chunks = []
        doc = Document(caminho_arquivo)
        texto_completo = "\n".join([p.text for p in doc.paragraphs])

        # Divide em chunks de ~500 palavras
        palavras = texto_completo.split()
        tamanho_chunk = 500

        for i in range(0, len(palavras), tamanho_chunk):
            chunk = " ".join(palavras[i:i + tamanho_chunk])
            if chunk.strip():
                chunks.append({
                    "texto": chunk,
                    "pagina": None,  # DOCX não tem conceito de página
                    "palavras": len(chunk.split())
                })

        return chunks
    except Exception as e:
        raise Exception(f"Erro ao extrair DOCX: {str(e)}")


def processar_arquivo(arquivo_model: ArquivoModel, db: Session) -> bool:
    """
    Processa arquivo: extrai texto e salva chunks no BD.

    Args:
        arquivo_model: Objeto ArquivoModel já salvo
        db: Sessão do banco

    Returns:
        True se sucesso, False se falha
    """
    try:
        # Muda status para "processando"
        arquivo_model.status = StatusArquivo.PROCESSANDO
        db.commit()

        # Extrai chunks baseado no tipo de arquivo
        if arquivo_model.tipo_arquivo.lower() == "pdf":
            chunks = extrair_texto_pdf(arquivo_model.caminho_arquivo)
        elif arquivo_model.tipo_arquivo.lower() == "docx":
            chunks = extrair_texto_docx(arquivo_model.caminho_arquivo)
        else:
            raise ValueError(f"Tipo de arquivo não suportado: {arquivo_model.tipo_arquivo}")

        # Salva chunks no BD
        for indice, chunk_info in enumerate(chunks, start=1):
            novo_chunk = DocumentoChunkModel(
                arquivo_id=arquivo_model.id,
                indice=indice,
                conteudo=chunk_info["texto"],
                numero_pagina=chunk_info.get("pagina"),
                quantidade_palavras=chunk_info.get("palavras"),
            )
            db.add(novo_chunk)

        # Muda status para "pronto"
        arquivo_model.status = StatusArquivo.PRONTO
        db.commit()

        return True
    except Exception as e:
        # Muda status para "erro"
        arquivo_model.status = StatusArquivo.ERRO
        db.commit()
        print(f"Erro no processamento: {str(e)}")
        return False


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/upload", status_code=status.HTTP_201_CREATED, response_model=ArquivoResponse)
async def fazer_upload(
    usuario_id: int = Query(..., description="ID do usuário autenticado"),
    topico_id: int = Query(..., description="ID do tópico destino"),
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Faz upload de arquivo (PDF, DOCX, PPTX) e dispara extração.

    Fluxo:
    1. Valida que tópico pertence ao usuário
    2. Salva arquivo no disco
    3. Cria registro ArquivoModel
    4. Extrai texto e salva chunks
    5. Retorna arquivo com status="pronto"

    Args:
        usuario_id: ID do usuário
        topico_id: ID do tópico
        arquivo: Arquivo enviado (form-data)
        db: Sessão do BD

    Returns:
        ArquivoResponse com chunks extraídos

    Raises:
        404: Se tópico não pertence ao usuário
        400: Se tipo de arquivo não suportado
    """
    # Valida que tópico existe e pertence ao usuário
    topico = db.query(TopicoModel).join(
        TopicoModel.disciplina
    ).filter(
        TopicoModel.id == topico_id,
        TopicoModel.disciplina.has(usuario_id=usuario_id)
    ).first()

    if not topico:
        raise HTTPException(status_code=404, detail="Tópico não encontrado ou não pertence ao usuário.")

    # Valida tipo de arquivo
    tipos_permitidos = {"pdf", "docx", "pptx"}
    tipo_arquivo = arquivo.filename.split(".")[-1].lower()
    if tipo_arquivo not in tipos_permitidos:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo não suportado. Permitidos: {tipos_permitidos}"
        )

    # Salva arquivo no disco
    try:
        caminho_arquivo = UPLOAD_DIR / f"usuario_{usuario_id}_{arquivo.filename}"
        conteudo = await arquivo.read()
        with open(caminho_arquivo, "wb") as f:
            f.write(conteudo)

        tamanho_bytes = len(conteudo)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao salvar arquivo: {str(e)}"
        )

    # Cria registro no BD
    novo_arquivo = ArquivoModel(
        usuario_id=usuario_id,
        topico_id=topico_id,
        nome_original=arquivo.filename,
        tipo_arquivo=tipo_arquivo,
        caminho_arquivo=str(caminho_arquivo),
        tamanho_bytes=tamanho_bytes,
        status=StatusArquivo.PENDENTE,
    )
    db.add(novo_arquivo)
    db.commit()
    db.refresh(novo_arquivo)

    # Processa arquivo (extrai texto)
    sucesso = processar_arquivo(novo_arquivo, db)

    # Recarrega para pegar chunks
    db.refresh(novo_arquivo)

    return novo_arquivo


@router.get("", response_model=List[ArquivoSimplificadoResponse])
def listar_arquivos(
    usuario_id: int = Query(..., description="ID do usuário autenticado"),
    topico_id: int = Query(..., description="ID do tópico (filtro)"),
    db: Session = Depends(get_db),
):
    """
    Lista arquivos de um tópico específico.

    Args:
        usuario_id: ID do usuário
        topico_id: ID do tópico
        db: Sessão do BD

    Returns:
        Lista de ArquivoSimplificadoResponse

    Raises:
        404: Se tópico não pertence ao usuário
    """
    # Valida propriedade do tópico
    topico = db.query(TopicoModel).join(
        TopicoModel.disciplina
    ).filter(
        TopicoModel.id == topico_id,
        TopicoModel.disciplina.has(usuario_id=usuario_id)
    ).first()

    if not topico:
        raise HTTPException(status_code=404, detail="Tópico não encontrado.")

    arquivos = db.query(ArquivoModel).filter(
        ArquivoModel.topico_id == topico_id
    ).all()

    return arquivos


@router.get("/{arquivo_id}", response_model=ArquivoResponse)
def obter_arquivo(
    arquivo_id: int,
    usuario_id: int = Query(..., description="ID do usuário autenticado"),
    db: Session = Depends(get_db),
):
    """
    Obtém um arquivo com seus chunks.

    Args:
        arquivo_id: ID do arquivo
        usuario_id: ID do usuário (validação)
        db: Sessão do BD

    Returns:
        ArquivoResponse com chunks aninhados

    Raises:
        404: Se arquivo não pertence ao usuário
    """
    arquivo = db.query(ArquivoModel).filter(
        ArquivoModel.id == arquivo_id,
        ArquivoModel.usuario_id == usuario_id,
    ).first()

    if not arquivo:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")

    return arquivo

@router.get("/{arquivo_id}/analisar")
async def analisar_arquivo(
    arquivo_id: int,
    usuario_id: int,
    db: Session = Depends(get_db)
) -> dict:
    """
    Analisa o arquivo usando n8n e retorna materiais gerados.

    Args:
        arquivo_id: ID do arquivo
        usuario_id: ID do usuário
        db: Sessão do BD

    Returns:
        Dicionário com resumo, flashcards e quiz

    Raises:
        404: Se arquivo não pertence ao usuário
        ValueError: Se n8n retornar erro ou JSON inválido
    """
    # Busca o arquivo no BD
    arquivo = db.query(ArquivoModel).filter(
        ArquivoModel.id == arquivo_id,
        ArquivoModel.usuario_id == usuario_id,
    ).first()

    if not arquivo:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")

    # Concatena todos os chunks em um único texto
    texto_documento = " ".join(chunk.conteudo for chunk in arquivo.chunks)

    # Chama o serviço n8n para gerar materiais com IA
    from app.services.n8n_service import gerar_materiais_com_ia

    try:
        materiais = await gerar_materiais_com_ia(texto_documento)
        salvar_retorno_ia(materiais, arquivo_id, db)
        return materiais
    except Exception as e:
        raise ValueError(f"Erro ao analisar arquivo com n8n: {str(e)}")


from app.models.quiz_model import QuizModel
from app.models.alternativa_model import AlternativaModel
from app.models.flashcard_model import FlashcardModel



def salvar_retorno_ia(
    materiais: dict,
    arquivo_id: int,
    db: Session,
):
    # Confere se o retorno da IA possui todas as chaves esperadas.
    campos_obrigatorios = {"resumo", "flashcards", "quiz"}

    if not isinstance(materiais, dict):
        raise ValueError("O retorno da IA precisa ser um objeto JSON.")

    if not campos_obrigatorios.issubset(materiais):
        raise ValueError(
            "O retorno da IA não possui todas as chaves necessárias."
        )

    try:
        # Busca no banco o arquivo que foi analisado pela IA.
        arquivo = (
            db.query(ArquivoModel)
            .filter(ArquivoModel.id == arquivo_id)
            .first()
        )

        # Verifica se o arquivo existe.
        if arquivo is None:
            raise ValueError("Arquivo não encontrado.")

        # Recupera o tópico associado ao arquivo.
        topico_id = arquivo.topico_id

        # O tópico é obrigatório para criar flashcards e quizzes.
        if topico_id is None:
            raise ValueError(
                "O arquivo não possui um tópico associado. "
                "Associe o arquivo a um tópico antes de gerar os materiais."
            )

        # Confere se a IA retornou uma lista de flashcards.
        if not isinstance(materiais["flashcards"], list):
            raise ValueError(
                "O campo 'flashcards' precisa ser uma lista."
            )

        # Confere se a IA retornou uma lista de questões.
        if not isinstance(materiais["quiz"], list):
            raise ValueError(
                "O campo 'quiz' precisa ser uma lista."
            )

        # Salva os flashcards gerados pela IA.
        for fc in materiais["flashcards"]:
            novo_flashcard = FlashcardModel(
                topico_id=topico_id,
                pergunta=fc["pergunta"],
                resposta=fc["resposta"],
            )

            db.add(novo_flashcard)

        # Salva as questões e suas alternativas.
        for q in materiais["quiz"]:
            novo_quiz = QuizModel(
                topico_id=topico_id,
                pergunta=q["pergunta"],
            )

            # Relaciona cada alternativa à questão correspondente.
            for texto_alternativa in q["alternativas"]:
                alternativa = AlternativaModel(
                    texto=texto_alternativa,
                    correta=(
                        texto_alternativa == q["resposta_correta"]
                    ),
                    explicacao=(
                        q.get("explicacao")
                        if texto_alternativa == q["resposta_correta"]
                        else None
                    ),
                )

                novo_quiz.alternativas.append(alternativa)

            db.add(novo_quiz)

        # Salva todos os materiais em uma única transação.
        db.commit()

    except Exception:
        # Desfaz as alterações caso ocorra algum erro.
        db.rollback()
        raise
