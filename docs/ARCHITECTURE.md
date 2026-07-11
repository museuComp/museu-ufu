# Arquitetura — Estrutura Técnica e Tecnologias

Este documento descreve **como o Museu Virtual da FACOM/UFU está organizado por dentro**: as
camadas de código, o papel de cada diretório, os padrões recorrentes e a stack tecnológica.

O projeto é uma **SPA Angular 19** com **componentes standalone** (sem `NgModule` na maior parte
do código novo), **roteamento com lazy loading** e **detecção de mudanças baseada em Signals** em
partes centrais (ex.: autenticação). O idioma padrão é `pt-BR` e a moeda `BRL`
(configurados em `app.config.ts`).

---

## Visão geral em camadas

```
src/
├── app/
│   ├── core/         → Serviços globais, interceptors, guards, estratégias (singletons da aplicação)
│   ├── features/     → Funcionalidades de topo: home, login, dashboard, profile, not-found
│   ├── pages/        → Páginas de conteúdo: about, games, news, videos, donations, resources...
│   ├── shared/       → Blocos reutilizáveis: componentes de UI, diretivas, pipes, utils, models
│   ├── app.component.ts   → Componente raiz (shell da aplicação)
│   ├── app.config.ts      → Providers globais (router, http, firebase, locale, dialogs, charts)
│   └── app.routes.ts      → Tabela de rotas (lazy loading via loadComponent / children)
├── core/services/    → Serviços de dados do Firestore (news e videos)  ← ver observação abaixo
└── public/           → Ativos estáticos servidos como /public (imagens, logos, revistas, favicon)
```

> **Observação sobre `core/`:** existem **dois** diretórios `core`:
> - `src/app/core/` — infraestrutura da aplicação (auth, interceptors, estratégias, update).
> - `src/core/services/` — os serviços de acesso ao Firestore (`firestore-news.service.ts`,
>   `firestore-videos.service.ts`). São importados por caminho relativo/absoluto (`core/services/...`).
>
> Ao criar novos serviços de dados, prefira consolidar em uma única localização de `core` para
> reduzir ambiguidade (ver [CONTRIBUTING.md](./CONTRIBUTING.md)).

### Aliases de importação (`tsconfig.json`)

Use os aliases em vez de caminhos relativos longos:

| Alias | Aponta para |
| --- | --- |
| `@app/*` | `src/app/*` |
| `@core/*` | `src/app/core/*` |
| `@features/*` | `src/app/features/*` |
| `@shared/*` | `src/app/shared/*` |
| `@clients/*` | `src/app/clients/*` |

Exemplo real (`app.config.ts`): `import { globalInterceptor } from '@core/interceptors/global-http.interceptor';`

---

## `src/app/core/` — Infraestrutura da aplicação

Contém os **singletons** e a "plumbing" que atravessa toda a aplicação. É código sem UI própria,
consumido por features e pages.

```
core/
├── auth/
│   ├── services/auth.service.ts              → Autenticação com Signals + guards de rota
│   └── interceptors/auth.interceptor.ts      → Injeta Bearer token e trata logout em 401
├── interceptors/
│   └── global-http.interceptor.ts            → Tratamento centralizado de erros HTTP
├── services/menu.service.ts                  → Estado/lógica do menu
├── strategy/title.strategy.ts                → Título das páginas (CustomPageTitleStrategy)
└── update/check-update.service.ts            → Checagem de atualização (service worker / PWA)
```

**Padrões encontrados aqui:**

- **`AuthService` com Signals** (`auth.service.ts`): usa `signal<Credentials | null>()`,
  `computed()` (ex.: `isStudent`, `isPublic`) e expõe `credentials$` via `toObservable`. Persiste
  o login em `localStorage` (`KEY_STORAGE = 'credentials'`) e conversa com a API oficial
  (`https://museu.facom.ufu.br/api/v1/auth`). Também exporta os guards funcionais
  **`authGuard`** e **`authGuardStudent`** usados nas rotas protegidas.

