# 🧠 MNEMOS -  PLATAFORMA DE REPETIÇÃO ESPAÇADA COM IA

Plataforma web desenvolvida para estudantes universitários que precisam memorizar grandes volumes de conteúdo ao longo do semestre. O aluno envia o material de estudo, a IA gera flashcards e quizzes, o aluno faz a curadoria dos cards, e a plataforma agenda e avisa as revisões sozinha, com base no desempenho real de cada conteúdo.

O projeto une, em um único fluxo, o que hoje está espalhado entre ferramentas diferentes: extração do conteúdo, geração automática das perguntas, curadoria, agendamento adaptativo das revisões e painel de desempenho por disciplina.

## 🎥 Vídeo de Apresentação do Projeto

📌 Assista ao vídeo oficial de apresentação do Mnemos:

👉 _inserir link do vídeo_

## 📸 Capturas de Tela

### Login e cadastro

| Login | Cadastro |
|---|---|
| <img src="docs/capturas/login.png" width="480" alt="Tela de login do Mnemos, com e-mail e senha preenchidos" /> | <img src="docs/capturas/cadastro.png" width="480" alt="Tela de criação de conta, com nome, e-mail, senha e confirmação de senha" /> |

### Disciplinas e tópicos

| Minhas Disciplinas | Tópicos da disciplina |
|---|---|
| <img src="docs/capturas/disciplinas.png" width="480" alt="Grade de disciplinas com os cards Banco de Dados, Matemática e Engenharia de Software" /> | <img src="docs/capturas/topicos.png" width="480" alt="Tópicos Normalização com flashcards e SQL Avançado com quiz na disciplina Banco de Dados" /> |

### Envio de material

![Tela de envio de material com o arquivo aula-05-normalizacao.pdf selecionado](docs/capturas/enviar-material.png)

### Curadoria de flashcards

![Cards pendentes, com frente, verso e as ações Aprovar, Editar e Descartar](docs/capturas/cards-pendentes.png)

### Revisão

| Resumo do dia | Flashcard |
|---|---|
| <img src="docs/capturas/revisao.png" width="480" alt="Tela de revisão com 5 itens esperando hoje e 3 recém-chegados" /> | <img src="docs/capturas/revisao-flashcard.png" width="480" alt="Flashcard com a pergunta e o botão Mostrar resposta" /> |

![Flashcard virado, com a resposta e as notas Errei, Difícil, Bom e Fácil](docs/capturas/revisao-resposta.png)

![Questão de quiz respondida, com a alternativa correta e a explicação de cada alternativa](docs/capturas/revisao-quiz.png)

### Painel de desempenho

![Painel de desempenho com aproveitamento geral, revisões realizadas, sequência de estudos, aproveitamento por disciplina, evolução semanal e tópicos para focar](docs/capturas/desempenho.png)

## 🚀 Funcionalidades

- ✅ Cadastro de usuário com validação de nome, e-mail, senha com no mínimo 8 caracteres e confirmação de senha
- ✅ Tela de login com exibição de senha e estado de carregamento
- ✅ Layout responsivo: sidebar no desktop e barra de navegação inferior no mobile
- ✅ Gerenciamento de disciplinas: criar, renomear e excluir
- ✅ Gerenciamento de tópicos por disciplina, com formato `flashcards` ou `quiz`
- ✅ Envio de material por arrastar-e-soltar ou seleção de arquivo PDF, DOCX ou PPTX, com tela de processamento
- ✅ Curadoria de flashcards: editar frente e verso direto na lista ou em modal, aprovar e descartar
- ✅ Sessão de revisão nos modos `hoje` e `novos`, com flashcards que viram para revelar a resposta e avaliação pelas notas Errei, Difícil, Bom e Fácil
- ✅ Quiz com alternativas, feedback e explicação de cada alternativa
- ✅ Painel de desempenho: aproveitamento geral, revisões realizadas, sequência de dias, aproveitamento por disciplina, evolução semanal e tópicos para focar
- ✅ Navegação por rotas, estados vazios e diálogos de confirmação em todas as telas
- ✅ Testes unitários das telas e serviços com Vitest

