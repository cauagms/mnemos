import { Routes } from '@angular/router';
import { CadastroPage } from './features/auth/pages/cadastro-page/cadastro-page';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { DisciplinasPage } from './features/disciplinas/pages/disciplinas-page/disciplinas-page';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage, title: 'Entrar | Mnemos' },
  { path: 'cadastro', component: CadastroPage, title: 'Criar conta | Mnemos' },
  {
    path: '',
    component: Shell,
    children: [
      { path: 'disciplinas', component: DisciplinasPage, title: 'Disciplinas | Mnemos' },
    ],
  },
];
