import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ItemRevisao, RevisaoService } from '../../services/revisao.service';
import { SessaoRevisaoPage } from './sessao-revisao-page';

const FLASHCARD: ItemRevisao = {
  id: '1',
  tipo: 'flashcard',
  disciplina: 'Matemática',
  topico: 'Álgebra Linear',
  pergunta: 'O que são vetores LI?',
  resposta: 'Nenhum é combinação do outro.',
};

const QUESTAO: ItemRevisao = {
  id: '2',
  tipo: 'quiz',
  disciplina: 'Banco de Dados',
  topico: 'Normalização',
  pergunta: 'Uma tabela está na 2FN quando:',
  alternativas: [
    { texto: 'Sem grupos repetidos', explicacao: 'Isso é a 1FN.' },
    { texto: 'Depende da chave inteira', explicacao: 'Sem dependências parciais.' },
    { texto: 'Sem transitivas', explicacao: 'Isso é a 3FN.' },
  ],
  correta: 1,
};

describe('SessaoRevisaoPage', () => {
  let fixture: ComponentFixture<SessaoRevisaoPage>;
  let el: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;
  let revisao: {
    sessao: ReturnType<typeof vi.fn>;
    avaliar: ReturnType<typeof vi.fn>;
    responder: ReturnType<typeof vi.fn>;
  };

  const texto = (seletor: string) => el.querySelector(seletor)?.textContent?.trim() ?? null;
  // As alternativas do quiz começam pela letra (A, B, C...), que não faz parte do rótulo.
  const botao = (rotulo: string) =>
    [...el.querySelectorAll('button')].find((b) =>
      [rotulo, `${b.querySelector('.letra')?.textContent?.trim()} ${rotulo}`].includes(
        b.textContent?.trim().replace(/\s+/g, ' ') ?? '',
      ),
    ) ?? null;
  const frente = () => el.querySelector('.frente')!;
  const verso = () => el.querySelector('.verso')!;

  async function clicar(rotulo: string) {
    botao(rotulo)!.click();
    await fixture.whenStable();
  }

  async function iniciar(itens: ItemRevisao[], modo = 'hoje') {
    revisao = {
      sessao: vi.fn(() => of(itens)),
      avaliar: vi.fn(() => of(undefined)),
      responder: vi.fn(() => of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [SessaoRevisaoPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ modo }) } },
        },
        { provide: RevisaoService, useValue: revisao },
      ],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(SessaoRevisaoPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  }

  it('volta para a entrada da Revisão se o modo não existir', async () => {
    await iniciar([], 'qualquer');

    expect(navigate).toHaveBeenCalledWith(['/revisao']);
    expect(revisao.sessao).not.toHaveBeenCalled();
  });

  it('mostra a posição na sessão, onde o item está e só a frente do flashcard', async () => {
    await iniciar([FLASHCARD, QUESTAO]);

    expect(revisao.sessao).toHaveBeenCalledWith('hoje');
    expect(texto('.contador')).toBe('1 de 2');
    expect(texto('.trilha')).toContain('Matemática');
    expect(texto('.trilha')).toContain('Álgebra Linear');
    expect(frente().textContent).toContain('O que são vetores LI?');
    expect(botao('Mostrar resposta')).not.toBeNull();
    // O verso existe para a animação, mas fica fora do alcance do teclado e do leitor de tela.
    expect(frente().hasAttribute('inert')).toBe(false);
    expect(verso().hasAttribute('inert')).toBe(true);
  });

  it('"Mostrar resposta" vira a carta para o verso, com a resposta e as notas', async () => {
    await iniciar([FLASHCARD]);

    await clicar('Mostrar resposta');

    expect(frente().hasAttribute('inert')).toBe(true);
    expect(verso().hasAttribute('inert')).toBe(false);
    expect(verso().textContent).toContain('Nenhum é combinação do outro.');
    expect(verso().textContent).toContain('O quanto foi fácil lembrar?');
    for (const nota of ['Errei', 'Difícil', 'Bom', 'Fácil']) {
      expect(botao(nota)).not.toBeNull();
    }
  });

  it('avaliar o flashcard registra a nota e passa para o próximo item', async () => {
    await iniciar([FLASHCARD, QUESTAO]);
    await clicar('Mostrar resposta');

    await clicar('Difícil');

    expect(revisao.avaliar).toHaveBeenCalledWith('1', 'dificil');
    expect(texto('.contador')).toBe('2 de 2');
    expect(el.textContent).toContain('Uma tabela está na 2FN quando:');
  });

  it('o próximo flashcard começa pela frente', async () => {
    await iniciar([FLASHCARD, { ...FLASHCARD, id: '3', pergunta: 'Outra pergunta?' }]);
    await clicar('Mostrar resposta');

    await clicar('Bom');

    expect(frente().textContent).toContain('Outra pergunta?');
    expect(verso().hasAttribute('inert')).toBe(true);
  });

  it('na questão, escolher uma alternativa registra a resposta e mostra a certa', async () => {
    await iniciar([QUESTAO]);

    await clicar('Sem grupos repetidos');

    expect(revisao.responder).toHaveBeenCalledWith('2', 0);
    // A certa é apontada na própria alternativa, sem frase de resumo embaixo.
    expect(el.querySelectorAll('.alternativas > li')[1].textContent).toContain('Resposta correta');
    expect(el.textContent).not.toContain('Não foi dessa vez');
    // Depois de responder, não dá para trocar de alternativa.
    expect(botao('Depende da chave inteira')?.disabled).toBe(true);
  });

  it('as explicações só aparecem depois de responder, uma para cada alternativa', async () => {
    await iniciar([QUESTAO]);
    expect(el.textContent).not.toContain('Isso é a 1FN.');

    await clicar('Sem transitivas');

    const alternativas = [...el.querySelectorAll('.alternativas > li')].map((li) => li.textContent);
    expect(alternativas[0]).toContain('Isso é a 1FN.');
    expect(alternativas[1]).toContain('Resposta correta');
    expect(alternativas[1]).toContain('Sem dependências parciais.');
    expect(alternativas[2]).toContain('Resposta incorreta');
    expect(alternativas[2]).toContain('Isso é a 3FN.');
  });

  it('acertar a questão marca a alternativa escolhida como correta, sem frase de resumo', async () => {
    await iniciar([QUESTAO]);

    await clicar('Depende da chave inteira');

    expect(el.querySelectorAll('.alternativas > li')[1].textContent).toContain('Resposta correta');
    expect(el.textContent).not.toContain('Resposta certa!');
  });

  it('depois do último item, mostra a revisão concluída', async () => {
    await iniciar([QUESTAO]);
    await clicar('Sem transitivas');

    await clicar('Próxima');

    expect(texto('h2')).toBe('Revisão concluída!');
    const voltar = [...el.querySelectorAll('a')].find((a) => a.textContent?.includes('Voltar para Revisão'));
    expect(voltar?.getAttribute('href')).toBe('/revisao');
  });

  it('avisa quando não há nada para revisar', async () => {
    await iniciar([]);

    expect(texto('h2')).toBe('Nada para revisar agora');
  });
});
