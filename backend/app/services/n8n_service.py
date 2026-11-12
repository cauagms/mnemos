import logging
import os

import httpx

logger = logging.getLogger(__name__)

# URL de PRODUÇÃO do Webhook (workflow publicado no n8n).
# Pode ser sobrescrita pela variável de ambiente N8N_WEBHOOK_URL.
N8N_WEBHOOK_URL = os.getenv(
    "N8N_WEBHOOK_URL",
    "http://localhost:5678/webhook/d6696475-ef64-4353-b552-cd77633f225a",
)

CAMPOS_OBRIGATORIOS = {"resumo", "flashcards", "quiz"}


async def gerar_materiais_com_ia(texto_documento: str) -> dict:
    """
    Envia o texto extraído do documento ao n8n
    e retorna os materiais gerados pela IA.
    """

    # Verifica se existe texto para processar.
    if not texto_documento or not texto_documento.strip():
        raise ValueError("O documento não possui texto para análise.")

    # Envia o texto no formato JSON esperado pelo Webhook.
    async with httpx.AsyncClient(timeout=180.0) as cliente:
        resposta = await cliente.post(
            N8N_WEBHOOK_URL,
            json={"texto_documento": texto_documento},
        )

        # Gera um erro se o n8n retornar status HTTP de falha.
        resposta.raise_for_status()

        # Converte a resposta JSON do n8n em um dicionário Python.
        dados = resposta.json()

    # Se o n8n colocou os materiais dentro de "output", extrai o conteúdo.
    if isinstance(dados, dict) and isinstance(dados.get("output"), dict):
        dados = dados["output"]

    logger.debug("Resposta do n8n: %s", dados)

    # Confere se os três campos obrigatórios existem.
    if not isinstance(dados, dict) or not CAMPOS_OBRIGATORIOS.issubset(dados):
        raise ValueError(
            f"O n8n retornou um JSON fora do formato esperado. "
            f"Chaves recebidas: {list(dados.keys()) if isinstance(dados, dict) else type(dados).__name__}"
        )

    return dados