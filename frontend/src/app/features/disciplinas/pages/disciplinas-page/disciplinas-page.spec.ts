import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, Subject, of } from 'rxjs';
import { Disciplina, DisciplinasService } from '../../services/disciplinas.service';
import { DisciplinasPage } from './disciplinas-page';

// O jsdom ainda não implementa showModal/close do <dialog>.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute('open');
};

describe('DisciplinasPage', () => {
  let fixture: ComponentFixture<DisciplinasPage>;
  let el: HTMLElement;
  let service: {
    listar: ReturnType<typeof vi.fn>;
    criar: ReturnType<typeof vi.fn>;
    renomear: ReturnType<typeof vi.fn>;
    excluir: ReturnType<typeof vi.fn>;
  };

  const texto = (seletor: string) => el.querySelector(seletor)?.textContent?.trim() ?? null;
  const botao = (rotulo: string, raiz: ParentNode = el) =>
    [...raiz.querySelectorAll('button')].find(
      (b) => b.textContent?.trim() === rotulo || b.getAttribute('aria-label') === rotulo,
    ) ?? null;
  const dialogo = () => el.querySelector('dialog');
  const nomes = () => [...el.querySelectorAll('.cartao .nome')].map((n) => n.textContent?.trim());

  async function clicar(elemento: HTMLElement | null) {
    expect(elemento).not.toBeNull();
    elemento!.click();
    await fixture.whenStable();
  }

  async function digitar(valor: string) {
    const input = el.querySelector<HTMLInputElement>('#disciplina-nome')!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function enviar() {
    dialogo()!.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  async function iniciar(inicial: Disciplina[] | Observable<Disciplina[]> = []) {
    service = {
      listar: vi.fn(() => (Array.isArray(inicial) ? of(inicial) : inicial)),
      criar: vi.fn((nome: string) => of({ id: '99', nome })),
      renomear: vi.fn((id: string, nome: string) => of({ id, nome })),
      excluir: vi.fn(() => of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [DisciplinasPage],
      providers: [{ provide: DisciplinasService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(DisciplinasPage);
    el = fixture.nativeElement;
    document.body.appendChild(el);
    await fixture.whenStable();
  }

  afterEach(() => el?.remove());

  it('mostra o título da página', async () => {
    await iniciar();
    expect(texto('h1')).toBe('Minhas Disciplinas');
  });

  it('não mostra nem estado vazio nem cards enquanto carrega', async () => {
    await iniciar(new Subject<Disciplina[]>());

    expect(texto('.vazio')).toBeNull();
    expect(botao('Nova disciplina')).toBeNull();
  });

  describe('sem disciplinas', () => {
    beforeEach(() => iniciar());

    it('mostra o estado vazio com o convite para criar a primeira', () => {
      expect(texto('.vazio h2')).toBe('Nenhuma disciplina ainda');
      expect(botao('Criar disciplina')).not.toBeNull();
      expect(nomes()).toEqual([]);
    });

    it('abre o modal de nova disciplina com o campo focado', async () => {
      await clicar(botao('Criar disciplina'));

      expect(dialogo()?.open).toBe(true);
      expect(texto('dialog h2')).toBe('Nova disciplina');
      expect(document.activeElement?.id).toBe('disciplina-nome');
    });

    it('exige o nome antes de criar', async () => {
      await clicar(botao('Criar disciplina'));
      await digitar('   ');
      await enviar();

      expect(texto('#disciplina-nome-erro')).toBe('Informe o nome da disciplina.');
      expect(service.criar).not.toHaveBeenCalled();
      expect(dialogo()).not.toBeNull();
    });

    it('cria a disciplina e passa a mostrar o card', async () => {
      await clicar(botao('Criar disciplina'));
      await digitar('Matemática');
      await enviar();

      expect(service.criar).toHaveBeenCalledWith('Matemática');
      expect(dialogo()).toBeNull();
      expect(nomes()).toEqual(['Matemática']);
      expect(texto('.vazio')).toBeNull();
      expect(botao('Nova disciplina')).not.toBeNull();
    });

    it('cancelar fecha o modal sem criar nada', async () => {
      await clicar(botao('Criar disciplina'));
      await digitar('Matemática');
      await clicar(botao('Cancelar'));

      expect(dialogo()).toBeNull();
      expect(service.criar).not.toHaveBeenCalled();
    });

    it('mostra o carregamento enquanto a criação não responde', async () => {
      const resposta = new Subject<Disciplina>();
      service.criar.mockReturnValue(resposta);

      await clicar(botao('Criar disciplina'));
      await digitar('Matemática');
      await enviar();

      const criar = dialogo()!.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      expect(criar.disabled).toBe(true);
      expect(criar.textContent?.trim()).toBe('Criando...');

      resposta.next({ id: '1', nome: 'Matemática' });
      resposta.complete();
      await fixture.whenStable();

      expect(dialogo()).toBeNull();
    });
  });

  describe('com disciplinas', () => {
    const acoes = (nome: string) => botao(`Ações da disciplina ${nome}`) as HTMLButtonElement;

    beforeEach(() =>
      iniciar([
        { id: '1', nome: 'Matemática' },
        { id: '2', nome: 'Física' },
      ]),
    );

    it('lista um card por disciplina e o card de nova disciplina', () => {
      expect(nomes()).toEqual(['Matemática', 'Física']);
      expect(texto('.vazio')).toBeNull();
      expect(botao('Nova disciplina')).not.toBeNull();
    });

    it('o card de nova disciplina abre o modal', async () => {
      await clicar(botao('Nova disciplina'));
      expect(texto('dialog h2')).toBe('Nova disciplina');
    });

    it('depois de criar, o card de nova disciplina não fica destacado', async () => {
      botao('Nova disciplina')!.focus();
      await clicar(botao('Nova disciplina'));
      await digitar('Química');
      await enviar();

      expect(nomes()).toEqual(['Matemática', 'Física', 'Química']);
      expect(document.activeElement).not.toBe(botao('Nova disciplina'));
    });

    it('ao cancelar, devolve o foco ao card de nova disciplina', async () => {
      botao('Nova disciplina')!.focus();
      await clicar(botao('Nova disciplina'));
      await clicar(botao('Cancelar'));

      expect(document.activeElement).toBe(botao('Nova disciplina'));
    });

    describe('ações do card', () => {
      const cartao = (nome: string) => acoes(nome).closest('.cartao')!;

      it('ficam escondidas até abrir o botão de ações', async () => {
        expect(acoes('Matemática').getAttribute('aria-expanded')).toBe('false');
        expect(botao('Editar')).toBeNull();

        await clicar(acoes('Matemática'));

        expect(acoes('Matemática').getAttribute('aria-expanded')).toBe('true');
        expect(botao('Editar', cartao('Matemática'))).not.toBeNull();
        expect(botao('Excluir', cartao('Matemática'))).not.toBeNull();
        expect(document.activeElement).toBe(botao('Editar', cartao('Matemática')));
      });

      it('aparecem dentro do próprio card, sem esconder o nome', async () => {
        await clicar(acoes('Matemática'));

        expect(cartao('Matemática').contains(botao('Editar'))).toBe(true);
        expect(texto('.cartao .nome')).toBe('Matemática');
      });

      it('só um card fica com as ações abertas por vez', async () => {
        await clicar(acoes('Matemática'));
        await clicar(acoes('Física'));

        expect(acoes('Matemática').getAttribute('aria-expanded')).toBe('false');
        expect(acoes('Física').getAttribute('aria-expanded')).toBe('true');
      });

      it('fecham com Esc e devolvem o foco ao botão de ações', async () => {
        await clicar(acoes('Matemática'));
        botao('Editar')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await fixture.whenStable();

        expect(botao('Editar')).toBeNull();
        expect(document.activeElement).toBe(acoes('Matemática'));
      });

      it('fecham ao clicar fora do card', async () => {
        await clicar(acoes('Matemática'));
        await clicar(el.querySelector('h1'));

        expect(botao('Editar')).toBeNull();
      });
    });

    it('edita o nome da disciplina pelo modal já preenchido', async () => {
      await clicar(acoes('Matemática'));
      await clicar(botao('Editar'));

      expect(texto('dialog h2')).toBe('Editar disciplina');
      expect(el.querySelector<HTMLInputElement>('#disciplina-nome')!.value).toBe('Matemática');

      await digitar('Cálculo I');
      await enviar();

      expect(service.renomear).toHaveBeenCalledWith('1', 'Cálculo I');
      expect(dialogo()).toBeNull();
      expect(nomes()).toEqual(['Cálculo I', 'Física']);
    });

    it('pede confirmação antes de excluir', async () => {
      await clicar(acoes('Matemática'));
      await clicar(botao('Excluir'));

      expect(texto('dialog h2')).toBe('Excluir disciplina?');
      expect(texto('dialog p')).toContain('Matemática');
      expect(service.excluir).not.toHaveBeenCalled();

      await clicar(botao('Cancelar'));
      expect(nomes()).toEqual(['Matemática', 'Física']);
    });

    it('exclui a disciplina ao confirmar', async () => {
      await clicar(acoes('Matemática'));
      await clicar(botao('Excluir'));
      await clicar(botao('Excluir', dialogo()!));

      expect(service.excluir).toHaveBeenCalledWith('1');
      expect(dialogo()).toBeNull();
      expect(nomes()).toEqual(['Física']);
    });
  });
});
