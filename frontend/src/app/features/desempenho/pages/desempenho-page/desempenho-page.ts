import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DesempenhoService } from '../../services/desempenho.service';

/** Bom a partir de 70%, atenção de 50% a 69%, baixo abaixo de 50%. */
type Nivel = 'bom' | 'atencao' | 'baixo';

/** Painel de desempenho: números gerais, aproveitamento por disciplina, evolução e onde focar. */
@Component({
  selector: 'app-desempenho-page',
  templateUrl: './desempenho-page.html',
  // Reaproveita título e subtítulo da tela de Disciplinas.
  styleUrls: [
    '../../../disciplinas/pages/disciplinas-page/disciplinas-page.scss',
    './desempenho-page.scss',
  ],
})
export class DesempenhoPage {
  /** `undefined` enquanto os dados ainda não chegaram. */
  protected readonly desempenho = toSignal(inject(DesempenhoService).resumo());

  /** Variação entre a primeira e a última semana da série. */
  protected readonly evolucao = computed(() => {
    const serie = this.desempenho()?.evolucaoSemanal ?? [];
    const pontos = (serie.at(-1) ?? 0) - (serie[0] ?? 0);
    const semanas = Math.max(serie.length - 1, 0);
    const sinal = pontos > 0 ? '+' : pontos < 0 ? '−' : '';
    return {
      pontos: `${sinal}${Math.abs(pontos)} ${Math.abs(pontos) === 1 ? 'ponto' : 'pontos'}`,
      periodo: semanas === 1 ? 'na última semana' : `nas últimas ${semanas} semanas`,
    };
  });

  /** Pontos da linha do gráfico, num quadro de 100 × 100 (o SVG estica para o tamanho do card). */
  protected readonly linha = computed(() => {
    const serie = this.desempenho()?.evolucaoSemanal ?? [];
    if (serie.length < 2) return '';
    const min = Math.min(...serie);
    const faixa = Math.max(...serie) - min || 1;
    return serie
      .map((valor, i) => `${(i / (serie.length - 1)) * 100},${100 - ((valor - min) / faixa) * 100}`)
      .join(' ');
  });

  protected nivel(aproveitamento: number): Nivel {
    if (aproveitamento >= 70) return 'bom';
    if (aproveitamento >= 50) return 'atencao';
    return 'baixo';
  }
}
