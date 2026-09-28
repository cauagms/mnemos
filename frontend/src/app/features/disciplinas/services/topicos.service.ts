import { Injectable } from '@angular/core';
import { Observable, defer, of } from 'rxjs';

export interface Topico {
  id: string;
  nome: string;
  formato: 'flashcards' | 'quiz';
}

/**
 * SIMULAÇÃO: nenhuma chamada HTTP é feita; os tópicos vivem só na memória e toda
 * disciplina começa sem tópicos.
 * TODO: substituir pela chamada à API de tópicos quando o backend existir.
 */
@Injectable({ providedIn: 'root' })
export class TopicosService {
  private readonly topicos: Record<string, Topico[]> = {};
  private proximoId = 1;

  listar(disciplinaId: string): Observable<Topico[]> {
    return defer(() => of([...(this.topicos[disciplinaId] ?? [])]));
  }

  criar(disciplinaId: string, nome: string, formato: Topico['formato']): Observable<Topico> {
    return defer(() => {
      const topico = { id: String(this.proximoId++), nome: nome.trim(), formato };
      this.topicos[disciplinaId] = [...(this.topicos[disciplinaId] ?? []), topico];
      return of(topico);
    });
  }

  editar(
    disciplinaId: string,
    id: string,
    nome: string,
    formato: Topico['formato'],
  ): Observable<Topico> {
    return defer(() => {
      const topico = { id, nome: nome.trim(), formato };
      this.topicos[disciplinaId] = (this.topicos[disciplinaId] ?? []).map((t) =>
        t.id === id ? topico : t,
      );
      return of(topico);
    });
  }

  excluir(disciplinaId: string, id: string): Observable<void> {
    return defer(() => {
      this.topicos[disciplinaId] = (this.topicos[disciplinaId] ?? []).filter((t) => t.id !== id);
      return of(undefined);
    });
  }
}
