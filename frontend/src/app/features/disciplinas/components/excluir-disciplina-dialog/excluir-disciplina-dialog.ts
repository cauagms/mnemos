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
import { Disciplina } from '../../services/disciplinas.service';

/** Confirmação antes de excluir uma disciplina. O foco começa em "Cancelar", a opção segura. */
@Component({
  selector: 'app-excluir-disciplina-dialog',
  templateUrl: './excluir-disciplina-dialog.html',
  styleUrl: '../dialogo.scss',
})
export class ExcluirDisciplinaDialog implements AfterViewInit, OnDestroy {
  private readonly focoAnterior = inject(DOCUMENT).activeElement as HTMLElement | null;

  readonly disciplina = input.required<Disciplina>();
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
