import {
  AfterViewInit,
  Component,
  DOCUMENT,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Disciplina } from '../../services/disciplinas.service';

/** Modal de criar (sem `disciplina`) ou renomear (com `disciplina`) uma disciplina. */
@Component({
  selector: 'app-disciplina-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './disciplina-dialog.html',
  styleUrl: '../dialogo.scss',
})
export class DisciplinaDialog implements OnInit, AfterViewInit, OnDestroy {
  private readonly focoAnterior = inject(DOCUMENT).activeElement as HTMLElement | null;
  // Só devolve o foco ao cancelar: depois de salvar, o botão que abriu o modal ficaria destacado.
  private devolverFoco = true;

  readonly disciplina = input<Disciplina | null>(null);
  readonly salvando = input(false);
  readonly salvar = output<string>();
  readonly cancelar = output<void>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.pattern(/\S/)]],
  });
  protected readonly erroVisivel = signal(false);

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  private readonly campo = viewChild.required<ElementRef<HTMLInputElement>>('campo');

  ngOnInit(): void {
    this.form.setValue({ nome: this.disciplina()?.nome ?? '' });
  }

  ngAfterViewInit(): void {
    this.dialogo().nativeElement.showModal();
    this.campo().nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this.devolverFoco && this.focoAnterior?.isConnected) this.focoAnterior.focus();
  }

  protected cancelarEdicao(): void {
    this.devolverFoco = true;
    this.cancelar.emit();
  }

  protected enviar(): void {
    if (this.salvando()) return;

    if (this.form.invalid) {
      this.erroVisivel.set(true);
      this.campo().nativeElement.focus();
      return;
    }

    this.devolverFoco = false;
    this.salvar.emit(this.form.getRawValue().nome.trim());
  }
}
