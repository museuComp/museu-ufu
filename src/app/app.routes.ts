import { Routes } from '@angular/router';
import { authGuard } from './core/auth/services/auth.service';

const childrenRoutes: Routes = [
  {path:'home', redirectTo:'', pathMatch:'full'},
  
  { path: '',
    title: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },

  { path: 'login',
    title: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent)
  },

  { path: 'about',
    title: 'about',
    data: { breadCrumb: 'about' },
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent)
  },

  { path: 'norms',
    title: 'norms',
    data: { breadCrumb: 'norms' },
    loadComponent: () => import('./pages/norms/norms.component').then((m) => m.NormsComponent)
  },

  { path: 'resources',
    title: 'resources',
    data: { breadCrumb: 'resources' },
    loadComponent: () => import('./pages/resources/resources.component').then((m) => m.ResourcesComponent)
  },

  { path: 'personalities',
    title: 'personalities',
    data: { breadCrumb: 'personalities' },
    children: [
      { path: '',
        loadComponent: () => import('./pages/personalities/personalities.component').then((m) => m.PersonalitiesComponent)
      },
      { path: 'detail/:id',
        data: { breadCrumb: 'detail' },
        loadComponent: () => import('./pages/personalities/personalities-detail.component').then((m) => m.PersonalitiesDetailComponent)
      },
      { path: 'create',
        data: { breadCrumb: 'create',},
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/personalities/personalities-form/personalities-form.component').then(
            (m) => m.PersonalitiesFormComponent,
          )
      }
    ],
  },

  { path: 'games',
    title: 'games.title',
    data: { breadCrumb: 'games.title' },
    children: [
      { path: '',
        loadComponent: () => import('./pages/games/games.component').then((m) => m.GamesComponent)
      },
      { path: 'quiz',
        data: { breadCrumb: 'games.quiz' },
        loadComponent: () => import('./pages/games/quiz/quiz.component').then((m) => m.QuizComponent)
      },
      { path: 'puzzles',
        data: { breadCrumb: 'games.memorygame' },
        loadComponent: () => import('./pages/games/puzzles/puzzles.component').then((m) => m.PuzzlesComponent)
      },
      { path: 'logic-challenge',
        data: { breadCrumb: 'games.logic' },
        loadComponent: () => import('./pages/games/logic-challenge/logic-challenge.component').then((m) => m.LogicChallengeComponent)
      },
      { path: 'word-search',
        data: { breadCrumb: 'games.wordsearch' },
        loadComponent: () => import('./pages/games/word-search/word-search.component').then((m) => m.WordSearchComponent)
      },
      { path: 'truth-table',
        data: { breadCrumb: 'games.truthtable' },
        loadComponent: () => import('./pages/games/truth-table/truth-table.component').then((m) => m.TruthTableComponent)
      },
      { path: 'math-quiz',
        data: { breadCrumb: 'games.mathquiz' },
        loadComponent: () => import('./pages/games/math-quiz/math-quiz.component').then((m) => m.MathQuizComponent)
      },
      { path: 'history-quiz',
        data: { breadCrumb: 'games.histquiz' },
        loadComponent: () => import('./pages/games/history-quiz/history-quiz.component').then((m) => m.HistoryQuizComponent)
      },
      { path: 'linux-puzzle',
        data: { breadCrumb: 'games.linux' },
        loadComponent: () => import('./pages/games/linux-puzzle/linux-puzzle.component').then((m) => m.LinuxPuzzleComponent)
      },
      { path: 'computing-dungeons',
        data: { breadCrumb: 'games.cdungeons' },
        loadComponent: () => import('./pages/games/computing-dungeons/computing-dungeons.component').then((m) => m.ComputingDungeonsComponent)
      },
      { path: 'museudle',
        data: { breadCrumb: 'games.museudle' },
        loadComponent: () => import('./pages/games/museudle/museudle.component').then((m) => m.MuseudleComponent)
      },
      {
        path: 'edit/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/personalities/personalities-form/personalities-form.component').then(
            (m) => m.PersonalitiesFormComponent,
          ),
        data: {
          breadCrumb: 'Editar Personalidade',
        },
      },
    ],
  },

  { path: 'news',
    title: 'news',
    data: { breadCrumb: 'news' },
    children: [
      { path: '',
        loadComponent: () => import('./pages/news/news.component').then((m) => m.NewsComponent)
      },
      { path: 'create',
        data: { breadCrumb: 'create' },
        canActivate: [authGuard],
        loadComponent: () => import('./pages/news/news-form/news-form.component').then((m) => m.NewsFormComponent)
      },
      { path: 'edit/:id',
        data: { breadCrumb: 'edit' },
        canActivate: [authGuard],
        loadComponent: () => import('./pages/news/news-form/news-form.component').then((m) => m.NewsFormComponent)
      },
      { path: 'detail/:id',
        data: { breadCrumb: 'detail' },
        loadComponent: () => import('./pages/news/news-detail.component').then((m) => m.NewsDetailComponent)
      },
    ],
  },

  { path: 'tour',
    title: 'tour',
    data: { breadCrumb: 'tour' },
    loadComponent: () => import('./pages/virtual-tour/virtual-tour.component').then((m) => m.VirtualTourComponent)
  },

  { path: 'donations',
    title: 'donations',
    data: { breadCrumb: 'donations' },
    loadComponent: () => import('./pages/donations/donations.component').then((m) => m.DonationsComponent)
  },

  { path: 'accessibility',
    title: 'accessibility',
    data: { breadCrumb: 'accessibility' },
    loadComponent: () => import('./pages/accessibility/accessibility.component').then((m) => m.AccessibilityComponent)
  },

  { path: 'magazine',
    title: 'magazine',
    data: { breadCrumb: 'magazine' },
    loadComponent: () => import('./pages/magazine/magazine.component').then((m) => m.MagazineComponent)
  },

  { path: 'statistics',
    title: 'statistics',
    data: { breadCrumb: 'statistics' },
    loadComponent: () => import('./pages/statistics/statistics.component').then((m) => m.StatisticsComponent)
  },

  { path: 'videos',
    title: 'videos',
    data: { breadCrumb: 'videos' },
    children: [
      { path: '',
        loadComponent: () => import('./pages/videos/videos.component').then((m) => m.VideosComponent)
      },
      { path: 'detail/:id',
        data: { breadCrumb: 'detail' },
        loadComponent: () => import('./pages/videos/video-detail/video-detail.component').then((m) => m.VideoDetailComponent)
      },
      { path: 'create',
        data: { breadCrumb: 'create' },
        canActivate: [authGuard],
        loadComponent: () => import('./pages/videos/video-form/video-form.component').then((m) => m.VideoFormComponent)
      },
      { path: 'edit/:id',
        data: { breadCrumb: 'edit' },
        canActivate: [authGuard],
        loadComponent: () => import('./pages/videos/video-form/video-form.component').then((m) => m.VideoFormComponent)
      }
    ],
  },

  { path: 'dashboard',
    title: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    children: [
      { path: '',
        loadComponent: () => import('./features/dashboard/news-dashboard/news-dashboard.component').then((m) => m.NewsDashboardComponent),
      },
      { path: 'news',
        loadComponent: () => import('./features/dashboard/news-dashboard/news-dashboard.component').then((m) => m.NewsDashboardComponent),
      },
      { path: 'videos',
        loadComponent: () => import('./features/dashboard/videos-dashboard/videos-dashboard.component').then((m) => m.VideosDashboardComponent),
      },
      { path: 'personalities',
        loadComponent: () => import('./features/dashboard/personalities-dashboard/personalities-dashboard.component').then((m) => m.PersonalitiesDashboardComponent),
      },
    ],
  },

  { path: '**',
    title: 'notfound',
    data: { breadCrumb: 'notfound' },
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent)
  },
];

export const routes: Routes = [
  { path:'', redirectTo:'pt-br', pathMatch:'full' },
  {path:'login', redirectTo:'pt-br/login', pathMatch:'full'},
  {
    path: ':lang',
    children: childrenRoutes
  }
];