import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { RevisaoService } from './revisao.service';

describe('RevisaoService (simulado)', () => {
  let service: RevisaoService;

  beforeEach(() => {
    service = TestBed.inject(RevisaoService);
  });

  function resolver<T>(observable: Observable<T>): T {
    let valor!: T;
    observable.subscribe((v) => (valor = v));
    return valor;
  }

  it('resume quantos itens esperam hoje e quantos são novos', () => {
    expect(resolver(service.resumo())).toEqual({ hoje: 5, novos: 3 });
  });

  it('a sessão traz os itens do modo pedido, com disciplina e tópico', () => {
    const hoje = resolver(service.sessao('hoje'));
    const novos = resolver(service.sessao('novos'));

    expect(hoje).toHaveLength(5);
    expect(novos).toHaveLength(3);
    for (const item of [...hoje, ...novos]) {
      expect(item.disciplina).toBeTruthy();
      expect(item.topico).toBeTruthy();
      expect(item.pergunta).toBeTruthy();
    }
  });

  it('um flashcard avaliado sai da fila', () => {
    const [primeiro] = resolver(service.sessao('hoje')).filter((i) => i.tipo === 'flashcard');

    resolver(service.avaliar(primeiro.id, 'bom'));

    expect(resolver(service.sessao('hoje')).map((i) => i.id)).not.toContain(primeiro.id);
    expect(resolver(service.resumo())).toEqual({ hoje: 4, novos: 3 });
  });

  it('uma questão respondida sai da fila', () => {
    const [questao] = resolver(service.sessao('novos')).filter((i) => i.tipo === 'quiz');

    resolver(service.responder(questao.id, 0));

    expect(resolver(service.sessao('novos')).map((i) => i.id)).not.toContain(questao.id);
  });
});