## 🧩 Estrutura do Projeto

```txt
MNEMOS/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dependencies/     # Dependências compartilhadas das rotas
│   │   │   └── v1/
│   │   │       └── routers/      # Routers versionados da API
│   │   ├── core/                 # Configurações e regras centrais
│   │   ├── db/                   # Conexão e sessões do banco
│   │   ├── exceptions/           # Exceções da aplicação
│   │   ├── factories/            # Fábricas de objetos
│   │   ├── ingestion/            # Entrada de materiais de estudo
│   │   │   ├── extractors/       # Extração de texto de PDF, DOCX e PPTX
│   │   │   ├── ocr/              # Reconhecimento de texto em imagens
│   │   │   └── rag/              # Recuperação de trechos para a IA
│   │   ├── integrations/         # Integrações externas de IA e e-mail
│   │   ├── models/               # Modelos de dados
│   │   ├── repositories/         # Acesso ao banco
│   │   ├── scheduling/           # Agendamento das revisões com FSRS
│   │   ├── schemas/              # Schemas Pydantic de entrada e saída
│   │   ├── services/             # Regras de negócio
│   │   ├── tasks/                # Tarefas em segundo plano
│   │   └── main.py               # Aplicação FastAPI
│   ├── tests/
│   │   ├── integration/          # Testes de integração
│   │   └── unit/                 # Testes unitários
│   ├── .env                      # Variáveis de ambiente (não versionado)
│   └── requirements.txt          # Dependências Python
│
├── frontend/
│   ├── public/                   # Recursos estáticos, como o favicon
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/
│   │   │   │   ├── auth/         # Login e cadastro
│   │   │   │   ├── cards-pendentes/  # Curadoria dos flashcards gerados
│   │   │   │   ├── desempenho/   # Painel de desempenho
│   │   │   │   ├── disciplinas/  # Disciplinas e tópicos
│   │   │   │   ├── revisao/      # Sessões de revisão de flashcards e quiz
│   │   │   │   └── upload/       # Envio de material
│   │   │   ├── layout/           # Shell, sidebar e navegação inferior
│   │   │   ├── app.config.ts     # Configuração da aplicação
│   │   │   ├── app.routes.ts     # Rotas
│   │   │   ├── app.ts            # Componente raiz
│   │   │   └── app.html
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss           # Variáveis de cor e estilos globais
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── capturas/                 # Capturas de tela usadas no README
│   └── PRD.MD                    # Documento de requisitos do produto
├── .gitignore
└── README.md                     # Este arquivo
```

## 🛠 Tecnologias Utilizadas

| Tecnologia | Descrição |
|---|---|
| Angular | Estrutura das telas e componentes |
| TypeScript | Tipagem estática do front-end |
| Python | Linguagem do back-end |
| FastAPI | Rotas da API e validação dos dados |
| MySQL | Armazenamento dos dados |
| Celery | Processamento em segundo plano |
| n8n | Integração com a IA |
| FSRS | Cálculo das datas de revisão |

## ⚙ Pré-requisitos

Antes de começar, você precisará ter:

- **Node.js** 20.19+ ou 22.12+, exigência do Angular 21
- **npm** 10.9.4, versão declarada no `package.json`
- **Python** 3.12+
- **MySQL** 8+

## ⚙ Configuração

### 1. Variáveis de ambiente

Crie o arquivo `backend/.env` com as variáveis abaixo:

```env
# Banco de dados
DATABASE_URL=mysql+pymysql://root:senha@localhost:3306/mnemos

# Autenticação (JWT)
SECRET_KEY=troque-por-uma-chave-secreta
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Geração de flashcards e quizzes (n8n + IA)
N8N_WEBHOOK_URL=https://n8n.exemplo.com/webhook/mnemos

# Tarefas em segundo plano (Celery)
CELERY_BROKER_URL=redis://localhost:6379/0

# Notificações por e-mail
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_USER=seu-email@exemplo.com
SMTP_PASSWORD=sua-senha
```