- **Interceptors HTTP funcionais** (padrão `HttpInterceptorFn`):
  - `global-http.interceptor.ts` (`core/interceptors/`) — captura erros com `catchError`, mapeia
    `HttpStatusCode` (0, 400, 401, 403, 404, 413, 415, 429…) para mensagens amigáveis exibidas via
    `AlertService`. Respeita o parâmetro `hideNotification` (`KEY_HIDE_NOTIFICATION`) para silenciar
    o alerta de uma requisição específica.
  - `auth.interceptor.ts` (`core/auth/interceptors/`) — clona a requisição e adiciona
    `Authorization: Bearer <token>` quando o usuário está autenticado; ignora requisições que
    contenham o parâmetro `noAuth` (`KEY_NO_AUTH`) ou cujas URLs incluam `assets`. Em caso de
    resposta `401 Unauthorized`, chama `authService.logout()` automaticamente.

  > ⚠️ **Gap conhecido:** o `authInterceptor` está implementado mas **não está registrado** em
  > `app.config.ts`. O `withInterceptors` atual inclui apenas `[globalInterceptor, loadingInterceptor]`.
  > Isso significa que o token Bearer **não é injetado automaticamente** nas requisições à API.
  > Registrar o interceptor ou investigar se há outro mecanismo de injeção de token é uma ação
  > pendente da equipe.

- **Registro dos interceptors:** feito em `app.config.ts` via
  `provideHttpClient(withInterceptors([globalInterceptor, loadingInterceptor]), withFetch())`.
  (O `loadingInterceptor` vive em `shared/components/loading/interceptors/`.)

---

## `src/app/features/` — Funcionalidades de topo

Áreas funcionais "de primeira classe" da aplicação — normalmente ligadas à jornada do usuário e,
em alguns casos, à área autenticada.

```
features/
├── home/            → Página inicial (HomeComponent)
├── login/           → Autenticação (LoginComponent) + models/mocks de credenciais
├── dashboard/       → Painel administrativo (protegido por authGuard) com sub-views:
│                       news-dashboard, videos-dashboard, personalities-dashboard
├── profile/         → Perfil do usuário e edição (profile-edit)
├── perfis-nav/      → Componente de navegação contextual por perfil
└── not-found/       → Página 404 (rota coringa '**')
```

**Padrões:**

- O **`dashboard`** é a única árvore de rotas que usa `component:` direto (em vez de
  `loadComponent`) e é inteiramente protegida por `canActivate: [authGuard]`, com rotas-filhas
  para gerenciar notícias, vídeos e personalidades.
- `login/models/credentials.model.ts` define `Credentials` e o enum `Role`
  (`ADMIN`, `STUDENT`, `PUBLIC`) que orienta a exibição de menu e o controle de acesso.

### `src/app/perfis-nav/` — Navegação por perfis

Componente standalone localizado fora das pastas `features/` e `pages/`, no nível direto de `app/`.
Atua como um seletor de navegação condicionado ao perfil do usuário autenticado, consumindo
o `Role` exposto pelo `AuthService` para exibir opções de menu contextuais. Trabalha em conjunto
com `shared/components/menu/const/list-menu.ts` (`LIST_MENU_BY_ROLE`) para determinar quais
itens são visíveis para cada perfil.

---

## `src/app/pages/` — Páginas de conteúdo

O grosso do conteúdo público do museu. Cada página é carregada sob demanda (lazy) nas rotas
(`app.routes.ts`). Páginas mais antigas ainda usam `*.module.ts` + `*-routing.module.ts`
(ex.: `about`, `contact`, `news`, `norms`, `thematic`, `games`); as mais novas são standalone.

```
pages/
├── about/           → "Sobre nós" / história (candidata natural à Linha do Tempo)
├── accessibility/   → Recursos de acessibilidade
├── contact/         → Contato
├── donations/       → Doações (+ donation-form)
├── games/           → Hub de jogos educativos (ver abaixo)
├── magazine/        → Revista digital (renderização de PDF via pdfjs-dist) + magazine.mock.ts
├── news/            → Notícias: lista, detalhe, formulário (create/edit protegidos)
├── norms/           → Normas
├── personalities/   → Personalidades: lista + detalhe (compartilham a coleção 'news')
├── resources/       → Recursos: agrega personalidades, vídeos, revistas e pôsteres
├── statistics/      → Estatísticas (gráficos com ng2-charts)
├── thematic/        → Exposições temáticas
├── videos/          → Vídeos: lista, detalhe, formulário
└── virtual-tour/    → Visita virtual 360° (Pannellum)
```

### O hub de Jogos (`pages/games/`)

