import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Disciplina } from '../../services/disciplinas.service';

/**
 * Card de uma disciplina. As ações (Editar/Excluir) aparecem dentro do cabeçalho do
 * próprio card, no espaço livre entre o ícone e o botão ⋮, em vez de um menu suspenso:
 * assim não cobrem o nome nem invadem o card vizinho na grade.
 */
@Component({
  selector: 'app-disciplina-card',
  templateUrl: './disciplina-card.html',
  styleUrl: './disciplina-card.scss',
  host: {
    '(document:click)': 'fecharSeForaDoCard($event)',
    '(keydown.escape)': 'fecharAcoes()',
  },
})
export class DisciplinaCard {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly disciplina = input.required<Disciplina>();
  readonly editar = output<void>();
  readonly excluir = output<void>();

  protected readonly acoesAbertas = signal(false);
  private readonly botaoAcoes = viewChild.required<ElementRef<HTMLButtonElement>>('botaoAcoes');
  private readonly primeiraAcao = viewChild<ElementRef<HTMLButtonElement>>('primeiraAcao');

  protected alternarAcoes(): void {
    if (this.acoesAbertas()) {
      this.acoesAbertas.set(false);
      return;
    }
    this.acoesAbertas.set(true);
    afterNextRender(() => this.primeiraAcao()?.nativeElement.focus(), { injector: this.injector });
  }

  protected fecharAcoes(): void {
    if (!this.acoesAbertas()) return;
    this.acoesAbertas.set(false);
    this.botaoAcoes().nativeElement.focus();
  }

  protected fecharSeForaDoCard(evento: Event): void {
    if (!this.host.nativeElement.contains(evento.target as Node)) {
      this.acoesAbertas.set(false);
    }
  }

  // Devolve o foco ao botão ⋮ antes de avisar a página, para o modal saber para onde voltar.
  protected escolher(acao: 'editar' | 'excluir'): void {
    this.fecharAcoes();
    this[acao].emit();
  }
}
