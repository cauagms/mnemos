---
name: Mnemos Backend
alwaysApply: true
---

# Projeto Mnemos (TCC) - Backend

## Quem é o usuário

Estudante no começo da programação. Explique de forma objetiva e clara, passo a passo, sem pressupor conhecimento prévio. Quando for uma tarefa de aprendizado (SQL, Python), dê o caminho e deixe o usuário tentar escrever antes de entregar a resposta pronta.

## Produto

Mnemos: plataforma web de aprendizagem adaptativa. Reduz o tempo de criação manual de material de estudo e o esquecimento das datas de revisão (Curva do Esquecimento de Ebbinghaus).

Fluxo do MVP: upload de arquivos (PDF, DOCX, PPTX) -> extração e geração de flashcards e quizzes por IA -> curadoria do aluno -> agendamento adaptativo com FSRS -> notificações por e-mail -> painel de desempenho.

Requisitos principais:

- RF01: envio e processamento automático de PDF, Word e PowerPoint
- RF02: geração automática de flashcards e quizzes por IA
- RF03: curadoria do aluno (revisar, editar, aprovar ou descartar flashcards; quizzes vão direto como definitivos)
- RF04: agendamento adaptativo de revisões (FSRS)
- RF05: notificações ativas por e-mail
- RF06: painel de desempenho e taxa de retenção por disciplina

## Stack oficial

- Python, com venv em `backend/venv`
- FastAPI (rotas, schemas Pydantic de entrada e saída)
- MySQL, banco `mnemos`
- SQLAlchemy
- Git, branches `feat/...`

## Tabelas do escopo (e só estas)

usuarios, disciplinas, topicos, arquivos, documento_chunks, flashcards, quizzes, alternativas, fsrs_progresso, notificacoes_ativas.

Ordem de criação (respeita as chaves estrangeiras):

1. usuarios
2. disciplinas
3. topicos
4. arquivos
5. documento_chunks
6. flashcards e quizzes
7. alternativas
8. fsrs_progresso
9. notificacoes_ativas

## Regra anti-invenção (a mais importante)

- Nomes e tipos de colunas vêm SOMENTE de `docs/modelo_banco.md` (ou do documento oficial do projeto). Se a coluna não estiver lá, NÃO invente: diga que não está na documentação e pergunte.
- Não crie tabela, coluna, pacote ou rota fora do escopo do PRD.
- Ao propor uma coluna ou regra, diga de qual arquivo ou documento ela veio.
- Se não souber, diga "não sei" e pergunte.

## Regras de trabalho

1. Pensar antes de codar: declare as suposições (formato de dado, contrato de API, comportamento esperado) antes de implementar. Se houver dúvida real, pergunte.
2. Simplicidade: a menor solução que resolve. Sem abstrações, camadas ou dependências desnecessárias agora.
3. Mudanças cirúrgicas: altere só o que a tarefa pede. Não refatore nem renomeie código fora do escopo.
4. Orientado a objetivo: valide no Swagger (`/docs`) antes de commitar.
5. Testes focados em comportamento: valide o resultado que a função entrega.
6. Toda rota tem schema de entrada (validação) e schema de saída.
7. Tarefas grandes viram subtarefas pequenas, uma de cada vez (uma tabela, uma rota).
8. Fidelidade à documentação do TCC e do PRD.

## Estado atual (atualizar conforme avançar)

- Venv ativo em `backend/venv`; uvicorn sobe com `uvicorn app.main:app --reload`, rodando de dentro da pasta `backend`.
- Banco `mnemos` criado no MySQL (usado pelo MySQL Workbench), ainda sem tabelas.
- `app/db/` e `app/core/` só têm `__init__.py`. Ainda NÃO existe `get_db` nem `session.py`.
- `disciplina_router.py` importa `from app.core.db import get_db`, que não existe. O import será corrigido quando o `session.py` for criado.
- Driver MySQL (ex.: pymysql) ainda não instalado no venv.
- Rotas hoje aparecem com `/api` duplicado (`/api/v1/api/...`). Corrigir depois, em mudança separada.

## Pendências de decisão

- Tabela `redefinicoes_senha` (tela "esqueci senha") NÃO está na lista oficial: fora do escopo até o usuário decidir.
- Dúvida aberta: a tag "Quiz" do tópico é o tipo do tópico ou só indica conteúdo gerado? Só resolver ao chegar em `topicos`.

## Segurança

- Credenciais do banco ficam em `.env` (python-dotenv). Nunca colocar senha no código.
- `.env` e `venv/` devem estar no `.gitignore`.
