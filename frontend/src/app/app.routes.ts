import { Routes } from '@angular/router';
import { CadastroPage } from './features/auth/pages/cadastro-page/cadastro-page';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { DisciplinasPage } from './features/disciplinas/pages/disciplinas-page/disciplinas-page';
import { TopicosPage } from './features/disciplinas/pages/topicos-page/topicos-page';
import { EnviarMaterialPage } from './features/upload/pages/enviar-material-page/enviar-material-page';
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
      { path: 'disciplinas/:id', component: TopicosPage, title: 'Tópicos | Mnemos' },
      {
        path: 'disciplinas/:id/topicos/:topicoId',
        component: EnviarMaterialPage,
        title: 'Enviar material | Mnemos',
      },
    ],
  },
];