O arquivo `.env` já está no `.gitignore` e não deve ser versionado.

### 2. Banco de dados

Crie o banco `mnemos` no MySQL e aplique as migrações:

```bash
cd backend
alembic upgrade head
```

As migrações criam as tabelas de usuários, disciplinas, tópicos, materiais, flashcards, questões e histórico de revisões.

## 🚦 Como Executar o Projeto

### Opção 1: Frontend

```bash
# Clone o repositório
git clone https://github.com/cauagms/mnemos.git

# Navegue até a pasta do frontend
cd mnemos/frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```

Acesse **http://localhost:4200** no navegador.

### Opção 2: Backend

```bash
# A partir da raiz do repositório
cd backend

# Crie e ative o ambiente virtual
python -m venv .venv

# Windows, PowerShell ou CMD
.venv\Scripts\activate

# Linux / macOS / Git Bash
source .venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Suba a API com recarga automática
python -m uvicorn app.main:app --reload
```

A API responde em **http://localhost:8000** e a documentação interativa do Swagger fica em **http://localhost:8000/docs**.

## 📋 Funcionalidades Detalhadas

### Autenticação

- **Cadastro:** valida nome preenchido, e-mail válido, senha com no mínimo 8 caracteres e confirmação igual. Os erros só aparecem depois da primeira tentativa de envio, e o foco vai para o primeiro campo inválido.
- **Login:** campos de e-mail e senha, botão para exibir/ocultar a senha e estado de carregamento no envio.
- **Acesso:** concluído o login, o aluno entra no painel em `/disciplinas`.

### Disciplinas e tópicos

- Criar, renomear e excluir disciplinas, com diálogos de confirmação para as exclusões.
- Cada disciplina abre a lista de tópicos, e cada tópico é criado com um formato: **flashcards**, que gera cards para curadoria, ou **quiz**, que gera questões respondidas direto na revisão.
- Estados vazios orientam o aluno a criar a primeira disciplina ou o primeiro tópico.

### Envio de material

- Área de arrastar-e-soltar ou seleção pelo explorador de arquivos, aceitando **PDF, DOCX e PPTX**.
- Mostra nome e tamanho do arquivo, permite remover antes de enviar e valida o formato escolhido.
- Exibe a tela de processamento e, ao final, direciona para **Cards Pendentes** para tópicos de flashcards ou **Revisão** para tópicos de quiz, conforme o formato do tópico.

### Curadoria de flashcards

- Lista os cards pendentes com a trilha disciplina › tópico, mostrando frente e verso.
- **Editar:** inline ou em modal, com Salvar desabilitado enquanto algum campo estiver vazio.
- **Aprovar:** o card sai da fila de pendentes e passa a fazer parte da revisão.
- **Descartar:** pede confirmação antes de remover o card.
- Estado vazio orienta o aluno a enviar um material em um tópico de flashcards.

### Revisão

- Tela inicial com dois contadores: itens **esperando hoje**, já agendados, e **recém-chegados**, nunca estudados.
- Sessão mostra um item por vez, com barra de progresso:
  - **Flashcard:** frente com a pergunta, botão para virar e revelar o verso, seguido das notas **Errei / Difícil / Bom / Fácil**. A nota é o que alimenta o agendamento FSRS.
  - **Quiz:** alternativas A–D, confirmação da escolha e explicação de por que cada alternativa está certa ou errada.
- Controles de teclado e foco gerenciado para acessibilidade, com a altura do card acompanhando o conteúdo.

### Painel de desempenho

- **Aproveitamento geral**, **revisões realizadas** e **sequência de estudos** em dias seguidos.
- **Aproveitamento por disciplina**, com barra e nível de cor por faixa.
- **Evolução semanal** em gráfico de linha, com o período coberto.
- **Onde focar agora:** tópicos com pior aproveitamento, do mais fraco para o menos fraco.
