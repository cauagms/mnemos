# PRD — Mnemos

**Produto:** Mnemos
**Tipo:** Plataforma web

---

## 1. Visão geral e problema

No ensino superior, a sobrecarga de conteúdos compromete a retenção do aprendizado no longo prazo, fenômeno descrito pela Curva do Esquecimento de Ebbinghaus. A técnica de Repetição Espaçada (Spaced Repetition, revisar o conteúdo em intervalos crescentes antes de esquecê-lo) é cientificamente eficaz, mas sua adoção esbarra em dois problemas práticos:

- **Tempo alto para criar material manual** (digitar perguntas e respostas de cada tópico estudado).
- **Esquecimento das datas de revisão**, já que o aluno precisa lembrar sozinho quando revisar cada conteúdo.

Ferramentas como Google Gemini e ChatGPT ajudam pontualmente, mas operam de forma reativa (o aluno precisa pedir), sem gerenciar ativamente a rotina de estudos.

**Mnemos** resolve isso automatizando o ciclo inteiro: o aluno envia o material de estudo, a IA gera os itens de revisão, e a plataforma agenda e notifica as revisões sozinha, com base no desempenho real do aluno.

---

## 2. Objetivo do produto

Desenvolver uma plataforma web que automatize o ciclo de repetição espaçada, unindo:
- geração automática de flashcards e quizzes a partir de documentos de estudo,
- agendamento adaptativo das revisões,
- notificações ativas,
- painel de acompanhamento de desempenho (Learning Analytics, indicadores visuais de quanto o aluno está retendo de cada matéria).

---

## 3. Métricas de sucesso

| Métrica | Meta |
|---|---|
| Usabilidade (SUS) | ≥ 75 pontos (mercado: 68) |
| Acurácia na extração de conteúdo | ≥ 85% |
| Tempo de resposta da API | < 500 ms (90% das requisições) |
| Processamento (doc. até 15 páginas) | < 5 segundos |
| Confiabilidade de notificações/tarefas | ≥ 95% de sucesso |

*(SUS = System Usability Scale, questionário padronizado de usabilidade.)*

---

## 4. Público-alvo

Alunos do ensino superior com alta carga de disciplinas e pouca disponibilidade de tempo para organizar cronogramas de revisão manualmente. Precisam estudar com frequência e ao longo do tempo, mas não têm tempo nem paciência para criar cartões de estudo um por um.

---

## 5. Requisitos funcionais (RF)

| Código | Descrição |
|---|---|
| RF01 | O sistema deve agendar adaptativamente as revisões dos conteúdos. |
| RF02 | O sistema deve permitir o upload e processamento automático de arquivos. |
| RF03 | O sistema deve gerar automaticamente flashcards e quizzes via IA generativa. |
| RF04 | O sistema deve enviar notificações ativas ao aluno. |
| RF05 | O sistema deve exibir um painel de desempenho do aluno. |

## 6. Requisitos não funcionais (RNF)

| Código | Descrição |
|---|---|
| RNF01 | O sistema deve ter interface intuitiva e responsiva. |
| RNF02 | O sistema deve responder rapidamente às requisições do usuário. |
| RNF03 | O sistema deve suportar crescimento de usuários e volume de dados. |
| RNF04 | O sistema deve ser acessível via navegador, sem necessidade de instalação. |
| RNF05 | O sistema deve proteger os dados dos usuários. |

---

## 7. Fluxos principais (user stories)

**UC01 — Upload e processamento de material**
Como Aluno, quero enviar um arquivo de estudo (PDF, DOCX ou PPTX), para que a plataforma extraia o conteúdo e gere automaticamente flashcards ou quizzes, sem eu precisar digitar nada.

**UC02 — Curadoria de flashcards**
Como Aluno, quero revisar, editar ou descartar os flashcards gerados pela IA antes de começar a estudá-los, para garantir que o material reflita o que eu realmente preciso aprender.
*(Quizzes não passam por essa etapa: são salvos como definitivos assim que gerados, pois a integridade da avaliação precisa ser preservada.)*

**UC03 — Responder revisão espaçada**
Como Aluno, quero responder aos itens de estudo agendados para hoje e avaliar meu próprio desempenho, para que o sistema recalcule automaticamente quando devo revisar aquele conteúdo de novo.

**UC04 — Visualizar painel de desempenho**
Como Aluno, quero ver gráficos e métricas do meu progresso, para saber quais matérias exigem mais atenção.

**UC05 — Receber notificação de revisão**
Como Aluno, quero ser avisado (e-mail ou push) quando tiver revisões pendentes, para não perder o conteúdo no limiar crítico do esquecimento.

---

## 8. Fora de escopo (MVP)

O MVP cobre: upload de arquivos, geração automática de flashcards e quizzes, agendamento adaptativo de revisões e notificações de estudo.

Ficam fora desta primeira versão:
- Atalhos de teclado e ações em lote na curadoria (planejado para quando houver base de usuários recorrentes validada).
- Camadas adicionais de ajuda (tooltip, FAQ, onboarding guiado).
- Suporte a formatos de arquivo além de PDF, DOCX e PPTX.
- Aplicativo mobile nativo (a versão web já é responsiva).

---

## 9. Diferencial competitivo

| Critério | Mnemos | Anki | Quizlet | ChatGPT / Gemini |
|---|---|---|---|---|
| Geração automática de flashcards a partir de documentos | Sim, via IA generativa | Criação manual | Parcial, sem estruturação por tópico | Gera sob demanda, sem persistência |
| Agendamento por repetição espaçada | Algoritmo adaptativo próprio (FSRS) | Algoritmo SM-2 (fixo) | Não possui | Não possui |
| Notificações ativas de revisão | E-mail e push automáticos | Depende do usuário lembrar | Não possui | Não possui |
| Painel de Learning Analytics | Sim, com indicadores visuais | Estatísticas básicas | Não possui | Não possui |
| Histórico temporal de desempenho | Persistente no banco de dados | Local, limitado | Parcial | Sem memória entre sessões |

O diferencial central: enquanto as outras ferramentas resolvem só uma parte do processo (ou a criação, ou o agendamento, ou a geração de conteúdo), o Mnemos une extração, geração, agendamento e monitoramento numa única esteira, sem exigir digitação manual do aluno.

---
