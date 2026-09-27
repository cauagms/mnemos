import { Component, ElementRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  protected readonly carregando = signal(false);
  protected readonly senhaVisivel = signal(false);
  private readonly errosVisiveis = signal<Record<Campo, boolean>>({ email: false, senha: false });

  protected erro(campo: Campo): string | null {
    return this.errosVisiveis()[campo] ? this.mensagem(campo) : null;
  }

  private mensagem(campo: Campo): string | null {
    const controle = this.form.controls[campo];
    if (campo === 'email') {
      if (controle.hasError('required')) return 'Informe seu e-mail.';
      if (controle.hasError('email')) return 'Digite um e-mail válido.';
    }
    if (campo === 'senha' && controle.hasError('required')) return 'Informe sua senha.';
    return null;
  }

  protected esconderErro(campo: Campo): void {
    this.errosVisiveis.update((visiveis) => ({ ...visiveis, [campo]: false }));
  }

  protected enviar(): void {
    if (this.carregando()) return;

    if (this.form.invalid) {
      this.errosVisiveis.set({ email: true, senha: true });
      const primeiro = CAMPOS.find((campo) => this.mensagem(campo));
      this.host.nativeElement.querySelector<HTMLInputElement>(`#login-${primeiro}`)?.focus();
      return;
    }

    this.carregando.set(true);
    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe();
  }
}
