
import { Component, ElementRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

type Campo = 'email' | 'senha';

const CAMPOS: Campo[] = ['email', 'senha'];

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: '../../auth-page.scss',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  protected readonly carregando = signal(false);
  protected readonly senhaVisivel = signal(false);
  protected readonly erroLogin = signal<string | null>(null);

  private readonly errosVisiveis = signal<Record<Campo, boolean>>({
    email: false,
    senha: false,
  });

  protected erro(campo: Campo): string | null {
    return this.errosVisiveis()[campo] ? this.mensagem(campo) : null;
  }

  private mensagem(campo: Campo): string | null {
    const controle = this.form.controls[campo];

    if (campo === 'email') {
      if (controle.hasError('required')) return 'Informe seu e-mail.';
      if (controle.hasError('email')) return 'Digite um e-mail válido.';
    }

    if (campo === 'senha' && controle.hasError('required')) {
      return 'Informe sua senha.';
    }

    return null;
  }

  protected esconderErro(campo: Campo): void {
    this.errosVisiveis.update((visiveis) => ({
      ...visiveis,
      [campo]: false,
    }));
    this.erroLogin.set(null);
  }

  protected enviar(): void {
    if (this.carregando()) return;

    if (this.form.invalid) {
      this.errosVisiveis.set({ email: true, senha: true });

      const primeiro = CAMPOS.find((campo) => this.mensagem(campo));

      if (primeiro) {
        this.host.nativeElement
          .querySelector<HTMLInputElement>(`#login-${primeiro}`)
          ?.focus();
      }

      return;
    }

    this.carregando.set(true);
    this.erroLogin.set(null);

    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (resposta) => {
          // Guarda o JWT recebido da API.
          localStorage.setItem('access_token', resposta.access_token);

          // Redireciona após o login bem-sucedido.
          void this.router.navigate(['/disciplinas']);
        },
        error: (erro) => {
          if (erro.status === 401) {
            this.erroLogin.set('E-mail ou senha incorretos.');
          } else if (erro.status === 0) {
            this.erroLogin.set(
              'Não foi possível conectar ao servidor. Verifique se a API está funcionando.',
            );
          } else {
            this.erroLogin.set(
              erro.error?.detail ?? 'Não foi possível realizar o login.',
            );
          }
        },
      });
  }
}
