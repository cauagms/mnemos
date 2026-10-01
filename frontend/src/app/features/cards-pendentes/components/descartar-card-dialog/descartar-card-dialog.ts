import { AfterViewInit, Component, DOCUMENT, ElementRef, OnDestroy, inject, output, viewChild } from '@angular/core';

/** Confirmação antes de descartar um card pendente. O foco começa em "Cancelar", a opção segura. */
@Component({
  selector: 'app-descartar-card-dialog',
  templateUrl: './descartar-card-dialog.html',
  styleUrl: '../../../disciplinas/components/dialogo.scss',
})
export class DescartarCardDialog implements AfterViewInit, OnDestroy {
  private readonly focoAnterior = inject(DOCUMENT).activeElement as HTMLElement | null;

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
