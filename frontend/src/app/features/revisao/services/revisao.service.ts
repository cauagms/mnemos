import { Injectable } from '@angular/core';
import { Observable, defer, of } from 'rxjs';

/** "hoje": itens que o agendamento marcou para hoje; "novos": itens que nunca foram estudados. */
export type ModoRevisao = 'hoje' | 'novos';

/** Quanto foi fácil lembrar de um flashcard; é o que alimenta o agendamento (FSRS). */
export type Nota = 'errei' | 'dificil' | 'bom' | 'facil';

interface ItemBase {
  id: string;
  disciplina: string;
  topico: string;
  pergunta: string;
}

export interface Flashcard extends ItemBase {
  tipo: 'flashcard';
  resposta: string;
}

export interface Alternativa {
  texto: string;
  /** Por que a alternativa está certa ou errada; aparece depois que o aluno responde. */
  explicacao: string;
}

export interface Questao extends ItemBase {
  tipo: 'quiz';
  alternativas: Alternativa[];
  /** Índice da alternativa certa em `alternativas`. */
  correta: number;
}

export type ItemRevisao = Flashcard | Questao;

export interface ResumoRevisao {
  hoje: number;
  novos: number;
}

/**
 * SIMULAÇÃO: nenhuma chamada HTTP é feita; as filas vivem só na memória e começam com
 * os itens de exemplo abaixo. Avaliar ou responder um item só o tira da fila.
 * TODO: substituir pelas chamadas à API de revisão (que aplica o FSRS) quando o backend existir.
 */
@Injectable({ providedIn: 'root' })
export class RevisaoService {
  private filas: Record<ModoRevisao, ItemRevisao[]> = {
    hoje: [
      {
        id: '1',
        tipo: 'flashcard',
        disciplina: 'Matemática',
        topico: 'Álgebra Linear',
        pergunta: 'O que significa dizer que dois vetores são linearmente independentes?',
        resposta:
          'Que nenhum deles pode ser escrito como múltiplo (ou combinação) do outro. Cada um aponta para uma direção que o outro não cobre.',
      },
      {
        id: '2',
        tipo: 'quiz',
        disciplina: 'Banco de Dados',
        topico: 'Normalização',
        pergunta: 'Uma tabela está na 2ª forma normal quando:',
        alternativas: [
          {
            texto: 'Não possui grupos repetidos de colunas',
            explicacao:
              'Não ter grupos repetidos de colunas é justamente o critério da 1FN, o passo anterior. A 2FN pressupõe isso e vai além, olhando para as dependências em relação à chave.',
          },
          {
            texto: 'Está na 1FN e todo atributo não-chave depende da chave inteira',
            explicacao:
              'A 2FN parte da 1FN e elimina dependências parciais: cada atributo não-chave precisa depender da chave primária completa, não apenas de parte dela.',
          },
          {
            texto: 'Não possui dependências transitivas entre atributos',
            explicacao:
              'Eliminar dependências transitivas, quando um atributo depende de outro atributo não-chave, é o critério da 3FN, não da 2FN.',
          },
          {
            texto: 'Todas as colunas têm o mesmo tipo de dado',
            explicacao:
              'As formas normais tratam de dependências entre atributos, não dos tipos de dado. Colunas de tipos diferentes são normais em qualquer forma normal.',
          },
        ],
        correta: 1,
      },
      {
        id: '3',
        tipo: 'flashcard',
        disciplina: 'Matemática',
        topico: 'Álgebra Linear',
        pergunta: 'O que é o determinante de uma matriz quadrada?',
        resposta:
          'Um número que indica se a matriz é inversível (determinante diferente de zero) e quanto ela escala áreas ou volumes.',
      },
      {
        id: '4',
        tipo: 'flashcard',
        disciplina: 'Banco de Dados',
        topico: 'Normalização',
        pergunta: 'O que é uma dependência funcional?',
        resposta:
          'Quando o valor de um atributo (ou conjunto de atributos) determina de forma única o valor de outro.',
      },
      {
        id: '5',
        tipo: 'quiz',
        disciplina: 'Banco de Dados',
        topico: 'Normalização',
        pergunta: 'Qual forma normal elimina dependências transitivas?',
        alternativas: [
          {
            texto: '1FN',
            explicacao: 'A 1FN só exige valores atômicos, sem grupos repetidos de colunas.',
          },
          {
            texto: '2FN',
            explicacao: 'A 2FN elimina dependências parciais da chave, não as transitivas.',
          },
          {
            texto: '3FN',
            explicacao:
              'Na 3FN, nenhum atributo não-chave pode depender de outro atributo não-chave: é o fim das dependências transitivas.',
          },
          {
            texto: 'Nenhuma delas',
            explicacao: 'A 3FN trata exatamente desse caso.',
          },
        ],
        correta: 2,
      },
    ],
    novos: [
      {
        id: '6',
        tipo: 'flashcard',
        disciplina: 'Física',
        topico: 'Cinemática',
        pergunta: 'Qual a diferença entre velocidade média e velocidade instantânea?',
        resposta:
          'A média é o deslocamento total dividido pelo tempo total; a instantânea é a velocidade em um momento específico.',
      },
      {
        id: '7',
        tipo: 'quiz',
        disciplina: 'Física',
        topico: 'Cinemática',
        pergunta: 'No movimento uniforme, a aceleração é:',
        alternativas: [
          {
            texto: 'Constante e positiva',
            explicacao:
              'Aceleração constante e diferente de zero é o movimento uniformemente variado, não o uniforme.',
          },
          {
            texto: 'Nula',
            explicacao:
              'No movimento uniforme a velocidade não muda; como aceleração é a variação da velocidade, ela é zero.',
          },
          {
            texto: 'Variável',
            explicacao: 'Se a aceleração variasse, a velocidade também mudaria, e o movimento não seria uniforme.',
          },
          {
            texto: 'Igual à velocidade',
            explicacao:
              'Aceleração e velocidade são grandezas diferentes; no movimento uniforme a velocidade é constante e a aceleração é zero.',
          },
        ],
        correta: 1,
      },
      {
        id: '8',
        tipo: 'flashcard',
        disciplina: 'Matemática',
        topico: 'Álgebra Linear',
        pergunta: 'O que é uma matriz identidade?',
        resposta:
          'Uma matriz quadrada com 1 na diagonal principal e 0 no resto; multiplicar por ela não altera a outra matriz.',
      },
    ],
  };

  resumo(): Observable<ResumoRevisao> {
    return this.simular(() => ({ hoje: this.filas.hoje.length, novos: this.filas.novos.length }));
  }

  sessao(modo: ModoRevisao): Observable<ItemRevisao[]> {
    return this.simular(() => [...this.filas[modo]]);
  }

  avaliar(id: string, nota: Nota): Observable<void> {
    return this.simular(() => this.remover(id));
  }

  /** `alternativa` é o índice escolhido em `Questao.alternativas`. */
  responder(id: string, alternativa: number): Observable<void> {
    return this.simular(() => this.remover(id));
  }

  private remover(id: string): void {
    this.filas = {
      hoje: this.filas.hoje.filter((i) => i.id !== id),
      novos: this.filas.novos.filter((i) => i.id !== id),
    };
  }

  private simular<T>(operacao: () => T): Observable<T> {
    return defer(() => of(operacao()));
  }
}
