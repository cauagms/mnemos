import { Injectable } from '@angular/core';
import { Observable, defer, of } from 'rxjs';

export interface Disciplina {
  id: string;
  nome: string;
}

/**
 * SIMULAÇÃO: nenhuma chamada HTTP é feita; as disciplinas vivem só na memória.
 * TODO: substituir pelas chamadas à API de disciplinas quando o backend existir.
 */
@Injectable({ providedIn: 'root' })
export class DisciplinasService {
  private disciplinas: Disciplina[] = [];
  private proximoId = 1;

  listar(): Observable<Disciplina[]> {
    return this.simular(() => [...this.disciplinas]);
  }

  criar(nome: string): Observable<Disciplina> {
    return this.simular(() => {
      const disciplina = { id: String(this.proximoId++), nome: nome.trim() };
      this.disciplinas = [...this.disciplinas, disciplina];
      return disciplina;
    });
  }

  renomear(id: string, nome: string): Observable<Disciplina> {
    return this.simular(() => {
      const disciplina = { id, nome: nome.trim() };
      this.disciplinas = this.disciplinas.map((d) => (d.id === id ? disciplina : d));
      return disciplina;
    });
  }

  excluir(id: string): Observable<void> {
    return this.simular(() => {
      this.disciplinas = this.disciplinas.filter((d) => d.id !== id);
    });
  }

  private simular<T>(operacao: () => T): Observable<T> {
    return defer(() => of(operacao()));
  }
}
