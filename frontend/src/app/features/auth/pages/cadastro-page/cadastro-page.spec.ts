import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CadastroPage } from './cadastro-page';

describe('CadastroPage', () => {
  let fixture: ComponentFixture<CadastroPage>;
  let el: HTMLElement;
  let resposta: Subject<void>;
  let authService: { cadastrar: ReturnType<typeof vi.fn> };

  const campo = (id: string) => el.querySelector<HTMLInputElement>(`#${id}`)!;
  const botao = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const erro = (id: string) => el.querySelector(`#${id}-erro`)?.textContent?.trim() ?? null;

  async function digitar(id: string, valor: string) {
    const input = campo(id);
    input.value = valor;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function enviar() {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  async function preencherValido() {
    await digitar('cadastro-nome', 'Ana Souza');
    await digitar('cadastro-email', 'ana@email.com');
    await digitar('cadastro-senha', 'segredo123');
    await digitar('cadastro-confirmar-senha', 'segredo123');
  }

  beforeEach(async () => {
    resposta = new Subject<void>();
    authService = { cadastrar: vi.fn(() => resposta.asObservable()) };

    await TestBed.configureTestingModule({
      imports: [CadastroPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('exige todos os campos ao enviar vazio', async () => {
    await enviar();

    expect(erro('cadastro-nome')).toBe('Informe seu nome.');
    expect(erro('cadastro-email')).toBe('Informe seu e-mail.');
    expect(erro('cadastro-senha')).toBe('Crie uma senha.');
    expect(erro('cadastro-confirmar-senha')).toBe('Repita a senha.');
    expect(authService.cadastrar).not.toHaveBeenCalled();
  });

  it('recusa nome só com espaços', async () => {
    await digitar('cadastro-nome', '   ');
    await enviar();

    expect(erro('cadastro-nome')).toBe('Informe seu nome.');
  });

  it('recusa e-mail em formato inválido', async () => {
    await digitar('cadastro-email', 'ana.email.com');
    await enviar();

    expect(erro('cadastro-email')).toBe('Digite um e-mail válido.');
  });

  it('exige senha com pelo menos 8 caracteres', async () => {
    await digitar('cadastro-senha', '1234567');
    await enviar();

    expect(erro('cadastro-senha')).toBe('Use pelo menos 8 caracteres.');
  });

  it('exige que a confirmação seja igual à senha', async () => {
    await preencherValido();
    await digitar('cadastro-confirmar-senha', 'outra-senha');
    await enviar();

    expect(erro('cadastro-confirmar-senha')).toBe('As senhas não coincidem.');
    expect(authService.cadastrar).not.toHaveBeenCalled();
  });

  it('liga a mensagem de erro ao campo para tecnologias assistivas', async () => {
    await enviar();

    const senha = campo('cadastro-senha');
    expect(senha.getAttribute('aria-invalid')).toBe('true');
    expect(senha.getAttribute('aria-describedby')).toBe('cadastro-senha-erro');
  });

  it('move o foco para o primeiro campo com erro', async () => {
    await enviar();
    expect(document.activeElement).toBe(campo('cadastro-nome'));

    await preencherValido();
    await digitar('cadastro-confirmar-senha', 'outra-senha');
    await enviar();
    expect(document.activeElement).toBe(campo('cadastro-confirmar-senha'));
  });

  it('remove só o erro do campo em que o usuário volta a digitar', async () => {
    await enviar();
    await digitar('cadastro-nome', 'A');

    expect(erro('cadastro-nome')).toBeNull();
    expect(erro('cadastro-email')).toBe('Informe seu e-mail.');
  });

  describe('texto de ajuda da senha', () => {
    const ajuda = () => el.querySelector('#cadastro-senha-ajuda')?.textContent?.trim() ?? null;

    it('mostra a regra da senha ligada ao campo enquanto não há erro', () => {
      expect(ajuda()).toBe('Use pelo menos 8 caracteres.');
      expect(campo('cadastro-senha').getAttribute('aria-describedby')).toBe('cadastro-senha-ajuda');
    });

    it('é trocado pela mensagem de erro após envio inválido', async () => {
      await enviar();

      expect(ajuda()).toBeNull();
      expect(erro('cadastro-senha')).toBe('Crie uma senha.');
      expect(campo('cadastro-senha').getAttribute('aria-describedby')).toBe('cadastro-senha-erro');
    });

    it('volta quando o usuário digita de novo na senha', async () => {
      await enviar();
      await digitar('cadastro-senha', 'a');

      expect(erro('cadastro-senha')).toBeNull();
      expect(ajuda()).toBe('Use pelo menos 8 caracteres.');
      expect(campo('cadastro-senha').getAttribute('aria-describedby')).toBe('cadastro-senha-ajuda');
    });
  });

  it('identifica os campos só pelo rótulo, sem placeholder', () => {
    for (const id of ['cadastro-nome', 'cadastro-email', 'cadastro-senha', 'cadastro-confirmar-senha']) {
      expect(campo(id).hasAttribute('placeholder')).toBe(false);
      expect(campo(id).labels?.[0]?.textContent).toBeTruthy();
    }
  });

  describe('mostrar/ocultar senha', () => {
    const olho = (id: string) => el.querySelector<HTMLButtonElement>(`#${id} + button`)!;

    async function clicarOlho(id: string) {
      olho(id).click();
      await fixture.whenStable();
    }

    it('alterna entre mostrar e ocultar a senha', async () => {
      expect(olho('cadastro-senha').getAttribute('aria-pressed')).toBe('false');

      await clicarOlho('cadastro-senha');
      expect(campo('cadastro-senha').type).toBe('text');
      expect(olho('cadastro-senha').getAttribute('aria-label')).toBe('Mostrar senha');
      expect(olho('cadastro-senha').getAttribute('aria-pressed')).toBe('true');

      await clicarOlho('cadastro-senha');
      expect(campo('cadastro-senha').type).toBe('password');
      expect(olho('cadastro-senha').getAttribute('aria-label')).toBe('Mostrar senha');
      expect(olho('cadastro-senha').getAttribute('aria-pressed')).toBe('false');
    });

    it('cada botão controla só o seu campo', async () => {
      await clicarOlho('cadastro-confirmar-senha');

      expect(campo('cadastro-confirmar-senha').type).toBe('text');
      expect(olho('cadastro-confirmar-senha').getAttribute('aria-pressed')).toBe('true');
      expect(campo('cadastro-senha').type).toBe('password');
      expect(olho('cadastro-senha').getAttribute('aria-pressed')).toBe('false');
    });

    it('não envia o formulário', async () => {
      await preencherValido();
      await clicarOlho('cadastro-senha');
      await clicarOlho('cadastro-confirmar-senha');

      expect(authService.cadastrar).not.toHaveBeenCalled();
      expect(erro('cadastro-nome')).toBeNull();
    });
  });

  it('envia os dados e mostra o estado de carregamento até a resposta', async () => {
    await preencherValido();
    await enviar();

    expect(authService.cadastrar).toHaveBeenCalledWith({
      nome: 'Ana Souza',
      email: 'ana@email.com',
      senha: 'segredo123',
    });
    expect(botao().disabled).toBe(true);
    expect(botao().textContent?.trim()).toBe('Criando conta...');

    resposta.next();
    resposta.complete();
    await fixture.whenStable();

    expect(botao().disabled).toBe(false);
    expect(botao().textContent?.trim()).toBe('Criar conta');
  });
});
