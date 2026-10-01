import {
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DescartarCardDialog } from '../../components/descartar-card-dialog/descartar-card-dialog';
import { EditarCardDialog, TextoCard } from '../../components/editar-card-dialog/editar-card-dialog';
import { CardPendente, CardsPendentesService } from '../../services/cards-pendentes.service';

type Lado = 'frente' | 'verso';

/** Mesma largura em que os cards viram uma coluna só (ver o SCSS): ali a edição abre em modal. */
const CELULAR = '(max-width: 767.98px)';

/** Curadoria dos flashcards gerados pela IA: aprovar, editar ou descartar cada um. */
@Component({
  selector: 'app-cards-pendentes-page',
  imports: [RouterLink, DescartarCardDialog, EditarCardDialog],
  templateUrl: './cards-pendentes-page.html',
  // Reaproveita título, subtítulo, estado vazio e botão da tela de Disciplinas.
  styleUrls: [
    '../../../disciplinas/pages/disciplinas-page/disciplinas-page.scss',
    './cards-pendentes-page.scss',
  ],
  host: {
    '(document:click)': 'clicarFora($event)',
  },
})
export class CardsPendentesPage {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly service = inject(CardsPendentesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  /** `null` enquanto os dados ainda não chegaram. */
  protected readonly cards = signal<CardPendente[] | null>(null);
  /** Id do card em edição (só um por vez). */
  protected readonly editando = signal<string | null>(null);
  protected readonly rascunho = signal({ frente: '', verso: '' });
  protected readonly podeSalvar = computed(
    () => !!this.rascunho().frente.trim() && !!this.rascunho().verso.trim(),
  );
  /** Card em edição no modal (celular). */
  protected readonly editandoNoModal = signal<CardPendente | null>(null);
  /** Card aguardando a confirmação de descarte. */
  protected readonly descartando = signal<CardPendente | null>(null);

  private readonly campoFrente = viewChild<ElementRef<HTMLTextAreaElement>>('campoFrente');

  private readonly celular = signal(false);

  constructor() {
    const consulta = inject(DOCUMENT).defaultView?.matchMedia?.(CELULAR);
    if (consulta) {
      this.celular.set(consulta.matches);
      const mudar = (e: MediaQueryListEvent) => this.celular.set(e.matches);
      consulta.addEventListener('change', mudar);
      inject(DestroyRef).onDestroy(() => consulta.removeEventListener('change', mudar));
    }

    this.service
      .listar()
      .pipe(takeUntilDestroyed())
      .subscribe((cards) => this.cards.set(cards));
  }

  protected aprovar(card: CardPendente): void {
    this.service
      .aprovar(card.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.remover(card.id));
  }

  protected editar(card: CardPendente): void {
    this.concluirEdicao();
    if (this.celular()) {
      this.editandoNoModal.set(card);
      return;
    }
    this.rascunho.set({ frente: card.frente, verso: card.verso });
    this.editando.set(card.id);
    afterNextRender(() => this.campoFrente()?.nativeElement.focus(), { injector: this.injector });
  }

  protected escrever(lado: Lado, evento: Event): void {
    const valor = (evento.target as HTMLTextAreaElement).value;
    this.rascunho.update((r) => ({ ...r, [lado]: valor }));
  }

  protected salvar(card: CardPendente): void {
    if (!this.podeSalvar()) return;
    this.gravar(card, this.rascunho(), () => {
      // Outro card pode ter entrado em edição enquanto este salvava.
      if (this.editando() === card.id) this.editando.set(null);
    });
  }

  protected salvarDoModal(card: CardPendente, texto: TextoCard): void {
    this.gravar(card, texto, () => this.editandoNoModal.set(null));
  }

  private gravar(card: CardPendente, { frente, verso }: TextoCard, depois: () => void): void {
    this.service
      .editar(card.id, frente, verso)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((editado) => {
        this.cards.update((lista) => lista?.map((c) => (c.id === editado.id ? editado : c)) ?? null);
        depois();
      });
  }

  /**
   * Clique fora do card em edição fecha a edição. Quando o clique chega ao documento a tela
   * ainda não foi redesenhada, então o card é achado pelo id em edição (não por uma classe), e
   * o teste usa o caminho do evento (não `contains`), porque o botão clicado pode já ter saído.
   */
  protected clicarFora(evento: Event): void {
    const id = this.editando();
    const card = id && this.host.nativeElement.querySelector(`[data-card="${id}"]`);
    if (card && !evento.composedPath().includes(card)) this.concluirEdicao();
  }

  /** Salva se algo mudou e os dois lados estão preenchidos; senão só fecha (como Cancelar). */
  private concluirEdicao(): void {
    const card = this.cards()?.find((c) => c.id === this.editando());
    if (!card) return;
    const { frente, verso } = this.rascunho();
    const mudou = frente.trim() !== card.frente || verso.trim() !== card.verso;
    if (mudou && this.podeSalvar()) {
      this.salvar(card);
    } else {
      this.editando.set(null);
    }
  }

  protected descartar(): void {
    const card = this.descartando();
    if (!card) return;
    this.service
      .descartar(card.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.remover(card.id);
        this.descartando.set(null);
      });
  }

  private remover(id: string): void {
    this.cards.update((lista) => lista?.filter((c) => c.id !== id) ?? null);
    if (this.editando() === id) this.editando.set(null);
  }
}
