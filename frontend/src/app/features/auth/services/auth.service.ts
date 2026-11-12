
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}

export interface RespostaLogin {
  access_token: string;
  token_type: string;
}

export interface RespostaCadastro {
  id: number;
  nome: string;
  email: string;
}

const API_URL = 'http://127.0.0.1:8000/api/v1';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(dados: DadosLogin): Observable<RespostaLogin> {
    return this.http.post<RespostaLogin>(
      `${API_URL}/auth/login`,
      dados,
    );
  }

  cadastrar(dados: DadosCadastro): Observable<RespostaCadastro> {
    return this.http.post<RespostaCadastro>(
      `${API_URL}/usuarios/`,
      dados,
    );
  }
}
