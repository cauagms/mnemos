import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { DisciplinasService } from '../../../disciplinas/services/disciplinas.service';
import { Topico, TopicosService } from '../../../disciplinas/services/topicos.service';
import { UploadService } from '../../services/upload.service';

const FORMATOS_ACEITOS = /\.(pdf|docx|pptx)$/i;

/** Escolha e envio do material de um tópico (arrastar e soltar ou seletor de arquivos). */
@Component({
  selector: 'app-enviar-material-page',
  imports: [RouterLink],
  templateUrl: './enviar-material-page.html',
  // Reaproveita título e botão da tela de Disciplinas e o link "Voltar" da tela de Tópicos.
  styleUrls: [
    '../../../disciplinas/pages/disciplinas-page/disciplinas-page.scss',
    '../../../disciplinas/pages/topicos-page/topicos-page.scss',
    './enviar-material-page.scss',
  ],
})
export class EnviarMaterialPage {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly uploadService = inject(UploadService);
  private readonly params = inject(ActivatedRoute).snapshot.paramMap;
  protected readonly disciplinaId = this.params.get('id') ?? '';
  private readonly topicoId = this.params.get('topicoId') ?? '';

  /** `null` enquanto os dados ainda não chegaram. */
  protected readonly trilha = signal<{ disciplina: string; topico: Topico } | null>(null);
  protected readonly arquivo = signal<File | null>(null);
  protected readonly erro = signal<string | null>(null);
  protected readonly arrastando = signal(false);
  protected readonly enviando = signal(false);
  /** Envio concluído: mostra onde os cards vão aparecer até o usuário enviar outro material. */
  protected readonly enviado = signal(false);

  private readonly seletor = viewChild.required<ElementRef<HTMLInputElement>>('seletor');

  constructor() {
    forkJoin([
      inject(DisciplinasService).listar(),
      inject(TopicosService).listar(this.disciplinaId),
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([disciplinas, topicos]) => {
        const disciplina = disciplinas.find((d) => d.id === this.disciplinaId);
        const topico = topicos.find((t) => t.id === this.topicoId);
        if (disciplina && topico) {
          this.trilha.set({ disciplina: disciplina.nome, topico });
        } else {
          // A tela de Tópicos cuida de voltar mais um nível se a disciplina também não existir.
          this.router.navigate(['/disciplinas', this.disciplinaId]);
        }
      });
  }

  protected abrirSeletor(): void {
    this.seletor().nativeElement.click();
  }

  protected escolher(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.aceitar(input.files?.[0]);
    // Permite escolher de novo o mesmo arquivo depois de removê-lo.
    input.value = '';
  }

  protected arrastarSobre(evento: DragEvent): void {
    evento.preventDefault();
    if (!this.enviando() && !this.enviado()) this.arrastando.set(true);
  }

  protected soltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastando.set(false);
    this.aceitar(evento.dataTransfer?.files[0]);
  }

  protected enviar(): void {
    const arquivo = this.arquivo();
    if (!arquivo || this.enviando()) return;

    this.enviando.set(true);
    this.uploadService
      .enviar(this.disciplinaId, this.topicoId, arquivo)
      .pipe(
        finalize(() => this.enviando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        complete: () => {
          this.arquivo.set(null);
          this.enviado.set(true);
        },
      });
  }

  protected remover(): void {
    this.arquivo.set(null);
    this.erro.set(null);
  }

  protected tamanho(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  }

  private aceitar(arquivo: File | undefined): void {
    if (!arquivo || this.enviando() || this.enviado()) return;
    if (!FORMATOS_ACEITOS.test(arquivo.name)) {
      this.erro.set('Formato não aceito. Envie PDF, DOCX ou PPTX.');
      return;
    }
    this.erro.set(null);
    this.arquivo.set(arquivo);
  }
}
