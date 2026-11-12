
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// Estrutura de uma disciplina utilizada pelo Angular.
export interface Disciplina {
  id: string;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class DisciplinasService {

  // Endereço da API de disciplinas do backend FastAPI.
  private readonly apiUrl = 'http://localhost:8000/api/v1/disciplinas';

  // O HttpClient permite que o Angular faça requisições HTTP.
  constructor(private http: HttpClient) {}

  // GET: busca as disciplinas cadastradas no backend.
  listar(): Observable<Disciplina[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((resposta) => {
        // Aceita uma lista direta ou uma lista dentro de "disciplinas".
        const disciplinas = Array.isArray(resposta)
          ? resposta
          : resposta.disciplinas;

        // Converte os dados para o formato esperado pelo Angular.
        return disciplinas.map((disciplina: any) => ({
          id: String(disciplina.id),
          nome: disciplina.nome
        }));
      })
    );
  }

  // POST: criar uma disciplina.
  // O backend atual exige usuario_id, nome e descricao.
  criar(
    nome: string,
    usuarioId: number,
    descricao: string = ''
  ): Observable<Disciplina> {
    return this.http
      .post<any>(this.apiUrl, {
        usuario_id: usuarioId,
        nome: nome.trim(),
        descricao
      })
      .pipe(
        map((resposta) => {
          const disciplina = resposta.disciplina ?? resposta;

          return {
            id: String(disciplina.id),
            nome: disciplina.nome
          };
        })
      );
  }

  // PUT: renomear uma disciplina.
  // Depende da existência de uma rota PUT correspondente no backend.
  renomear(id: string, nome: string): Observable<Disciplina> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, {
        nome: nome.trim()
      })
      .pipe(
        map((resposta) => {
          const disciplina = resposta.disciplina ?? resposta;

          return {
            id: String(disciplina.id),
            nome: disciplina.nome
          };
        })
      );
  }

  // DELETE: excluir uma disciplina.
  // Depende da existência de uma rota DELETE correspondente no backend.
  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
