import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

/** Tempo que a simulação leva para "processar" o material, igual ao do protótipo. */
const TEMPO_SIMULADO_MS = 3500;

/**
 * SIMULAÇÃO: nenhuma chamada HTTP é feita; o arquivo não sai do navegador.
 * TODO: substituir pela chamada à API de envio de material quando o backend existir.
 */
@Injectable({ providedIn: 'root' })
export class UploadService {
  enviar(disciplinaId: string, topicoId: string, arquivo: File): Observable<void> {
    return timer(TEMPO_SIMULADO_MS).pipe(map(() => undefined));
  }
}
