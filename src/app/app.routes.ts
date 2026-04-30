import { Routes } from '@angular/router';
import { authGuard } from './core/auth/services/auth.service';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NewsDashboardComponent } from './features/dashboard/news-dashboard/news-dashboard.component';
import { VideosDashboardComponent } from './features/dashboard/videos-dashboard/videos-dashboard.component';
import { PersonalitiesDashboardComponent } from './features/dashboard/personalities-dashboard/personalities-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
    title: 'Login',
    data: {
      breadCrumb: false,
    },
  },
  {
    path: 'resources',
    data: { breadCrumb: 'Recursos' },
    title: 'Recursos',
    loadComponent: () =>
      import('./pages/resources/resources.component').then(
        (m) => m.ResourcesComponent,
      ),
  },
  {
    path: 'personalities',
    data: { breadCrumb: 'Personalidades' },
    title: 'Personalidades',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/personalities/personalities.component').then(
            (m) => m.PersonalitiesComponent,
          ),
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('./pages/personalities/personalities-detail.component').then(
            (m) => m.PersonalitiesDetailComponent,
          ),
        data: { breadCrumb: 'Detalhe' },
      },
      {
        path: 'create',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/news/news-form/news-form.component').then(
            (m) => m.NewsFormComponent,
          ),
        data: {
          breadCrumb: 'Criar Personalidade',
        },
      },
    ],
  },
  {
    path: 'games',
    data: {
      breadCrumb: 'Jogos',
    },
    title: 'Jogos',
    children: [
      {
        data: { breadCrumb: 'Jogos' },
        path: '',
        loadComponent: () =>
          import('./pages/games/games.component').then((m) => m.GamesComponent),
      },
      {
        data: { breadCrumb: 'Quiz' },
        path: 'quiz',
        title: 'Quiz',
        loadComponent: () =>
          import('./pages/games/quiz/quiz.component').then(
            (m) => m.QuizComponent,
          ),
      },
      {
        data: { breadCrumb: 'Jogo da Memória' },
        path: 'puzzles',
        loadComponent: () =>
          import('./pages/games/puzzles/puzzles.component').then(
            (m) => m.PuzzlesComponent,
          ),
      },
      {
        data: { breadCrumb: 'Desafio Lógico' },
        path: 'logic-challenge',
        loadComponent: () =>
          import('./pages/games/logic-challenge/logic-challenge.component').then(
            (m) => m.LogicChallengeComponent,
          ),
      },
      {
        data: { breadCrumb: 'Caça Palavras' },
        path: 'word-search',
        loadComponent: () =>
          import('./pages/games/word-search/word-search.component').then(
            (m) => m.WordSearchComponent,
          ),
      },
      {
        data: { breadCrumb: 'Tabela Verdade' },
        path: 'truth-table',
        loadComponent: () =>
          import('./pages/games/truth-table/truth-table.component').then(
            (m) => m.TruthTableComponent,
          ),
      },
      {
        data: { breadCrumb: 'Quiz de Matemática' },
        path: 'math-quiz',
        loadComponent: () =>
          import('./pages/games/math-quiz/math-quiz.component').then(
            (m) => m.MathQuizComponent,
          ),
      },
      {
        data: { breadCrumb: 'Quiz de História' },
        path: 'history-quiz',
        loadComponent: () =>
          import('./pages/games/history-quiz/history-quiz.component').then(
            (m) => m.HistoryQuizComponent,
          ),
      },
      {
        data: { breadCrumb: 'Puzzle de Linux' },
        path: 'linux-puzzle',
        loadComponent: () =>
          import('./pages/games/linux-puzzle/linux-puzzle.component').then(
            (m) => m.LinuxPuzzleComponent,
          ),
      },
      {
        data: { breadCrumb: 'Computing Dungeons' },
        path: 'computing-dungeons',
        title: 'Computing Dungeons',
        loadComponent: () =>
          import('./pages/games/computing-dungeons/computing-dungeons.component').then(
            (m) => m.ComputingDungeonsComponent,
          ),
      },
      {
        data: { breadCrumb: 'MuseuDle' },
        path: 'museudle',
        title: 'MuseuDle',
        loadComponent: () =>
          import('./pages/games/museudle/museudle.component').then(
            (m) => m.MuseudleComponent,
          ),
      },
    ],
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Home',
    data: {
      breadCrumb: 'Home',
    },
  },
  {
    path: 'news',
    title: 'Noticias',
    data: {
      breadCrumb: 'Notícias',
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/news/news.component').then((m) => m.NewsComponent),
      },
      {
        path: 'create',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/news/news-form/news-form.component').then(
            (m) => m.NewsFormComponent,
          ),
        data: {
          breadCrumb: 'Criar Notícia',
        },
      },
      {
        path: 'edit/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/news/news-form/news-form.component').then(
            (m) => m.NewsFormComponent,
          ),
        data: {
          breadCrumb: 'Editar Notícia',
        },
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('./pages/news/news-detail.component').then(
            (m) => m.NewsDetailComponent,
          ),
        data: {
          breadCrumb: 'Detalhe da Notícia',
        },
      },
    ],
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'Sobre nós',
    data: {
      breadCrumb: 'Sobre',
    },
  },
  {
    path: 'norms',
    loadComponent: () =>
      import('./pages/norms/norms.component').then((m) => m.NormsComponent),
    title: 'Normas',
    data: {
      breadCrumb: 'Normas',
    },
  },
  {
    path: 'visita-virtual',
    loadComponent: () =>
      import('./pages/virtual-tour/virtual-tour.component').then(
        (m) => m.VirtualTourComponent,
      ),
    title: 'Visita Virtual',
    data: {
      breadCrumb: 'Visita Virtual',
    },
  },
  {
    path: 'donations',
    loadComponent: () =>
      import('./pages/donations/donations.component').then(
        (m) => m.DonationsComponent,
      ),
    title: 'Doações',
    data: {
      breadCrumb: 'Donations',
    },
  },
  {
    path: 'accessibility',
    loadComponent: () =>
      import('./pages/accessibility/accessibility.component').then(
        (m) => m.AccessibilityComponent,
      ),
    title: 'accessibility',
    data: {
      breadCrumb: 'Acessibilidade',
    },
  },
  {
    path: 'magazine',
    loadComponent: () =>
      import('./pages/magazine/magazine.component').then(
        (m) => m.MagazineComponent,
      ),
    title: 'Revista',
  },
  {
    path: 'videos',
    title: 'Vídeos',
    data: {
      breadCrumb: 'Vídeos',
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/videos/videos.component').then(
            (m) => m.VideosComponent,
          ),
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('./pages/videos/video-detail/video-detail.component').then(
            (m) => m.VideoDetailComponent,
          ),
        data: {
          breadCrumb: 'Detalhe do vídeo',
        },
      },
      {
        path: 'create',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/videos/video-form/video-form.component').then(
            (m) => m.VideoFormComponent,
          ),
        data: {
          breadCrumb: 'Criar publicação',
        },
      },
      {
        path: 'edit/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/videos/video-form/video-form.component').then(
            (m) => m.VideoFormComponent,
          ),
        data: {
          breadCrumb: 'Editar publicação',
        },
      },
    ],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: NewsDashboardComponent,
      },
      {
        path: 'news',
        component: NewsDashboardComponent,
      },
      {
        path: 'videos',
        component: VideosDashboardComponent,
      },
      {
        path: 'personalities',
        component: PersonalitiesDashboardComponent,
      },
    ],
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('./pages/statistics/statistics.component').then(
        (m) => m.StatisticsComponent,
      ),
    title: 'Estatísticas',
    data: {
      breadCrumb: 'Estatísticas',
    },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
    title: 'Página Não Encontrada',
    data: {
      breadCrumb: 'Página Não Encontrada',
    },
  },
];
