import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}

const ATRASO_SIMULADO_MS = 1500;

/**
 * SIMULAÇÃO: nenhuma chamada HTTP é feita.
 * TODO: substituir pelas chamadas à API de autenticação (FastAPI + JWT) quando o backend existir.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  login(_dados: DadosLogin): Observable<void> {
    return of(undefined).pipe(delay(ATRASO_SIMULADO_MS));
  }

  cadastrar(_dados: DadosCadastro): Observable<void> {
    return of(undefined).pipe(delay(ATRASO_SIMULADO_MS));
  }
}
