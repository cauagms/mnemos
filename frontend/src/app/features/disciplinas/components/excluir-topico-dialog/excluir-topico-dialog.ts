import {
  AfterViewInit,
  Component,
  DOCUMENT,
  ElementRef,
  OnDestroy,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Topico } from '../../services/topicos.service';

/** Confirmação antes de excluir um tópico. O foco começa em "Cancelar", a opção segura. */
@Component({
  selector: 'app-excluir-topico-dialog',
  templateUrl: './excluir-topico-dialog.html',
  styleUrl: '../dialogo.scss',
})
export class ExcluirTopicoDialog implements AfterViewInit, OnDestroy {
  private readonly focoAnterior = inject(DOCUMENT).activeElement as HTMLElement | null;

  readonly topico = input.required<Topico>();
  readonly excluindo = input(false);
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  private readonly botaoCancelar = viewChild.required<ElementRef<HTMLButtonElement>>('botaoCancelar');

  ngAfterViewInit(): void {
    this.dialogo().nativeElement.showModal();
    this.botaoCancelar().nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this.focoAnterior?.isConnected) this.focoAnterior.focus();
  }
}
