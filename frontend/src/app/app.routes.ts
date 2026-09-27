import { Routes } from '@angular/router';
import { CadastroPage } from './features/auth/pages/cadastro-page/cadastro-page';
import { LoginPage } from './features/auth/pages/login-page/login-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage, title: 'Entrar | Mnemos' },
  { path: 'cadastro', component: CadastroPage, title: 'Criar conta | Mnemos' },
];
