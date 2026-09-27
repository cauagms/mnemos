import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let el: HTMLElement;
  let resposta: Subject<void>;
  let authService: { login: ReturnType<typeof vi.fn> };

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

  beforeEach(async () => {
    resposta = new Subject<void>();
    authService = { login: vi.fn(() => resposta.asObservable()) };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('não mostra erros antes de enviar', () => {
    expect(erro('login-email')).toBeNull();
    expect(erro('login-senha')).toBeNull();
  });

  it('exige e-mail e senha ao enviar vazio', async () => {
    await enviar();

    expect(erro('login-email')).toBe('Informe seu e-mail.');
    expect(erro('login-senha')).toBe('Informe sua senha.');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('recusa e-mail em formato inválido', async () => {
    await digitar('login-email', 'aluno@');
    await enviar();

    expect(erro('login-email')).toBe('Digite um e-mail válido.');
  });

  it('liga a mensagem de erro ao campo para tecnologias assistivas', async () => {
    await enviar();

    const email = campo('login-email');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(email.getAttribute('aria-describedby')).toBe('login-email-erro');
  });

  it('move o foco para o primeiro campo com erro', async () => {
    await enviar();
    expect(document.activeElement).toBe(campo('login-email'));

    await digitar('login-email', 'aluno@email.com');
    await enviar();
    expect(document.activeElement).toBe(campo('login-senha'));
  });

  it('remove só o erro do campo em que o usuário volta a digitar', async () => {
    await enviar();
    await digitar('login-email', 'a');

    expect(erro('login-email')).toBeNull();
    expect(campo('login-email').getAttribute('aria-invalid')).toBeNull();
    expect(erro('login-senha')).toBe('Informe sua senha.');
  });

  it('identifica os campos só pelo rótulo, sem placeholder', () => {
    for (const id of ['login-email', 'login-senha']) {
      expect(campo(id).hasAttribute('placeholder')).toBe(false);
      expect(campo(id).labels?.[0]?.textContent).toBeTruthy();
    }
  });

  describe('mostrar/ocultar senha', () => {
    const olho = () => el.querySelector<HTMLButtonElement>('#login-senha + button')!;

    async function clicarOlho() {
      olho().click();
      await fixture.whenStable();
    }

    it('alterna entre mostrar e ocultar a senha', async () => {
      expect(campo('login-senha').type).toBe('password');
      expect(olho().getAttribute('aria-label')).toBe('Mostrar senha');
      expect(olho().getAttribute('aria-pressed')).toBe('false');

      await clicarOlho();
      expect(campo('login-senha').type).toBe('text');
      expect(olho().getAttribute('aria-label')).toBe('Mostrar senha');
      expect(olho().getAttribute('aria-pressed')).toBe('true');

      await clicarOlho();
      expect(campo('login-senha').type).toBe('password');
      expect(olho().getAttribute('aria-label')).toBe('Mostrar senha');
      expect(olho().getAttribute('aria-pressed')).toBe('false');
    });

    it('não envia o formulário', async () => {
      await digitar('login-email', 'aluno@email.com');
      await digitar('login-senha', 'segredo123');
      await clicarOlho();

      expect(authService.login).not.toHaveBeenCalled();
      expect(erro('login-email')).toBeNull();
    });
  });

  it('envia os dados e mostra o estado de carregamento até a resposta', async () => {
    await digitar('login-email', 'aluno@email.com');
    await digitar('login-senha', 'segredo123');
    await enviar();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'aluno@email.com',
      senha: 'segredo123',
    });
    expect(botao().disabled).toBe(true);
    expect(botao().textContent?.trim()).toBe('Entrando...');

    resposta.next();
    resposta.complete();
    await fixture.whenStable();

    expect(botao().disabled).toBe(false);
    expect(botao().textContent?.trim()).toBe('Entrar');
  });
});
