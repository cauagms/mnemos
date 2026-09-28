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
import { Topico } from '../../services/topicos.service';

export type NovoTopico = Pick<Topico, 'nome' | 'formato'>;

/**
 * Modal de criar (sem `topico`) ou editar (com `topico`) um tópico: nome e formato de estudo
 * (Flashcards ou Quiz).
 */
@Component({
  selector: 'app-topico-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './topico-dialog.html',
  styleUrls: ['../dialogo.scss', './topico-dialog.scss'],
})
export class TopicoDialog implements OnInit, AfterViewInit, OnDestroy {
  private readonly focoAnterior = inject(DOCUMENT).activeElement as HTMLElement | null;
  // Só devolve o foco ao cancelar: depois de salvar, o botão que abriu o modal ficaria destacado.
  private devolverFoco = true;

  readonly topico = input<Topico | null>(null);
  readonly salvando = input(false);
  readonly salvar = output<NovoTopico>();
  readonly cancelar = output<void>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.pattern(/\S/)]],
    formato: ['flashcards' as Topico['formato']],
  });
  protected readonly erroVisivel = signal(false);

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  private readonly campo = viewChild.required<ElementRef<HTMLInputElement>>('campo');

  ngOnInit(): void {
    const topico = this.topico();
    if (topico) this.form.setValue({ nome: topico.nome, formato: topico.formato });
  }

  /** Ao editar, trocar o formato merece um aviso: os cards já criados continuam como estão. */
  protected formatoMudou(): boolean {
    const topico = this.topico();
    return !!topico && this.form.controls.formato.value !== topico.formato;
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

    const { nome, formato } = this.form.getRawValue();
    this.devolverFoco = false;
    this.salvar.emit({ nome: nome.trim(), formato });
  }
}
