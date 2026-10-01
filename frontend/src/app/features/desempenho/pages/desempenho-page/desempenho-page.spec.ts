import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Desempenho, DesempenhoService } from '../../services/desempenho.service';
import { DesempenhoPage } from './desempenho-page';

const DESEMPENHO: Desempenho = {
  aproveitamentoGeral: 78,
  revisoesRealizadas: 142,
  sequenciaDias: 9,
  porDisciplina: [
    { disciplina: 'Engenharia de Software', aproveitamento: 90 },
    { disciplina: 'Banco de Dados', aproveitamento: 62 },
    { disciplina: 'Física', aproveitamento: 40 },
  ],
  evolucaoSemanal: [61, 66, 70, 78],
  focar: [
    { topico: 'SQL Avançado', disciplina: 'Banco de Dados', aproveitamento: 45 },
    { topico: 'Normalização', disciplina: 'Banco de Dados', aproveitamento: 52 },
  ],
};

describe('DesempenhoPage', () => {
  let el: HTMLElement;

  async function iniciar(mudancas: Partial<Desempenho> = {}) {
    await TestBed.configureTestingModule({
      imports: [DesempenhoPage],
      providers: [
        { provide: DesempenhoService, useValue: { resumo: () => of({ ...DESEMPENHO, ...mudancas }) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DesempenhoPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  }

  const textos = (seletor: string) =>
    [...el.querySelectorAll(seletor)].map((e) => e.textContent?.replace(/\s+/g, ' ').trim());

  it('mostra o aproveitamento geral, as revisões e a sequência de estudos', async () => {
    await iniciar();

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Desempenho');
    expect(textos('.numero')).toEqual(['78%', '142', '9 dias']);
    expect(textos('.legenda')).toEqual([
      'Taxa de aproveitamento geral',
      'Revisões realizadas',
      'Sequência de estudos',
    ]);
  });

  it('fala "1 dia" no singular', async () => {
    await iniciar({ sequenciaDias: 1 });

    expect(textos('.numero')[2]).toBe('1 dia');
  });

  it('mostra uma barra por disciplina, do tamanho do aproveitamento, com a cor do nível', async () => {
    await iniciar();

    const linhas = [...el.querySelectorAll<HTMLElement>('.disciplina')];
    expect(linhas.map((l) => l.querySelector('.disciplina-nome')?.textContent?.trim())).toEqual([
      'Engenharia de Software',
      'Banco de Dados',
      'Física',
    ]);
    expect(linhas.map((l) => l.querySelector('.disciplina-valor')?.textContent?.trim())).toEqual([
      '90%',
      '62%',
      '40%',
    ]);
    expect(linhas.map((l) => l.querySelector<HTMLElement>('.barra-preenchida')?.style.width)).toEqual([
      '90%',
      '62%',
      '40%',
    ]);
    // Bom a partir de 70%, atenção de 50% a 69%, baixo abaixo de 50%.
    expect(linhas.map((l) => l.dataset['nivel'])).toEqual(['bom', 'atencao', 'baixo']);
  });

  it('mostra quantos pontos o aproveitamento subiu desde a primeira semana', async () => {
    await iniciar();

    const evolucao = el.querySelector('.evolucao')!.textContent?.replace(/\s+/g, ' ');
    expect(evolucao).toContain('78% agora');
    expect(evolucao).toContain('+17 pontos');
    expect(evolucao).toContain('de aproveitamento nas últimas 3 semanas');
  });

  it('mostra a queda com sinal de menos e "ponto" no singular', async () => {
    await iniciar({ aproveitamentoGeral: 69, evolucaoSemanal: [70, 69] });

    expect(textos('.pontos')).toEqual(['−1 ponto']);
    expect(textos('.evolucao-texto')).toEqual(['de aproveitamento na última semana']);
  });

  it('lista os tópicos onde focar, com a disciplina e o aproveitamento', async () => {
    await iniciar();

    expect(textos('.foco-topico')).toEqual(['SQL Avançado', 'Normalização']);
    expect(textos('.foco-disciplina')).toEqual(['Banco de Dados', 'Banco de Dados']);
    expect(textos('.foco-valor')).toEqual(['45%', '52%']);
  });
});