Todos os jogos são **componentes standalone** carregados via `loadComponent` sob a rota `/games`:

| Rota | Componente | Jogo |
| --- | --- | --- |
| `/games/quiz` | `QuizComponent` | Quiz geral |
| `/games/puzzles` | `PuzzlesComponent` | Jogo da memória (pares de cartas) |
| `/games/logic-challenge` | `LogicChallengeComponent` | Desafio lógico |
| `/games/word-search` | `WordSearchComponent` | Caça-palavras (usa `GameService`) |
| `/games/truth-table` | `TruthTableComponent` | Tabela-verdade |
| `/games/math-quiz` | `MathQuizComponent` | Quiz de matemática |
| `/games/history-quiz` | `HistoryQuizComponent` | Quiz de história |
| `/games/linux-puzzle` | `LinuxPuzzleComponent` | Puzzle de Linux |
| `/games/computing-dungeons` | `ComputingDungeonsComponent` | Computing Dungeons |
| `/games/museudle` | `MuseudleComponent` | MuseuDle |

- **`pages/games/service/game.service.ts`** — motor do caça-palavras: gera um grid 15×15,
  posiciona palavras (`TYPESCRIPT`, `ANGULAR`, `ENIAC`, `ZUSE`, `TRANSISTOR`…) em várias direções,
  controla timer e verificação de acerto via `BehaviorSubject`.
- **`PuzzlesComponent`** — jogo da memória: monta pares a partir de imagens em `public/images/`
  (personalidades e marcos históricos), embaralha, controla flips, matches e timer.

---

## Mapa de Rotas

Todas as rotas são definidas em `src/app/app.routes.ts`. O mecanismo de título e breadcrumb
funciona assim:

- **`title`** — processado pela `CustomPageTitleStrategy` (`core/strategy/title.strategy.ts`),
  que formata o título da aba do navegador.
- **`data.breadCrumb`** — consumido pelo `BreadcrumbComponent` (`shared/components/breadcrump/`)
  para montar a trilha de navegação hierárquica. Quando `breadCrumb: false`, o breadcrumb não é
  exibido (ex.: página de login).
- **Rota coringa `**`** — captura qualquer URL não reconhecida e exibe a página 404
  (`NotFoundComponent`). Deve sempre ser a última rota da lista.

### Rotas públicas

| Rota | Título | Descrição |
| --- | --- | --- |
| `/` | — | Redireciona para `/home` |
| `/home` | Home | Página inicial |
| `/about` | Sobre nós | História e linha do tempo da FACOM |
| `/news` | Notícias | Listagem de notícias |
| `/news/detail/:id` | — | Detalhe de uma notícia |
| `/personalities` | Personalidades | Listagem de personalidades |
| `/personalities/detail/:id` | — | Detalhe de uma personalidade |
| `/videos` | Vídeos | Galeria de vídeos |
| `/videos/detail/:id` | — | Detalhe de um vídeo |
| `/games` | Jogos | Hub de jogos educativos |
| `/games/*` | (ver tabela acima) | 10 jogos individuais |
| `/visita-virtual` | Visita Virtual | Tour 360° com Pannellum |
| `/resources` | Recursos | Agrega personalidades, vídeos, revistas e pôsteres |
| `/magazine` | Revista | Revista digital em PDF |
| `/statistics` | Estatísticas | Gráficos do acervo (ng2-charts) |
| `/donations` | Doações | Formulário de doação ao acervo |
| `/norms` | Normas | Normas do museu |
| `/accessibility` | Acessibilidade | Configurações de acessibilidade |
| `/login` | Login | Autenticação (breadCrumb desativado) |
| `/**` | Página Não Encontrada | Rota coringa (404) |

### Rotas protegidas (`canActivate: [authGuard]`)

| Rota | Descrição |
| --- | --- |
| `/news/create` | Criar nova notícia |
| `/news/edit/:id` | Editar notícia existente |
| `/videos/create` | Criar nova publicação de vídeo |
| `/videos/edit/:id` | Editar vídeo existente |
| `/personalities/create` | Criar nova personalidade |
| `/dashboard` | Painel administrativo (raiz) |
| `/dashboard/news` | Gerenciar notícias via dashboard |
| `/dashboard/videos` | Gerenciar vídeos via dashboard |
| `/dashboard/personalities` | Gerenciar personalidades via dashboard |

---

