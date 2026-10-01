import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { CardsPendentesService } from './cards-pendentes.service';

describe('CardsPendentesService (simulado)', () => {
  let service: CardsPendentesService;

  beforeEach(() => {
    service = TestBed.inject(CardsPendentesService);
  });

  function resolver<T>(observable: Observable<T>): T {
    let valor!: T;
    observable.subscribe((v) => (valor = v));
    return valor;
  }

  it('lista os cards pendentes com disciplina, tópico, frente e verso', () => {
    const cards = resolver(service.listar());

    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.disciplina).toBeTruthy();
      expect(card.topico).toBeTruthy();
      expect(card.frente).toBeTruthy();
      expect(card.verso).toBeTruthy();
    }
  });

  it('um card aprovado sai da lista', () => {
    const [primeiro] = resolver(service.listar());

    resolver(service.aprovar(primeiro.id));

    expect(resolver(service.listar()).map((c) => c.id)).not.toContain(primeiro.id);
  });

  it('um card descartado sai da lista', () => {
    const [primeiro] = resolver(service.listar());

    resolver(service.descartar(primeiro.id));

    expect(resolver(service.listar()).map((c) => c.id)).not.toContain(primeiro.id);
  });

  it('edita a frente e o verso, sem espaços nas pontas, e continua pendente', () => {
    const [primeiro] = resolver(service.listar());

    const editado = resolver(service.editar(primeiro.id, '  Nova frente  ', '  Novo verso  '));

    expect(editado).toEqual({ ...primeiro, frente: 'Nova frente', verso: 'Novo verso' });
    expect(resolver(service.listar())).toContainEqual(editado);
  });
});
