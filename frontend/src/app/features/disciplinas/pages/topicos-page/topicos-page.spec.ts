import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Disciplina, DisciplinasService } from '../../services/disciplinas.service';
import { Topico, TopicosService } from '../../services/topicos.service';
import { TopicosPage } from './topicos-page';

// O jsdom ainda não implementa showModal/close do <dialog>.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute('open');
};

describe('TopicosPage', () => {
  let fixture: ComponentFixture<TopicosPage>;
  let el: HTMLElement;
  let topicosService: {
    listar: ReturnType<typeof vi.fn>;
    criar: ReturnType<typeof vi.fn>;
    editar: ReturnType<typeof vi.fn>;
    excluir: ReturnType<typeof vi.fn>;
  };
  let navigate: ReturnType<typeof vi.spyOn>;

  const texto = (seletor: string) => el.querySelector(seletor)?.textContent?.trim() ?? null;
  const botao = (rotulo: string, raiz: ParentNode = el) =>
    [...raiz.querySelectorAll('button')].find(
      (b) => b.textContent?.trim() === rotulo || b.getAttribute('aria-label') === rotulo,
    ) ?? null;
  const nomes = () => [...el.querySelectorAll('.cartao .nome')].map((n) => n.textContent?.trim());
  const dialogo = () => el.querySelector('dialog');
  const formato = (rotulo: string) =>
    [...el.querySelectorAll('dialog label')]
      .find((l) => l.textContent?.trim() === rotulo)
      ?.querySelector<HTMLInputElement>('input[type="radio"]') ?? null;

  async function clicar(elemento: HTMLElement | null) {
    expect(elemento).not.toBeNull();
    elemento!.click();
    await fixture.whenStable();
  }

  async function digitar(valor: string) {
    const input = el.querySelector<HTMLInputElement>('#topico-nome')!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function enviar() {
    dialogo()!.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  async function iniciar(id: string, disciplinas: Disciplina[], topicos: Topico[] = []) {
    topicosService = {
      listar: vi.fn(() => of(topicos)),
      criar: vi.fn((_: string, nome: string, formato: Topico['formato']) =>
        of({ id: '7', nome, formato }),
      ),
      editar: vi.fn((_: string, id: string, nome: string, formato: Topico['formato']) =>
        of({ id, nome, formato }),
      ),
      excluir: vi.fn(() => of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [TopicosPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } },
        { provide: DisciplinasService, useValue: { listar: () => of(disciplinas) } },
        { provide: TopicosService, useValue: topicosService },
      ],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(TopicosPage);
    el = fixture.nativeElement;
    document.body.appendChild(el);
    await fixture.whenStable();
  }

  afterEach(() => el?.remove());

  const disciplinas = [
    { id: '1', nome: 'Matemática' },
    { id: '2', nome: 'Física' },
  ];

  it('mostra o nome da disciplina, o texto de apoio e o link de volta', async () => {
    await iniciar('2', disciplinas);

    expect(texto('h1')).toBe('Física');
    expect(texto('.subtitulo')).toBe(
      'Gerencie os tópicos e envie materiais de estudo desta disciplina.',
    );
    const voltar = [...el.querySelectorAll('a')].find(
      (a) => a.textContent?.trim() === 'Voltar para Minhas Disciplinas',
    );
    expect(voltar?.getAttribute('href')).toBe('/disciplinas');
  });

  it('busca os tópicos da disciplina aberta', async () => {
    await iniciar('2', disciplinas);
    expect(topicosService.listar).toHaveBeenCalledWith('2');
  });

  it('sem tópicos, mostra o estado vazio com o botão de criar', async () => {
    await iniciar('2', disciplinas);

    expect(texto('.vazio h2')).toBe('Nenhum tópico ainda');
    expect(texto('.vazio p')).toBe(
      'Crie o primeiro tópico desta disciplina para enviar materiais e gerar seus cards.',
    );
    expect(botao('Criar tópico')).not.toBeNull();
    expect(nomes()).toEqual([]);
  });

  it('com tópicos, lista um card por tópico com o formato e o card de novo tópico', async () => {
    await iniciar('1', disciplinas, [
      { id: '1', nome: 'Álgebra Linear', formato: 'flashcards' },
      { id: '2', nome: 'Cálculo I', formato: 'quiz' },
    ]);

    expect(nomes()).toEqual(['Álgebra Linear', 'Cálculo I']);
    expect([...el.querySelectorAll('.formato')].map((f) => f.textContent?.trim())).toEqual([
      'Flashcards',
      'Quiz',
    ]);
    const enviarMaterial = [...el.querySelectorAll('.cartao a')].filter(
      (a) => a.textContent?.trim() === 'Enviar material',
    );
    expect(enviarMaterial.map((a) => a.getAttribute('href'))).toEqual([
      '/disciplinas/1/topicos/1',
      '/disciplinas/1/topicos/2',
    ]);
    expect(texto('.vazio')).toBeNull();
    expect(botao('Novo tópico')).not.toBeNull();
  });

  it('o nome de cada tópico leva à tela de enviar material', async () => {
    await iniciar('1', disciplinas, [{ id: '5', nome: 'Álgebra Linear', formato: 'flashcards' }]);

    const nome = el.querySelector<HTMLAnchorElement>('.cartao .nome a');
    expect(nome?.textContent?.trim()).toBe('Álgebra Linear');
    expect(nome?.getAttribute('href')).toBe('/disciplinas/1/topicos/5');
  });

  it('volta para a lista de disciplinas se a disciplina não existe', async () => {
    await iniciar('99', disciplinas);

    expect(navigate).toHaveBeenCalledWith(['/disciplinas']);
  });

  describe('novo tópico', () => {
    beforeEach(() => iniciar('2', disciplinas));

    it('"Criar tópico" abre o modal com o campo focado e Flashcards marcado', async () => {
      await clicar(botao('Criar tópico'));

      expect(dialogo()?.open).toBe(true);
      expect(texto('dialog h2')).toBe('Novo tópico');
      expect(document.activeElement?.id).toBe('topico-nome');
      expect(texto('dialog legend')).toBe('Como você quer estudar este tópico?');
      expect(formato('Flashcards')?.checked).toBe(true);
      expect(formato('Quiz')?.checked).toBe(false);
    });

    it('exige o nome antes de criar', async () => {
      await clicar(botao('Criar tópico'));
      await digitar('   ');
      await enviar();

      expect(texto('#topico-nome-erro')).toBe('Informe o nome do tópico.');
      expect(topicosService.criar).not.toHaveBeenCalled();
      expect(dialogo()).not.toBeNull();
    });

    it('cria o tópico com o formato escolhido e passa a mostrar o card', async () => {
      await clicar(botao('Criar tópico'));
      await digitar('Cinemática');
      await clicar(formato('Quiz'));
      await enviar();

      expect(topicosService.criar).toHaveBeenCalledWith('2', 'Cinemática', 'quiz');
      expect(dialogo()).toBeNull();
      expect(nomes()).toEqual(['Cinemática']);
      expect(texto('.formato')).toBe('Quiz');
      expect(texto('.vazio')).toBeNull();
    });

    it('cancelar fecha o modal sem criar nada', async () => {
      await clicar(botao('Criar tópico'));
      await digitar('Cinemática');
      await clicar(botao('Cancelar'));

      expect(dialogo()).toBeNull();
      expect(topicosService.criar).not.toHaveBeenCalled();
    });

    it('o card de novo tópico também abre o modal', async () => {
      await clicar(botao('Criar tópico'));
      await digitar('Cinemática');
      await enviar();

      await clicar(botao('Novo tópico'));
      expect(texto('dialog h2')).toBe('Novo tópico');
    });
  });

  describe('ações do card', () => {
    const acoes = (nome: string) => botao(`Ações do tópico ${nome}`);
    const cartao = (nome: string) => acoes(nome)!.closest('.cartao')!;

    beforeEach(() =>
      iniciar('1', disciplinas, [
        { id: '1', nome: 'Álgebra Linear', formato: 'flashcards' },
        { id: '2', nome: 'Cálculo I', formato: 'quiz' },
      ]),
    );

    it('ficam escondidas até abrir o botão ⋮', async () => {
      expect(acoes('Álgebra Linear')!.getAttribute('aria-expanded')).toBe('false');
      expect(botao('Editar')).toBeNull();

      await clicar(acoes('Álgebra Linear'));

      expect(acoes('Álgebra Linear')!.getAttribute('aria-expanded')).toBe('true');
      expect(botao('Editar', cartao('Álgebra Linear'))).not.toBeNull();
      expect(botao('Excluir', cartao('Álgebra Linear'))).not.toBeNull();
      expect(document.activeElement).toBe(botao('Editar', cartao('Álgebra Linear')));
    });

    it('só um card fica com as ações abertas por vez', async () => {
      await clicar(acoes('Álgebra Linear'));
      await clicar(acoes('Cálculo I'));

      expect(acoes('Álgebra Linear')!.getAttribute('aria-expanded')).toBe('false');
      expect(acoes('Cálculo I')!.getAttribute('aria-expanded')).toBe('true');
    });

    it('fecham com Esc e devolvem o foco ao ⋮', async () => {
      await clicar(acoes('Álgebra Linear'));
      botao('Editar')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();

      expect(botao('Editar')).toBeNull();
      expect(document.activeElement).toBe(acoes('Álgebra Linear'));
    });

    it('fecham ao clicar fora do card', async () => {
      await clicar(acoes('Álgebra Linear'));
      await clicar(el.querySelector('h1'));

      expect(botao('Editar')).toBeNull();
    });

    it('editar abre o modal preenchido e salva nome e formato', async () => {
      await clicar(acoes('Cálculo I'));
      await clicar(botao('Editar'));

      expect(texto('dialog h2')).toBe('Editar tópico');
      expect(el.querySelector<HTMLInputElement>('#topico-nome')!.value).toBe('Cálculo I');
      expect(formato('Quiz')?.checked).toBe(true);

      await digitar('Cálculo II');
      await clicar(formato('Flashcards'));
      await clicar(botao('Salvar'));

      expect(topicosService.editar).toHaveBeenCalledWith('1', '2', 'Cálculo II', 'flashcards');
      expect(dialogo()).toBeNull();
      expect(nomes()).toEqual(['Álgebra Linear', 'Cálculo II']);
      expect([...el.querySelectorAll('.formato')].map((f) => f.textContent?.trim())).toEqual([
        'Flashcards',
        'Flashcards',
      ]);
    });

    it('ao editar, avisa que mudar o formato não afeta os cards já criados', async () => {
      await clicar(acoes('Cálculo I'));
      await clicar(botao('Editar'));

      expect(texto('dialog .aviso')).toBeNull();

      await clicar(formato('Flashcards'));

      expect(texto('dialog .aviso')).toBe(
        'Mudar o formato não afeta os cards já criados, apenas os próximos materiais enviados a este tópico.',
      );
    });

    it('pede confirmação antes de excluir', async () => {
      await clicar(acoes('Álgebra Linear'));
      await clicar(botao('Excluir'));

      expect(texto('dialog h2')).toBe('Excluir tópico?');
      expect(texto('dialog p')).toBe(
        'Isso vai excluir todos os cards deste tópico. Essa ação não pode ser desfeita.',
      );
      expect(document.activeElement).toBe(botao('Cancelar', dialogo()!));

      await clicar(botao('Cancelar', dialogo()!));

      expect(topicosService.excluir).not.toHaveBeenCalled();
      expect(nomes()).toEqual(['Álgebra Linear', 'Cálculo I']);
    });

    it('a confirmação de um tópico de quiz fala das questões', async () => {
      await clicar(acoes('Cálculo I'));
      await clicar(botao('Excluir'));

      expect(texto('dialog p')).toBe(
        'Isso vai excluir todas as questões deste tópico. Essa ação não pode ser desfeita.',
      );
    });

    it('exclui o tópico ao confirmar', async () => {
      await clicar(acoes('Álgebra Linear'));
      await clicar(botao('Excluir'));
      await clicar(botao('Excluir', dialogo()!));

      expect(topicosService.excluir).toHaveBeenCalledWith('1', '1');
      expect(dialogo()).toBeNull();
      expect(nomes()).toEqual(['Cálculo I']);
    });

    it('excluir o último tópico volta ao estado vazio', async () => {
      for (const nome of ['Álgebra Linear', 'Cálculo I']) {
        await clicar(acoes(nome));
        await clicar(botao('Excluir'));
        await clicar(botao('Excluir', dialogo()!));
      }

      expect(texto('.vazio h2')).toBe('Nenhum tópico ainda');
    });
  });
});