## `src/app/shared/` — Blocos reutilizáveis

Biblioteca interna de UI e utilitários, consumida por features e pages. Componentes standalone,
sem estado de negócio.

```
shared/
├── components/   → alert, breadcrumb, checkbox, collapse-item, content-section, cookie-bar,
│                   date-time-picker, dialog-confirm, footer, header, input, item-info, loading,
│                   magic-button, menu, multi-select, paginator, radio, select, switch, table,
│                   tabs, textarea, video-player, barra-brasil
├── directives/   → button, feedback (cada uma com index.ts de barrel export)
├── pipes/        → get-icon-by-state, has-error, option-label, title-collapse-* (barrel em index.ts)
├── services/     → storage (local-storage, session-storage sobre storage-base)
├── animations/   → fade-in, fade-in-out
├── models/       → pagination.model, radio.model, select.model
├── types/        → controls-of.type, size.type
└── utils/        → get-icon-by-state, minutes-to-ms-converter, option-label, string.utils
```

**Padrões:**

- **Barrel exports (`index.ts`)** em diretivas e pipes — importe a partir da pasta, não do arquivo.
- **Componentes de UI reutilizáveis** que encapsulam formulários, feedback e layout (ex.:
  `alert` + `AlertService` é o canal de mensagens usado pelo interceptor global).
- **`loading`** traz componente + `LoadingService` + `loadingInterceptor`, integrando o indicador
  de carregamento ao ciclo HTTP.
- **`menu`** contém `const/list-menu.ts` com os menus por papel (`LIST_MENU_STUDENT`,
  `LIST_MENU_PUBLIC`, mapeados por `Role` em `LIST_MENU_BY_ROLE`).

---

## `src/public/` — Ativos estáticos

Servido como **`/public`** no runtime (configurado em `angular.json` → `assets`). Referencie
sempre por caminho absoluto começando em `public/` (ex.: `PuzzlesComponent` usa
`'public/images/ada_lovelace.png'`).

```
public/
├── banner/      → banners da home
├── carrossel/   → imagens de carrossel
├── favicon/     → ícones e identidade (PWA/manifest)
├── icons/       → ícones diversos (ex.: not-found)
├── images/      → figuras históricas e de jogos (ada_lovelace, eniac, alan_turing, tux…)
├── itens/       → thumbnails do acervo físico (exposição digital)
├── logos/       → logos FACOM, UFU, Gov.br, museu (variações de cor)
└── magazine/    → PDF e páginas em JPG da revista
```

---

## Stack Tecnológica

### Frontend (base)

| Tecnologia | Papel |
| --- | --- |
| **Angular 19.2** | Framework SPA. Componentes standalone, Signals, roteamento com lazy loading. |
| **TypeScript 5.7** | Linguagem. `target`/`module` ES2022, `moduleResolution: bundler`. |
| **SCSS / CSS** | Estilização (SCSS é o padrão dos schematics; há CSS legado em algumas páginas). |
| **RxJS 7.8** | Programação reativa (streams de dados do Firestore, `BehaviorSubject` em jogos). |
| **Zone.js** | Detecção de mudanças (com `eventCoalescing: true`). |

### UI / UX

| Tecnologia | Papel |
| --- | --- |
| **Angular Material + CDK** | Componentes de UI (cards, ícones, dialogs, overlay). Config global de dialog em `app.config.ts`. |
| **Gov.br Design System** (`@govbr-ds/core`, `govbr-ds-angular`) | Padrão visual e de acessibilidade do governo federal (CSS carregado no build). |
| **Font Awesome 6** | Iconografia (ícones do menu, ex.: `fa-home`, `fa-chart-bar`). |
| **Bootstrap 5** | Utilitários de layout complementares. |
| **Pannellum** | Visualizador panorâmico 360° para a **Visita Virtual**. |
| **ng2-charts / Chart.js** | Gráficos na página de **Estatísticas**. |
| **pdfjs-dist** | Renderização da **Revista** em PDF. |
| **ngx-mask** | Máscaras de input em formulários. |
| **ngx-skeleton-loader** | Placeholders de carregamento. |

### Backend / Dados (Firebase)

O museu **não tem um backend próprio de conteúdo**: usa **Firebase Firestore** como banco de
dados em tempo real, integrado via **AngularFire** (`@angular/fire`).

