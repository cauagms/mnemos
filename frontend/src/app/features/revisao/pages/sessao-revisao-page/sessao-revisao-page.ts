import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ItemRevisao, ModoRevisao, Nota, RevisaoService } from '../../services/revisao.service';

const MODOS: ModoRevisao[] = ['hoje', 'novos'];

/** Sessão de revisão: mostra um item por vez (flashcard ou questão de quiz) até acabar a fila. */
@Component({
  selector: 'app-sessao-revisao-page',
  imports: [RouterLink],
  templateUrl: './sessao-revisao-page.html',
  // Reaproveita título e botão da tela de Disciplinas, o "Voltar" da tela de Tópicos e a
  // trilha da tela de Enviar material.
  styleUrls: [
    '../../../disciplinas/pages/disciplinas-page/disciplinas-page.scss',
    '../../../disciplinas/pages/topicos-page/topicos-page.scss',
    '../../../upload/pages/enviar-material-page/enviar-material-page.scss',
    './sessao-revisao-page.scss',
    './quiz.scss',
  ],
})
export class SessaoRevisaoPage {
  private readonly revisaoService = inject(RevisaoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly letras = 'ABCDEFGH';
  protected readonly notas: { nota: Nota; rotulo: string }[] = [
    { nota: 'errei', rotulo: 'Errei' },
    { nota: 'dificil', rotulo: 'Difícil' },
    { nota: 'bom', rotulo: 'Bom' },
    { nota: 'facil', rotulo: 'Fácil' },
  ];

  /** `null` enquanto os dados ainda não chegaram. */
  protected readonly itens = signal<ItemRevisao[] | null>(null);
  protected readonly indice = signal(0);
  /** `undefined` quando a fila acabou. */
  protected readonly atual = computed(() => this.itens()?.[this.indice()]);
  /** Flashcard mostrando o verso. */
  protected readonly virada = signal(false);
  /** Altura de cada face do flashcard atual, medida no navegador. */
  private readonly alturas = signal({ frente: 0, verso: 0 });
  /** A carta tem a altura da face visível; `null` (altura automática) enquanto não há medida. */
  protected readonly alturaCarta = computed(() => {
    const { frente, verso } = this.alturas();
    return (this.virada() ? verso : frente) || null;
  });
  /** Alternativa escolhida na questão atual. */
  protected readonly escolhida = signal<number | null>(null);

  /** Primeiro controle de cada item, que recebe o foco quando ele aparece. */
  private readonly inicio = viewChild<ElementRef<HTMLElement>>('inicio');
  private readonly resposta = viewChild<ElementRef<HTMLElement>>('resposta');
  private readonly proxima = viewChild<ElementRef<HTMLElement>>('proxima');
  private readonly frente = viewChild<ElementRef<HTMLElement>>('frente');
  private readonly verso = viewChild<ElementRef<HTMLElement>>('verso');

  constructor() {
    // Mede as duas faces de cada flashcard (e de novo se o texto quebrar diferente, ao
    // redimensionar a tela), para a carta acompanhar a altura da face visível.
    effect((onCleanup) => {
      const frente = this.frente()?.nativeElement;
      const verso = this.verso()?.nativeElement;
      if (!frente || !verso || typeof ResizeObserver === 'undefined') return;

      const observador = new ResizeObserver(() =>
        this.alturas.set({ frente: frente.offsetHeight, verso: verso.offsetHeight }),
      );
      observador.observe(frente);
      observador.observe(verso);
      onCleanup(() => observador.disconnect());
    });

    const modo = inject(ActivatedRoute).snapshot.paramMap.get('modo') as ModoRevisao;
    if (!MODOS.includes(modo)) {
      inject(Router).navigate(['/revisao']);
      return;
    }

    this.revisaoService
      .sessao(modo)
      .pipe(takeUntilDestroyed())
      .subscribe((itens) => this.itens.set(itens));
  }

  protected virar(): void {
    this.virada.set(true);
    // A frente fica inerte; leva o foco para a resposta, que acabou de aparecer.
    this.focar(this.resposta);
  }

  protected avaliar(nota: Nota): void {
    const item = this.atual();
    if (!item) return;
    this.revisaoService
      .avaliar(item.id, nota)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.avancar());
  }

  protected escolher(alternativa: number): void {
    const item = this.atual();
    if (!item || this.escolhida() !== null) return;
    this.escolhida.set(alternativa);
    this.revisaoService
      .responder(item.id, alternativa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
    this.focar(this.proxima);
  }

  protected avancar(): void {
    this.indice.update((i) => i + 1);
    this.virada.set(false);
    this.escolhida.set(null);
    this.focar(this.inicio);
  }

  // Sem rolar a página: depois de responder o quiz, o aluno precisa ver as explicações do topo.
  private focar(alvo: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(() => alvo()?.nativeElement.focus({ preventScroll: true }), {
      injector: this.injector,
    });
  }
}
