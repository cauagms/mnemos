import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CardPendente, CardsPendentesService } from '../../services/cards-pendentes.service';
import { CardsPendentesPage } from './cards-pendentes-page';

// O jsdom ainda não implementa showModal/close do <dialog>.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute('open');
};

const KERNEL: CardPendente = {
  id: '1',
  disciplina: 'Matemática',
  topico: 'Álgebra Linear',
  frente: 'O que é o núcleo?',
  verso: 'Os vetores levados ao nulo.',
};

const AUTOVALOR: CardPendente = {
  id: '2',
  disciplina: 'Física',
  topico: 'Cinemática',
  frente: 'Para que servem os autovalores?',
  verso: 'Indicam quanto os vetores esticam.',
};

describe('CardsPendentesPage', () => {
  let fixture: ComponentFixture<CardsPendentesPage>;
  let el: HTMLElement;
  let service: {
    listar: ReturnType<typeof vi.fn>;
    aprovar: ReturnType<typeof vi.fn>;
    editar: ReturnType<typeof vi.fn>;
    descartar: ReturnType<typeof vi.fn>;
  };

  const cards = () => [...el.querySelectorAll<HTMLElement>('.card')];
  const frentes = () => cards().map((c) => c.querySelector('.frente .texto')?.textContent?.trim());
  const botao = (rotulo: string, dentro: ParentNode = el) =>
    [...dentro.querySelectorAll('button')].find((b) => b.textContent?.trim() === rotulo) ?? null;
  const dialogo = () => el.querySelector('dialog');
  const campo = (card: HTMLElement, nome: 'frente' | 'verso') =>
    card.querySelector<HTMLTextAreaElement>(`textarea[name="${nome}"]`)!;

  async function clicar(botao: HTMLButtonElement | null) {
    botao!.click();
    await fixture.whenStable();
  }

  async function digitar(textarea: HTMLTextAreaElement, valor: string) {
    textarea.value = valor;
    textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function iniciar(lista: CardPendente[] = [KERNEL, AUTOVALOR], celular = false) {
    // O jsdom não implementa matchMedia; simula a largura da tela.
    window.matchMedia = vi.fn(
      () => ({ matches: celular, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
    );
    service = {
      listar: vi.fn(() => of(lista)),
      aprovar: vi.fn(() => of(undefined)),
      editar: vi.fn((id: string, frente: string, verso: string) =>
        of({ ...lista.find((c) => c.id === id)!, frente: frente.trim(), verso: verso.trim() }),
      ),
      descartar: vi.fn(() => of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [CardsPendentesPage],
      providers: [provideRouter([]), { provide: CardsPendentesService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(CardsPendentesPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  }

  it('mostra cada card com onde ele está, a frente e o verso', async () => {
    await iniciar();

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Cards Pendentes');
    expect(cards()).toHaveLength(2);

    const [primeiro] = cards();
    expect(primeiro.querySelector('.trilha')?.textContent).toContain('Matemática');
    expect(primeiro.querySelector('.trilha')?.textContent).toContain('Álgebra Linear');
    expect(primeiro.querySelector('.frente')?.textContent).toContain('O que é o núcleo?');
    expect(primeiro.querySelector('.verso')?.textContent).toContain('Os vetores levados ao nulo.');
    for (const acao of ['Aprovar', 'Editar', 'Descartar']) {
      expect(botao(acao, primeiro)).not.toBeNull();
    }
  });

  it('aprovar tira o card da lista', async () => {
    await iniciar();

    await clicar(botao('Aprovar', cards()[0]));

    expect(service.aprovar).toHaveBeenCalledWith('1');
    expect(frentes()).toEqual(['Para que servem os autovalores?']);
  });

  it('editar troca o texto pelos campos e salvar grava o novo texto', async () => {
    await iniciar();
    await clicar(botao('Editar', cards()[0]));

    const card = cards()[0];
    expect(campo(card, 'frente').value).toBe('O que é o núcleo?');
    expect(campo(card, 'verso').value).toBe('Os vetores levados ao nulo.');

    await digitar(campo(card, 'frente'), '  O que é o kernel?  ');
    await clicar(botao('Salvar', card));

    expect(service.editar).toHaveBeenCalledWith('1', '  O que é o kernel?  ', 'Os vetores levados ao nulo.');
    expect(cards()[0].querySelector('textarea')).toBeNull();
    expect(frentes()[0]).toBe('O que é o kernel?');
  });

  it('cancelar a edição volta ao texto original sem gravar', async () => {
    await iniciar();
    await clicar(botao('Editar', cards()[0]));
    await digitar(campo(cards()[0], 'frente'), 'Rascunho');

    await clicar(botao('Cancelar', cards()[0]));

    expect(service.editar).not.toHaveBeenCalled();
    expect(frentes()[0]).toBe('O que é o núcleo?');
  });

  it('não salva com a frente ou o verso vazios', async () => {
    await iniciar();
    await clicar(botao('Editar', cards()[0]));

    await digitar(campo(cards()[0], 'verso'), '   ');

    expect(botao('Salvar', cards()[0])?.disabled).toBe(true);
  });

  describe('clicar fora do card em edição', () => {
    async function clicarFora() {
      document.body.click();
      await fixture.whenStable();
    }

    it('salva o que mudou e fecha a edição', async () => {
      await iniciar();
      await clicar(botao('Editar', cards()[0]));
      await digitar(campo(cards()[0], 'frente'), 'O que é o kernel?');

      await clicarFora();

      expect(service.editar).toHaveBeenCalledWith('1', 'O que é o kernel?', 'Os vetores levados ao nulo.');
      expect(cards()[0].querySelector('textarea')).toBeNull();
      expect(frentes()[0]).toBe('O que é o kernel?');
    });

    it('sem mudanças, só fecha a edição', async () => {
      await iniciar();
      await clicar(botao('Editar', cards()[0]));

      await clicarFora();

      expect(service.editar).not.toHaveBeenCalled();
      expect(cards()[0].querySelector('textarea')).toBeNull();
    });

    it('com um lado vazio, fecha sem salvar e mantém o texto original', async () => {
      await iniciar();
      await clicar(botao('Editar', cards()[0]));
      await digitar(campo(cards()[0], 'verso'), '  ');

      await clicarFora();

      expect(service.editar).not.toHaveBeenCalled();
      expect(cards()[0].querySelector('.verso .texto')?.textContent?.trim()).toBe(
        'Os vetores levados ao nulo.',
      );
    });

    it('clicar dentro do próprio card não fecha a edição', async () => {
      await iniciar();
      await clicar(botao('Editar', cards()[0]));

      campo(cards()[0], 'verso').click();
      await fixture.whenStable();

      expect(cards()[0].querySelector('textarea')).not.toBeNull();
    });

    it('editar outro card salva o primeiro e abre o segundo', async () => {
      await iniciar();
      await clicar(botao('Editar', cards()[0]));
      await digitar(campo(cards()[0], 'frente'), 'O que é o kernel?');

      await clicar(botao('Editar', cards()[1]));

      expect(service.editar).toHaveBeenCalledWith('1', 'O que é o kernel?', 'Os vetores levados ao nulo.');
      expect(frentes()[0]).toBe('O que é o kernel?');
      expect(cards()[0].querySelector('textarea')).toBeNull();
      expect(campo(cards()[1], 'frente').value).toBe('Para que servem os autovalores?');
    });
  });

  describe('no celular', () => {
    const campoDoDialogo = (rotulo: string) =>
      [...dialogo()!.querySelectorAll('label')]
        .find((l) => l.textContent?.trim().startsWith(rotulo))!
        .querySelector('textarea')!;

    it('editar abre o modal com a pergunta e a resposta, sem mexer no card', async () => {
      await iniciar([KERNEL, AUTOVALOR], true);

      await clicar(botao('Editar', cards()[0]));

      expect(dialogo()?.querySelector('h2')?.textContent?.trim()).toBe('Editar card');
      expect(campoDoDialogo('Pergunta').value).toBe('O que é o núcleo?');
      expect(campoDoDialogo('Resposta').value).toBe('Os vetores levados ao nulo.');
      expect(document.activeElement).toBe(campoDoDialogo('Pergunta'));
      expect(cards()[0].querySelector('textarea')).toBeNull();
    });

    it('salvar no modal grava o novo texto e fecha o modal', async () => {
      await iniciar([KERNEL, AUTOVALOR], true);
      await clicar(botao('Editar', cards()[0]));

      await digitar(campoDoDialogo('Resposta'), 'Vetores que viram zero.');
      await clicar(botao('Salvar', dialogo()!));

      expect(service.editar).toHaveBeenCalledWith('1', 'O que é o núcleo?', 'Vetores que viram zero.');
      expect(dialogo()).toBeNull();
      expect(cards()[0].querySelector('.verso .texto')?.textContent?.trim()).toBe('Vetores que viram zero.');
    });

    it('cancelar no modal fecha sem salvar', async () => {
      await iniciar([KERNEL, AUTOVALOR], true);
      await clicar(botao('Editar', cards()[0]));
      await digitar(campoDoDialogo('Pergunta'), 'Rascunho');

      await clicar(botao('Cancelar', dialogo()!));

      expect(service.editar).not.toHaveBeenCalled();
      expect(dialogo()).toBeNull();
      expect(frentes()[0]).toBe('O que é o núcleo?');
    });

    it('não salva no modal com a pergunta ou a resposta vazias', async () => {
      await iniciar([KERNEL, AUTOVALOR], true);
      await clicar(botao('Editar', cards()[0]));

      await digitar(campoDoDialogo('Pergunta'), '  ');

      expect(botao('Salvar', dialogo()!)?.disabled).toBe(true);
    });
  });

  it('pede confirmação antes de descartar', async () => {
    await iniciar();

    await clicar(botao('Descartar', cards()[0]));

    expect(dialogo()?.querySelector('h2')?.textContent?.trim()).toBe('Descartar card?');
    expect(document.activeElement).toBe(botao('Cancelar', dialogo()!));

    await clicar(botao('Cancelar', dialogo()!));

    expect(service.descartar).not.toHaveBeenCalled();
    expect(dialogo()).toBeNull();
    expect(cards()).toHaveLength(2);
  });

  it('descarta o card ao confirmar', async () => {
    await iniciar();
    await clicar(botao('Descartar', cards()[1]));

    await clicar(botao('Descartar', dialogo()!));

    expect(service.descartar).toHaveBeenCalledWith('2');
    expect(dialogo()).toBeNull();
    expect(frentes()).toEqual(['O que é o núcleo?']);
  });

  it('sem cards pendentes, mostra o estado vazio', async () => {
    await iniciar([]);

    expect(cards()).toHaveLength(0);
    expect(el.textContent).toContain('Nenhum card pendente');
  });

  it('o estado vazio aparece depois de aprovar o último card', async () => {
    await iniciar([KERNEL]);

    await clicar(botao('Aprovar', cards()[0]));

    expect(el.textContent).toContain('Nenhum card pendente');
  });
});
