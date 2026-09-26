# PRD — Mnemos

**Produto:** Mnemos
**Tipo:** Plataforma web

---

## 1. Visão geral e problema

No ensino superior, a sobrecarga de conteúdos compromete a memorização do aprendizado no longo prazo, fenômeno descrito pela Curva do Esquecimento de Ebbinghaus. A Repetição Espaçada (revisar o conteúdo em intervalos que aumentam com o tempo) é uma das estratégias mais eficazes para reduzir essa perda, mas sua adoção esbarra em dois problemas práticos:

- **Tempo alto para criar material manual** (digitar perguntas e respostas de cada tópico estudado).
- **Esquecimento das datas de revisão**, já que o aluno precisa lembrar sozinho quando revisar cada conteúdo.

Ferramentas como Google Gemini e ChatGPT ajudam pontualmente, mas só respondem quando o aluno pergunta e não acompanham o seu desempenho. Softwares tradicionais, como o Anki, exigem a digitação manual de cada pergunta.

**Mnemos** resolve isso automatizando o ciclo inteiro: o aluno envia o material de estudo, a IA gera flashcards e quizzes, o aluno revisa os flashcards, e a plataforma agenda e avisa as revisões sozinha, com base no desempenho real do aluno.

---

## 2. Objetivo do produto

Desenvolver uma plataforma web que automatize o ciclo de repetição espaçada, unindo:
- geração automática de flashcards e quizzes a partir de documentos de estudo,
- curadoria dos flashcards pelo próprio aluno,
- agendamento adaptativo das revisões com o algoritmo FSRS,
- notificações ativas por e-mail,
- painel de desempenho (Learning Analytics, indicadores visuais de quanto o aluno está retendo de cada disciplina).

---

## 3. Métricas de sucesso

| Métrica | Meta |
|---|---|
| Usabilidade (SUS) | ≥ 75 pontos (mercado: 68) |
| Tempo de resposta da API | < 500 ms (90% das requisições) |
| Extração de texto (doc. até 15 páginas) | < 5 segundos |
| Confiabilidade das tarefas em segundo plano | ≥ 95% de sucesso, incluindo notificações |
| Acurácia na extração de conteúdo | ≥ 85% |

*(SUS = System Usability Scale, questionário padronizado de usabilidade.)*

---

## 4. Público-alvo

Estudantes universitários com alta carga de disciplinas e pouco tempo para organizar cronogramas de revisão manualmente. Precisam estudar com frequência e ao longo do tempo, mas não têm tempo para criar cartões de estudo um por um.

---

## 5. Requisitos funcionais (RF)

| Código | Descrição |
|---|---|
| RF01 | O sistema deve permitir o envio e o processamento automático de arquivos em PDF, Word e PowerPoint. |
| RF02 | O sistema deve gerar automaticamente flashcards e quizzes por meio de Inteligência Artificial. |
| RF03 | O sistema deve permitir que o aluno revise, edite, aprove ou descarte os flashcards gerados. |
| RF04 | O sistema deve agendar de forma adaptativa as revisões dos conteúdos. |
| RF05 | O sistema deve enviar notificações ativas ao aluno sobre revisões pendentes. |
| RF06 | O sistema deve exibir um painel com o desempenho e a taxa de retenção do aluno por disciplina. |

## 6. Requisitos não funcionais (RNF)

| Código | Nome | Descrição |
|---|---|---|
| RNF01 | Disponibilidade | O sistema deve ser acessível por navegador, sem necessidade de instalação. |
| RNF02 | Desempenho | O sistema deve responder em menos de 500 milissegundos em 90% das requisições e extrair o texto de documentos de até 15 páginas em menos de 5 segundos. |
| RNF03 | Confiabilidade | O sistema deve executar com sucesso pelo menos 95% das tarefas em segundo plano, incluindo o envio das notificações nos horários programados. |
| RNF04 | Usabilidade | O sistema deve ter interface intuitiva e responsiva, atingindo pontuação mínima de 75 no questionário SUS. |
| RNF05 | Escalabilidade | O sistema deve suportar o aumento no número de usuários e no volume de dados sem perda de desempenho. |

---

## 7. Fluxos principais (user stories)

**Acesso à conta (pré-requisito)**
Como Aluno, quero criar minha conta e entrar na plataforma, para que minhas disciplinas, materiais e revisões fiquem vinculados a mim.

**UC01 — Upload e processamento de material** (RF01, RF02)
Como Aluno, quero enviar um arquivo de estudo (PDF, DOCX ou PPTX), para que a plataforma extraia o conteúdo e gere automaticamente flashcards ou quizzes, sem eu precisar digitar nada.

**UC02 — Curadoria de flashcards** (RF03)
Como Aluno, quero revisar, editar, aprovar ou descartar os flashcards gerados pela IA antes de começar a estudá-los, para garantir que o material reflita o que eu realmente preciso aprender.
*(Quizzes não passam por essa etapa: são salvos como definitivos assim que gerados, pois a integridade da avaliação precisa ser preservada.)*

**UC03 — Responder revisão espaçada** (RF04)
Como Aluno, quero responder aos itens de estudo agendados para hoje, para que o sistema recalcule automaticamente quando devo revisar aquele conteúdo de novo.

**UC04 — Receber notificação de revisão** (RF05)
Como Aluno, quero ser avisado por e-mail quando tiver revisões pendentes, para revisar o conteúdo antes de esquecê-lo.

**UC05 — Visualizar painel de desempenho** (RF06)
Como Aluno, quero ver gráficos e métricas do meu progresso, para saber quais disciplinas exigem mais atenção.

---

## 8. Fora de escopo (MVP)

O MVP cobre: cadastro e login do aluno, necessários para vincular disciplinas, materiais e revisões a cada conta; upload de arquivos; geração automática de flashcards e quizzes; curadoria dos flashcards; agendamento adaptativo de revisões; notificações de estudo por e-mail; e painel de desempenho.

Ficam fora desta primeira versão:
- Atalhos de teclado e ações em lote na curadoria (planejado para quando houver base de usuários recorrentes validada).
- Camadas adicionais de ajuda (tooltip, FAQ, onboarding guiado).
- Suporte a formatos de arquivo além de PDF, DOCX e PPTX.
- Notificações push.
- Aplicativo mobile nativo (a versão web já é responsiva).

---

## 9. Diferencial competitivo

| Funcionalidade / Critério | Anki | Quizlet | ChatGPT / Gemini | Mnemos |
|---|---|---|---|---|
| Criação de flashcards por IA a partir de arquivos | Não | Sim | Sim | Sim |
| Curadoria do conteúdo criado pela IA | Não | Sim | Não | Sim |
| Cálculo da data de cada revisão | Sim | Não | Não | Sim |
| Aviso ao aluno por e-mail sobre revisões pendentes | Não | Não | Não | Sim |

- **Anki:** agenda bem as revisões (usa o SM-2 e, desde a versão 23.10, também o FSRS), mas os cards são criados à mão, pergunta por pergunta.
- **Quizlet:** gera flashcards e quizzes com IA a partir de arquivos, mas foca em sessões de estudo e jogos, não no agendamento das revisões ao longo das semanas.
- **ChatGPT e Gemini:** geram perguntas a partir de um arquivo, mas funcionam como conversa: não guardam as respostas do aluno, não calculam quando revisar e não avisam o aluno.

O diferencial central: cada ferramenta resolve só uma parte do processo, enquanto o Mnemos une extração do conteúdo, geração, curadoria, agendamento e aviso das revisões numa única plataforma.

---