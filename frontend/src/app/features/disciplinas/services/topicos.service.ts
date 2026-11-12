
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Topico {
  id: string;
  nome: string;
  formato: 'flashcard' | 'quiz';
}

interface TopicoResponse {
  id: number;
  nome: string;
  disciplina_id: number;
  formato: 'flashcard' | 'quiz';
}

interface CriarTopicoResponse {
  mensagem: string;
  topico: TopicoResponse;
  formato: 'flashcard' | 'quiz';
}

@Injectable({
  providedIn: 'root',
})
export class TopicosService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Lista os tópicos de uma disciplina.
   */
  listar(disciplinaId: string): Observable<Topico[]> {
    return this.http
      .get<TopicoResponse[]>(
        `${this.apiUrl}/disciplinas/${disciplinaId}/topicos`,
      )
      .pipe(
        map((topicos) => topicos.map((topico) => this.mapearTopico(topico))),
      );
  }

  /**
   * Cria um tópico em uma disciplina.
   */
  criar(
    disciplinaId: string,
    nome: string,
    formato: Topico['formato'],
  ): Observable<Topico> {
    return this.http
      .post<CriarTopicoResponse>(
        `${this.apiUrl}/disciplinas/${disciplinaId}/topicos`,
        {
          nome: nome.trim(),
          formato,
        },
      )
      .pipe(
        map((resposta) => ({
          id: String(resposta.topico.id),
          nome: resposta.topico.nome,
          formato: resposta.formato,
        })),
      );
  }

  /**
   * Edita um tópico existente.
   * Confirme se o backend utiliza PUT nesta rota.
   */
  editar(
    disciplinaId: string,
    id: string,
    nome: string,
    formato: Topico['formato'],
  ): Observable<Topico> {
    return this.http
      .put<TopicoResponse>(
        `${this.apiUrl}/disciplinas/${disciplinaId}/topicos/${id}`,
        {
          nome: nome.trim(),
          formato,
        },
      )
      .pipe(map((topico) => this.mapearTopico(topico)));
  }

  /**
   * Exclui um tópico existente.
   * Confirme se o backend utiliza DELETE nesta rota.
   */
  excluir(disciplinaId: string, id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/disciplinas/${disciplinaId}/topicos/${id}`,
    );
  }

  /**
   * Converte a resposta da API para o formato usado pelo frontend.
   */
  private mapearTopico(topico: TopicoResponse): Topico {
    return {
      id: String(topico.id),
      nome: topico.nome,
      formato: topico.formato,
    };
  }
}
