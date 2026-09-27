import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { DisciplinaCard } from '../../components/disciplina-card/disciplina-card';
import { DisciplinaDialog } from '../../components/disciplina-dialog/disciplina-dialog';
import { ExcluirDisciplinaDialog } from '../../components/excluir-disciplina-dialog/excluir-disciplina-dialog';
import { Disciplina, DisciplinasService } from '../../services/disciplinas.service';

type Dialogo =
  | { tipo: 'criar' }
  | { tipo: 'editar'; disciplina: Disciplina }
  | { tipo: 'excluir'; disciplina: Disciplina };

@Component({
  selector: 'app-disciplinas-page',
  imports: [DisciplinaCard, DisciplinaDialog, ExcluirDisciplinaDialog],
  templateUrl: './disciplinas-page.html',
  styleUrl: './disciplinas-page.scss',
})
export class DisciplinasPage {
  private readonly service = inject(DisciplinasService);

  /** `null` enquanto a lista ainda não chegou. */
  protected readonly disciplinas = signal<Disciplina[] | null>(null);
  protected readonly dialogo = signal<Dialogo | null>(null);
  protected readonly salvando = signal(false);

  constructor() {
    this.service
      .listar()
      .pipe(takeUntilDestroyed())
      .subscribe((lista) => this.disciplinas.set(lista));
  }

  protected salvar(nome: string): void {
    const dialogo = this.dialogo();
    if (!dialogo || dialogo.tipo === 'excluir' || this.salvando()) return;

    const operacao =
      dialogo.tipo === 'editar'
        ? this.service.renomear(dialogo.disciplina.id, nome)
        : this.service.criar(nome);

    this.salvando.set(true);
    operacao.pipe(finalize(() => this.salvando.set(false))).subscribe((salva) => {
      this.disciplinas.update((lista) =>
        dialogo.tipo === 'editar'
          ? (lista ?? []).map((d) => (d.id === salva.id ? salva : d))
          : [...(lista ?? []), salva],
      );
      this.dialogo.set(null);
    });
  }

  protected excluir(): void {
    const dialogo = this.dialogo();
    if (dialogo?.tipo !== 'excluir' || this.salvando()) return;

    const { id } = dialogo.disciplina;
    this.salvando.set(true);
    this.service
      .excluir(id)
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe(() => {
        this.disciplinas.update((lista) => (lista ?? []).filter((d) => d.id !== id));
        this.dialogo.set(null);
      });
  }
}
