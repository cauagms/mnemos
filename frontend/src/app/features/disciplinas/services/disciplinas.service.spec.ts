import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { DisciplinasService } from './disciplinas.service';

describe('DisciplinasService (simulado)', () => {
  let service: DisciplinasService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(DisciplinasService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function resolver<T>(observable: Observable<T>): T {
    let valor!: T;
    observable.subscribe((v) => (valor = v));
    vi.runAllTimers();
    return valor;
  }

  it('começa sem disciplinas', () => {
    expect(resolver(service.listar())).toEqual([]);
  });

  it('cria uma disciplina com o nome sem espaços nas pontas', () => {
    const criada = resolver(service.criar('  Matemática  '));

    expect(criada.nome).toBe('Matemática');
    expect(resolver(service.listar())).toEqual([criada]);
  });

  it('dá ids diferentes para cada disciplina', () => {
    const a = resolver(service.criar('Matemática'));
    const b = resolver(service.criar('Física'));

    expect(a.id).not.toBe(b.id);
  });

  it('renomeia uma disciplina existente', () => {
    const { id } = resolver(service.criar('Matematica'));

    const renomeada = resolver(service.renomear(id, 'Matemática'));

    expect(renomeada).toEqual({ id, nome: 'Matemática' });
    expect(resolver(service.listar())).toEqual([{ id, nome: 'Matemática' }]);
  });

  it('exclui uma disciplina', () => {
    const mat = resolver(service.criar('Matemática'));
    const fis = resolver(service.criar('Física'));

    resolver(service.excluir(mat.id));

    expect(resolver(service.listar())).toEqual([fis]);
  });

  it('responde na hora, sem atraso', () => {
    const next = vi.fn();
    service.criar('Matemática').subscribe(next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
