import { Component, ElementRef, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

type Campo = 'nome' | 'email' | 'senha' | 'confirmarSenha';

const CAMPOS: Campo[] = ['nome', 'email', 'senha', 'confirmarSenha'];

const IDS: Record<Campo, string> = {
  nome: 'cadastro-nome',
  email: 'cadastro-email',
  senha: 'cadastro-senha',
  confirmarSenha: 'cadastro-confirmar-senha',
};

function senhasIguais(grupo: AbstractControl): ValidationErrors | null {
  const { senha, confirmarSenha } = grupo.value;
  return confirmarSenha && senha !== confirmarSenha ? { senhasDiferentes: true } : null;
}

@Component({
  selector: 'app-cadastro-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro-page.html',
  styleUrl: '../../auth-page.scss',
})
export class CadastroPage {
  private readonly authService = inject(AuthService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly ids = IDS;

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      nome: ['', [Validators.required, Validators.pattern(/\S/)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      confirmarSenha: ['', Validators.required],
    },
    { validators: senhasIguais },
  );

  protected readonly carregando = signal(false);
  protected readonly senhaVisivel = signal({ senha: false, confirmarSenha: false });
  private readonly errosVisiveis = signal<Record<Campo, boolean>>({
    nome: false,
    email: false,
    senha: false,
    confirmarSenha: false,
  });

  protected erro(campo: Campo): string | null {
    return this.errosVisiveis()[campo] ? this.mensagem(campo) : null;
  }

  private mensagem(campo: Campo): string | null {
    const controle = this.form.controls[campo];
    switch (campo) {
      case 'nome':
        return controle.invalid ? 'Informe seu nome.' : null;
      case 'email':
        if (controle.hasError('required')) return 'Informe seu e-mail.';
        return controle.hasError('email') ? 'Digite um e-mail válido.' : null;
      case 'senha':
        if (controle.hasError('required')) return 'Crie uma senha.';
        return controle.hasError('minlength') ? 'Use pelo menos 8 caracteres.' : null;
      case 'confirmarSenha':
        if (controle.hasError('required')) return 'Repita a senha.';
        return this.form.hasError('senhasDiferentes') ? 'As senhas não coincidem.' : null;
    }
  }

  protected esconderErro(campo: Campo): void {
    this.errosVisiveis.update((visiveis) => ({ ...visiveis, [campo]: false }));
  }

  protected alternarSenha(campo: 'senha' | 'confirmarSenha'): void {
    this.senhaVisivel.update((visivel) => ({ ...visivel, [campo]: !visivel[campo] }));
  }

  protected enviar(): void {
    if (this.carregando()) return;

    if (this.form.invalid) {
      this.errosVisiveis.set({ nome: true, email: true, senha: true, confirmarSenha: true });
      const primeiro = CAMPOS.find((campo) => this.mensagem(campo));
      if (primeiro) {
        this.host.nativeElement.querySelector<HTMLInputElement>(`#${IDS[primeiro]}`)?.focus();
      }
      return;
    }

    const { nome, email, senha } = this.form.getRawValue();
    this.carregando.set(true);
    this.authService
      .cadastrar({ nome: nome.trim(), email, senha })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe();
  }
}
