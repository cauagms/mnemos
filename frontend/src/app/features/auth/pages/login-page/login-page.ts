
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: '../../auth-page.scss',
})
export class LoginPage {
  private readonly router = inject(Router);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: [''],
    senha: [''],
  });

  protected readonly carregando = signal(false);
  protected readonly senhaVisivel = signal(false);

  protected enviar(): void {
    if (this.carregando()) return;

    this.carregando.set(true);

    this.router.navigate(['/disciplinas']).finally(() => {
      this.carregando.set(false);
    });
  }

  protected erro(_campo: 'email' | 'senha'): string | null {
    return null;
  }

  protected esconderErro(_campo: 'email' | 'senha'): void {
    // Validação desativada temporariamente para testes.
  }
}