- **Dois projetos Firestore** (configurados em `app.config.ts`):
  - **App padrão** → projeto `museu-ufu-news` — coleção **`news`**, que armazena **tanto notícias
    quanto personalidades** (diferenciadas por `summary.category === 'Personalidades'`).
  - **App `videosApp`** → projeto `museu-comp-ufu` — dados de **vídeos** (injetado via token
    `FIRESTORE_VIDEOS`, com a chave em `enviroment.ts`).

- **Serviços de acesso** (`src/core/services/`):
  - `firestore-news.service.ts` — expõe `NewsPost` e operações CRUD reativas
    (`getNews`, `getPersonalities`, `getNewsById`, `addNews`, `updateNews`, `deleteNews`,
    `getLimitedNews`, `getPreviousNews`/`getNextNews` para navegação). Usa `collectionData`,
    `query`, `where`, `orderBy`, `limit` e ordena por um campo `order`.
  - `firestore-videos.service.ts` — mesma abordagem para a coleção de vídeos.

- **Autenticação:** feita contra a **API oficial do museu** (`museu.facom.ufu.br/api/v1/auth`),
  não pelo Firebase Auth. O token é guardado em `localStorage` e injetado pelo `auth.interceptor`.

### PWA / Build / Deploy

| Tecnologia | Papel |
| --- | --- |
| **@angular/service-worker** (`ngsw-config.json`) | PWA: cache e atualização (`check-update.service.ts`). Ativo só em produção. |
| **angular-cli-ghpages** | Deploy em GitHub Pages (`npm run deploy`), `baseHref: /museu-ufu/`. |
| **sharp** | Processamento/otimização de imagens (dependência de build). |

---

## Fluxo de uma requisição de dados (exemplo: Notícias)

```
NewsComponent.ngOnInit()
   └─ FirestoreNewsService.getNews()          (src/core/services)
        └─ query(newsCollection, where category != 'Personalidades', orderBy category)
             └─ collectionData(...)  →  Observable<NewsPost[]>
                  └─ (erros de rede) → globalInterceptor → AlertService (toast)
   └─ template consome via async pipe (newsList$ | async)
```

Esse padrão — **componente injeta serviço `providedIn: 'root'`, serviço retorna `Observable`,
template consome com `async` pipe** — é o modelo a seguir para novas telas de conteúdo.

---

## Convenções que decorrem da arquitetura

- **Standalone-first:** novos componentes devem ser standalone (`standalone: true` + `imports`),
  como quase todo o `pages/` e `shared/` já é.
- **Lazy loading por rota:** telas de página entram via `loadComponent` em `app.routes.ts`.
- **Rotas protegidas:** qualquer criação/edição usa `canActivate: [authGuard]` (ver `news/create`,
  `videos/edit/:id`, `dashboard`).
- **Aliases sempre:** importe com `@core`, `@shared`, `@features`, `@app`.
- **UI reutilizável mora em `shared/`;** regra de negócio e dados moram em `core/`.

---

## Configurações relevantes do `angular.json`

O arquivo `angular.json` centraliza as opções de build, serve e test do workspace. Os pontos
mais importantes para contribuidores:

### Schematics (padrões de geração de código)

```json
"schematics": {
  "@schematics/angular:component": {
    "style": "scss",      // SCSS em vez de CSS para todos os componentes gerados
    "skipTests": true     // Não gera .spec.ts por padrão
  }
}
```

> Para gerar um componente **com** arquivo de teste: `ng g c nome --skip-tests=false`

### Budgets de tamanho do bundle

| Tipo | Aviso | Erro |
| --- | --- | --- |
| Bundle inicial | 2 MB | 3 MB |
| Chunk individual | 1 MB | 2 MB |

Se o build emitir aviso de tamanho, revise as dependências importadas (preferência por imports
de sub-módulo em vez de import completo de bibliotecas como Angular Material).

### Configurações `development` vs. `production`

| Opção | `development` | `production` |
| --- | --- | --- |
| Output hashing | Desativado | Ativado (`[hash]`) |
| Service Worker | Desativado | Ativado (`ngsw-config.json`) |
| Source maps | Ativados | Desativados |
| Otimização | Desativada | Ativada (minificação, tree-shaking) |
| `baseHref` | `/` | `/` (Nginx) ou `/museu-ufu/` (GitHub Pages) |
