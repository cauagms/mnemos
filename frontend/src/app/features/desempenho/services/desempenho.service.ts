import { Injectable } from '@angular/core';
import { Observable, defer, of } from 'rxjs';

/** Todas as porcentagens vão de 0 a 100. */
export interface Desempenho {
  /** Taxa de acertos de todas as revisões. */
  aproveitamentoGeral: number;
  revisoesRealizadas: number;
  /** Dias seguidos com pelo menos uma revisão. */
  sequenciaDias: number;
  porDisciplina: { disciplina: string; aproveitamento: number }[];
  /** Aproveitamento ao fim de cada semana, da mais antiga para a atual. */
  evolucaoSemanal: number[];
  /** Tópicos com pior aproveitamento, do mais fraco para o menos fraco. */
  focar: { topico: string; disciplina: string; aproveitamento: number }[];
}

/**
 * SIMULAÇÃO: nenhuma chamada HTTP é feita; devolve sempre os números de exemplo abaixo.
 * TODO: substituir pela chamada à API de desempenho quando o backend existir.
 */
@Injectable({ providedIn: 'root' })
export class DesempenhoService {
  resumo(): Observable<Desempenho> {
    return defer(() =>
      of({
        aproveitamentoGeral: 78,
        revisoesRealizadas: 142,
        sequenciaDias: 9,
        porDisciplina: [
          { disciplina: 'Engenharia de Software', aproveitamento: 90 },
          { disciplina: 'Matemática', aproveitamento: 85 },
          { disciplina: 'Banco de Dados', aproveitamento: 62 },
        ],
        evolucaoSemanal: [61, 64, 66, 70, 73, 75, 78],
        focar: [
          { topico: 'SQL Avançado', disciplina: 'Banco de Dados', aproveitamento: 45 },
          { topico: 'Casos de Uso', disciplina: 'Engenharia de Software', aproveitamento: 49 },
          { topico: 'Normalização', disciplina: 'Banco de Dados', aproveitamento: 52 },
        ],
      }),
    );
  }
}
