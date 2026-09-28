import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Topico } from '../../services/topicos.service';

/** Card de um tópico, com o menu ⋮ de Editar/Excluir igual ao do card de disciplina. */
@Component({
  selector: 'app-topico-card',
  imports: [RouterLink],
  templateUrl: './topico-card.html',
  styleUrl: './topico-card.scss',
  host: {
    '(document:click)': 'fecharSeForaDoCard($event)',
    '(keydown.escape)': 'fecharAcoes()',
  },
})
export class TopicoCard {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly disciplinaId = input.required<string>();
  readonly topico = input.required<Topico>();

  /** Tela de enviar material deste tópico, aberta pelo card inteiro ou pelo botão. */
  protected readonly rota = computed(() => [
    '/disciplinas',
    this.disciplinaId(),
    'topicos',
    this.topico().id,
  ]);
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
