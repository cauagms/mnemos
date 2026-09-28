import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { TopicosService } from './topicos.service';

describe('TopicosService (simulado)', () => {
  let service: TopicosService;

  beforeEach(() => {
    service = TestBed.inject(TopicosService);
  });

  function resolver<T>(observable: Observable<T>): T {
    let valor!: T;
    observable.subscribe((v) => (valor = v));
    return valor;
  }

  it('uma disciplina recém-criada começa sem tópicos', () => {
    expect(resolver(service.listar('1'))).toEqual([]);
    expect(resolver(service.listar('2'))).toEqual([]);
  });

  it('cria um tópico só na disciplina informada, com o nome sem espaços nas pontas', () => {
    const criado = resolver(service.criar('1', '  Álgebra Linear  ', 'quiz'));

    expect(criado).toEqual({ id: criado.id, nome: 'Álgebra Linear', formato: 'quiz' });
    expect(resolver(service.listar('1'))).toEqual([criado]);
    expect(resolver(service.listar('2'))).toEqual([]);
  });

  it('dá ids diferentes para cada tópico', () => {
    const a = resolver(service.criar('1', 'Álgebra', 'flashcards'));
    const b = resolver(service.criar('2', 'Cinemática', 'flashcards'));

    expect(a.id).not.toBe(b.id);
  });

  it('edita o nome e o formato de um tópico', () => {
    const { id } = resolver(service.criar('1', 'Algebra', 'flashcards'));

    const editado = resolver(service.editar('1', id, '  Álgebra  ', 'quiz'));

    expect(editado).toEqual({ id, nome: 'Álgebra', formato: 'quiz' });
    expect(resolver(service.listar('1'))).toEqual([editado]);
  });

  it('exclui um tópico', () => {
    const algebra = resolver(service.criar('1', 'Álgebra', 'flashcards'));
    const calculo = resolver(service.criar('1', 'Cálculo', 'quiz'));

    resolver(service.excluir('1', algebra.id));

    expect(resolver(service.listar('1'))).toEqual([calculo]);
  });
});
