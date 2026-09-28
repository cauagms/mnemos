import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ExcluirTopicoDialog } from '../../components/excluir-topico-dialog/excluir-topico-dialog';
import { TopicoCard } from '../../components/topico-card/topico-card';
import { NovoTopico, TopicoDialog } from '../../components/topico-dialog/topico-dialog';
import { Disciplina, DisciplinasService } from '../../services/disciplinas.service';
import { Topico, TopicosService } from '../../services/topicos.service';

type Dialogo =
  | { tipo: 'criar' }
  | { tipo: 'editar'; topico: Topico }
  | { tipo: 'excluir'; topico: Topico };

@Component({
  selector: 'app-topicos-page',
  imports: [RouterLink, TopicoCard, TopicoDialog, ExcluirTopicoDialog],
  templateUrl: './topicos-page.html',
  // Reaproveita título, estado vazio, botão e grade da tela de Disciplinas.
  styleUrls: ['../disciplinas-page/disciplinas-page.scss', './topicos-page.scss'],
})
export class TopicosPage {
  private readonly router = inject(Router);
  private readonly topicosService = inject(TopicosService);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  /** `null` enquanto os dados ainda não chegaram. */
  protected readonly disciplina = signal<Disciplina | null>(null);
  protected readonly topicos = signal<Topico[] | null>(null);
  protected readonly dialogo = signal<Dialogo | null>(null);
  protected readonly salvando = signal(false);

  constructor() {
    inject(DisciplinasService)
      .listar()
      .pipe(takeUntilDestroyed())
      .subscribe((lista) => {
        const disciplina = lista.find((d) => d.id === this.id);
        if (disciplina) {
          this.disciplina.set(disciplina);
        } else {
          this.router.navigate(['/disciplinas']);
        }
      });

    this.topicosService
      .listar(this.id)
      .pipe(takeUntilDestroyed())
      .subscribe((lista) => this.topicos.set(lista));
  }

  protected salvar({ nome, formato }: NovoTopico): void {
    const dialogo = this.dialogo();
    if (!dialogo || dialogo.tipo === 'excluir' || this.salvando()) return;

    const operacao =
      dialogo.tipo === 'editar'
        ? this.topicosService.editar(this.id, dialogo.topico.id, nome, formato)
        : this.topicosService.criar(this.id, nome, formato);

    this.salvando.set(true);
    operacao.pipe(finalize(() => this.salvando.set(false))).subscribe((salvo) => {
      this.topicos.update((lista) =>
        dialogo.tipo === 'editar'
          ? (lista ?? []).map((t) => (t.id === salvo.id ? salvo : t))
          : [...(lista ?? []), salvo],
      );
      this.dialogo.set(null);
    });
  }

  protected excluir(): void {
    const dialogo = this.dialogo();
    if (dialogo?.tipo !== 'excluir' || this.salvando()) return;

    const { id } = dialogo.topico;
    this.salvando.set(true);
    this.topicosService
      .excluir(this.id, id)
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe(() => {
        this.topicos.update((lista) => (lista ?? []).filter((t) => t.id !== id));
        this.dialogo.set(null);
      });
  }
}
