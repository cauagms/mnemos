import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { DesempenhoService } from './desempenho.service';

describe('DesempenhoService (simulado)', () => {
  let service: DesempenhoService;

  beforeEach(() => {
    service = TestBed.inject(DesempenhoService);
  });

  function resolver<T>(observable: Observable<T>): T {
    let valor!: T;
    observable.subscribe((v) => (valor = v));
    return valor;
  }

  it('o aproveitamento geral é o último ponto da evolução semanal', () => {
    const desempenho = resolver(service.resumo());

    expect(desempenho.evolucaoSemanal.at(-1)).toBe(desempenho.aproveitamentoGeral);
  });

  it('as porcentagens ficam entre 0 e 100', () => {
    const { aproveitamentoGeral, porDisciplina, focar, evolucaoSemanal } = resolver(service.resumo());

    const todas = [
      aproveitamentoGeral,
      ...evolucaoSemanal,
      ...porDisciplina.map((d) => d.aproveitamento),
      ...focar.map((t) => t.aproveitamento),
    ];
    for (const valor of todas) {
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThanOrEqual(100);
    }
  });

  it('"Onde focar" vem do tópico mais fraco para o menos fraco', () => {
    const { focar } = resolver(service.resumo());
    const valores = focar.map((t) => t.aproveitamento);

    expect(valores).toEqual([...valores].sort((a, b) => a - b));
  });
});
