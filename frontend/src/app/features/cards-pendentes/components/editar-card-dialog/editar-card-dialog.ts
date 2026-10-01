import {
  AfterViewInit,
  Component,
  DOCUMENT,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CardPendente } from '../../services/cards-pendentes.service';

export interface TextoCard {
  frente: string;
  verso: string;
}

/** Edição de um card pendente em modal, usada no celular. O foco começa na pergunta. */
@Component({
  selector: 'app-editar-card-dialog',
  templateUrl: './editar-card-dialog.html',
  styleUrls: ['../../../disciplinas/components/dialogo.scss', './editar-card-dialog.scss'],
})
export class EditarCardDialog implements OnInit, AfterViewInit, OnDestroy {
  private readonly focoAnterior = inject(DOCUMENT).activeElement as HTMLElement | null;

  readonly card = input.required<CardPendente>();
  readonly salvar = output<TextoCard>();
  readonly cancelar = output<void>();

  protected readonly frente = signal('');
  protected readonly verso = signal('');
  protected readonly podeSalvar = computed(() => !!this.frente().trim() && !!this.verso().trim());

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  private readonly campoFrente = viewChild.required<ElementRef<HTMLTextAreaElement>>('campoFrente');

  ngOnInit(): void {
    this.frente.set(this.card().frente);
    this.verso.set(this.card().verso);
  }

  ngAfterViewInit(): void {
    this.dialogo().nativeElement.showModal();
    this.campoFrente().nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this.focoAnterior?.isConnected) this.focoAnterior.focus();
  }

  protected escrever(lado: 'frente' | 'verso', evento: Event): void {
    this[lado].set((evento.target as HTMLTextAreaElement).value);
  }

  protected enviar(): void {
    if (this.podeSalvar()) this.salvar.emit({ frente: this.frente(), verso: this.verso() });
  }
}
