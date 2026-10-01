import { Injectable } from '@angular/core';
import { Observable, defer, of } from 'rxjs';

/** Flashcard gerado pela IA que ainda espera o aluno aprovar, editar ou descartar. */
export interface CardPendente {
  id: string;
  disciplina: string;
  topico: string;
  frente: string;
  verso: string;
}

/**
 * SIMULAÇÃO: nenhuma chamada HTTP é feita; os cards vivem só na memória e começam com os
 * exemplos abaixo. Aprovar ou descartar só tira o card da lista.
 * TODO: substituir pelas chamadas à API de curadoria quando o backend existir (aprovar manda o
 * card para a Revisão).
 */
@Injectable({ providedIn: 'root' })
export class CardsPendentesService {
  private cards: CardPendente[] = [
    {
      id: '1',
      disciplina: 'Matemática',
      topico: 'Álgebra Linear',
      frente: 'O que é o núcleo (kernel) de uma transformação linear?',
      verso:
        'É o conjunto de vetores que a transformação leva ao vetor nulo. Ele mostra o que a transformação apaga.',
    },
    {
      id: '2',
      disciplina: 'Matemática',
      topico: 'Álgebra Linear',
      frente: 'Para que servem os autovalores de uma matriz?',
      verso:
        'Indicam por quanto certos vetores são esticados ou encurtados pela transformação, sem mudar de direção.',
    },
    {
      id: '3',
      disciplina: 'Física',
      topico: 'Cinemática',
      frente: 'O que é aceleração média?',
      verso: 'É a variação da velocidade dividida pelo intervalo de tempo em que ela aconteceu.',
    },
  ];

  listar(): Observable<CardPendente[]> {
    return this.simular(() => [...this.cards]);
  }

  aprovar(id: string): Observable<void> {
    return this.simular(() => this.remover(id));
  }

  editar(id: string, frente: string, verso: string): Observable<CardPendente> {
    return this.simular(() => {
      const atual = this.cards.find((c) => c.id === id)!;
      const card = { ...atual, frente: frente.trim(), verso: verso.trim() };
      this.cards = this.cards.map((c) => (c.id === id ? card : c));
      return card;
    });
  }

  descartar(id: string): Observable<void> {
    return this.simular(() => this.remover(id));
  }

  private remover(id: string): void {
    this.cards = this.cards.filter((c) => c.id !== id);
  }

  private simular<T>(operacao: () => T): Observable<T> {
    return defer(() => of(operacao()));
  }
}
