# Guia de Contribuição e Boas Práticas

Bem-vindo(a) ao **Museu Virtual da FACOM/UFU**! Este guia é o manual prático para você contribuir
mantendo a **consistência técnica e estética** do projeto. Leia o
[ARCHITECTURE.md](./ARCHITECTURE.md) antes de escrever a primeira linha — as decisões abaixo
derivam de padrões que já existem no código.

---

## Antes de começar

1. Garanta o ambiente rodando (ver [QUICKSTART.md](./QUICKSTART.md)): `npm install` e `ng serve`.
2. Crie uma branch a partir da `main`:
   ```bash
   git checkout -b feat/nome-curto-da-feature
   ```
3. Use prefixos de branch/commit claros: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`.
4. Mantenha os PRs **pequenos e temáticos** — uma feature ou correção por PR.

### Convenção de commits (recomendada)

```
feat: adiciona card de exposição digital de disquetes
fix: corrige logout ao receber 401 no dashboard
docs: atualiza guia de arquitetura
```

---

## 1. Como criar uma nova funcionalidade (feature)

Uma "feature" nova geralmente significa **uma nova página/rota**. O fluxo canônico:

### Passo 1 — Gere o componente standalone

Decida onde ele mora (ver [ARCHITECTURE.md](./ARCHITECTURE.md)):
- Jornada do usuário / área logada → `features/`
- Página de conteúdo do museu → `pages/`

```bash
ng g c pages/minha-feature      # SCSS + sem spec, conforme padrão do angular.json
```

### Passo 2 — Registre a rota com lazy loading

Em `src/app/app.routes.ts`, siga **exatamente** o padrão existente (`loadComponent`, `title`,
`data.breadCrumb`):

```ts
{
  path: 'minha-feature',
  title: 'Minha Feature',
  data: { breadCrumb: 'Minha Feature' },
  loadComponent: () =>
    import('./pages/minha-feature/minha-feature.component').then(
      (m) => m.MinhaFeatureComponent,
    ),
},
```

- `title` alimenta a `CustomPageTitleStrategy` (`core/strategy/title.strategy.ts`).
- `data.breadCrumb` alimenta o `breadcrumb.component` do `shared/`.
- Rotas de **criação/edição** devem ser protegidas: adicione `canActivate: [authGuard]`
  (importado de `./core/auth/services/auth.service`), como já ocorre em `news/create` e
  `videos/edit/:id`.

### Passo 3 — Consuma dados pelo serviço, não direto no componente

Se a feature lê/escreve conteúdo, use (ou crie) um serviço em `core/` que retorne `Observable`,
e consuma no template com `async` pipe. Modelo real (`NewsComponent`):

```ts
export class MinhaFeatureComponent implements OnInit {
  private service = inject(FirestoreNewsService); // injeção por inject(), não construtor
  items$!: Observable<NewsPost[]>;

  ngOnInit(): void {
    this.items$ = this.service.getNews();
  }
}
```

```html
<article *ngFor="let item of items$ | async">{{ item.summary.title }}</article>
```

---

## 2. Como criar novos componentes respeitando o padrão estético

### Regras técnicas

- **Sempre standalone.** Declare `standalone: true` e liste os `imports` do próprio componente
  (`CommonModule`, `RouterModule`, componentes de `shared/`, módulos do Angular Material…).
- **Estilo em SCSS** (padrão dos schematics). Evite CSS solto — há CSS legado em algumas páginas,
  mas código novo usa SCSS.
- **Injeção com `inject()`** em vez de parâmetros de construtor, seguindo `AuthService`,
  `ResourcesComponent`, `NewsComponent`.
- **Reutilize antes de criar.** Antes de escrever um input/botão/modal, confira `shared/components/`:
  já existem `input`, `select`, `checkbox`, `radio`, `switch`, `textarea`, `multi-select`,
  `date-time-picker`, `paginator`, `table`, `tabs`, `dialog-confirm`, `alert`, `loading`,
  `content-section`, `item-info`, `magic-button`, `video-player`, entre outros.
- **Mensagens ao usuário** passam pelo `AlertService` (`shared/components/alert`) — é o mesmo canal
  usado pelo interceptor global. Não crie toasts paralelos.
- **Diretivas e pipes** têm barrel export (`index.ts`); importe pela pasta.

### Regras estéticas (identidade visual do museu)

- **Gov.br Design System em primeiro lugar.** O projeto carrega o `@govbr-ds/core` globalmente.
  Prefira classes e componentes do Gov.br DS para manter aderência à identidade e à
  **acessibilidade** institucional. Complemente com Angular Material e Bootstrap quando necessário.
- **Ícones:** use **Font Awesome 6** (ex.: `fa-home`, `fa-chart-bar`) para navegação, coerente com
  `list-menu.ts`, e `mat-icon` onde já houver Angular Material.
- **Imagens e logos:** referencie a partir de `public/` (ex.: `public/logos/museu-computacao-azul.png`,
  `public/itens/...`). Não duplique assets.
- **Layout consistente:** reutilize `content-section`, `header`, `footer` e `breadcrumb` para que a
  página nova pareça parte do museu, não uma tela isolada.
- **Responsividade e acessibilidade:** textos alternativos em imagens, contraste adequado, foco
  navegável por teclado. Existe uma página/serviço de acessibilidade (`pages/accessibility`,
  `services/accessibility.service.ts`) — respeite as preferências que ela expõe.

---

## 3. Expandir a Linha do Tempo Interativa

A Linha do Tempo apresenta os marcos cronológicos da FACOM e da computação (conteúdo natural da
página **`about`**/história).

**Como adicionar um novo marco:**

1. Localize a estrutura de dados da linha do tempo no componente responsável
   (`pages/about/about.component.ts` e seu template).
2. Adicione o novo evento seguindo o **modelo de dado já existente** (tipicamente
   `{ ano/data, título, descrição, imagem }`). **Não** hard-code marcos direto no HTML: acrescente
   ao array de dados e deixe o template iterar com `*ngFor`, preservando a ordenação cronológica.
3. Use imagens de `public/images/` (ex.: `eniac.png`, `transitor.png`, `internet.png`) ou adicione
   novas em `public/images/` com nomes descritivos em minúsculas.
4. Mantenha descrições curtas e factuais; se o marco tiver conteúdo aprofundado, crie um item de
   Notícia/Personalidade no Firestore e **linke** a partir do marco.

> **Boa prática:** trate a linha do tempo como **dado**, não como marcação. Isso mantém a expansão
> trivial (adicionar um objeto) e abre caminho para, no futuro, carregar os marcos do Firestore.

---

## 4. Expandir os cards de Exposição Digital

A Exposição Digital mostra o acervo por meio de **cards** (imagem + título + descrição). As
thumbnails do acervo estão em **`public/itens/`** (ex.: `disquetes.jpg`, `hd.jpg`,
`teclado_ibm_thumb.jpg`, `maquina_escrever_thumb.jpg`).

**Como adicionar um novo item de acervo:**

1. Coloque a imagem em `public/itens/` (thumbnail) — mantenha o padrão de nome
   (`nome_do_item_thumb.jpg`).
2. Adicione o item à fonte de dados da exposição:
   - Se for conteúdo **estático**, siga o padrão de _mock_ do projeto (ex.: `posters.mock.ts`,
     `magazine.mock.ts`) — um array tipado de objetos.
   - Se for conteúdo **dinâmico/editável**, cadastre via **Firestore** (coleção `news`, com a
     categoria apropriada) usando `FirestoreNewsService.addNews(...)`, e a página o exibirá.
3. Renderize com o **card reutilizável** (Angular Material `MatCard` + `content-section`), seguindo
   `ResourcesComponent`, que já agrega personalidades, vídeos, revistas e pôsteres.
4. Se o item tiver muitos registros, use o `paginator` do `shared/` em vez de listar tudo.

> **Padrão a seguir (`ResourcesComponent`):** o componente injeta os serviços, expõe `Observable`s
> no `ngOnInit` e o template consome com `async` — replique isso para novas seções do acervo.

---

## 5. Criar / expandir Jogos Educativos

Os jogos vivem em **`pages/games/`**, cada um como componente standalone com rota própria em
`app.routes.ts` (ver tabela em [ARCHITECTURE.md](./ARCHITECTURE.md)).

### Adicionar um jogo novo

1. Gere o componente:
   ```bash
   ng g c pages/games/meu-jogo
   ```
2. Registre a rota como **filha de `games`**, seguindo o padrão (com `breadCrumb`):
   ```ts
   {
     path: 'meu-jogo',
     title: 'Meu Jogo',
     data: { breadCrumb: 'Meu Jogo' },
     loadComponent: () =>
       import('./pages/games/meu-jogo/meu-jogo.component').then((m) => m.MeuJogoComponent),
   },
   ```
3. Adicione o jogo ao **hub** (`GamesComponent`) para que fique visível/navegável na página `/games`.
4. Se houver lógica de estado (grid, timer, pontuação), **isole em um serviço** no padrão de
   `pages/games/service/game.service.ts`, que usa `BehaviorSubject` para tempo e itens encontrados.
   Não misture regra de jogo pesada dentro do template.

### Expandir Quizzes (perguntas e respostas)

Os quizzes (`quiz`, `math-quiz`, `history-quiz`, …) são orientados a **dados de perguntas**.
Para adicionar perguntas:

1. Localize o array de perguntas do quiz correspondente no componente.
2. Acrescente novos objetos seguindo o formato existente (enunciado, alternativas, resposta
   correta). **Não** duplique a lógica de correção — adicione apenas dados.
3. Se as perguntas puderem crescer muito, extraia-as para um `*.mock.ts` dedicado (como
   `posters.mock.ts` / `magazine.mock.ts`) e importe no componente.

### Expandir o Jogo da Memória (`PuzzlesComponent`)

O jogo da memória monta pares a partir de um array de imagens:

1. Em `pages/games/puzzles/puzzles.component.ts`, adicione novas imagens ao array `images`
   (dentro de `startNewGame()`), usando caminhos de `public/images/` — ex.:
   `'public/images/ada_lovelace.png'`.
2. O componente **cria automaticamente os pares** e embaralha; você só precisa fornecer imagens.
3. Prefira imagens temáticas do museu (personalidades e marcos) para reforçar o valor educativo.
4. Ao adicionar muitas cartas, valide o layout do grid e o desempenho do timer.

---

## 6. Boas práticas de Clean Code (Angular)

Diretrizes alinhadas ao que já é praticado no repositório:

**Componentes**
- Um componente = uma responsabilidade. Se ele busca dados **e** renderiza layout complexo **e**
  controla um jogo, provavelmente precisa de um serviço.
- Prefira **standalone + `OnPush`**-friendly (o projeto usa `eventCoalescing` e Signals no core).
  Onde fizer sentido, use **Signals/`computed`** como em `AuthService`.
- Use **`async` pipe** e evite `subscribe()` manual em componentes; quando inevitável, faça
  `unsubscribe` (ou use `takeUntilDestroyed`).

**Serviços e dados**
- Serviços de dados são `@Injectable({ providedIn: 'root' })` e retornam `Observable`
  (padrão dos `Firestore*Service`).
- Centralize acesso a dados; componentes **não** falam com o Firestore diretamente.
- Regra de negócio e chamadas externas ficam em `core/`; UI genérica em `shared/`.

**HTTP e erros**
- **Não** trate erros HTTP manualmente em cada chamada: o `globalInterceptor` já mapeia status →
  mensagem via `AlertService`. Para silenciar o alerta de uma requisição específica, use o
  parâmetro `hideNotification` (`KEY_HIDE_NOTIFICATION`). Para pular a injeção de token, use
  `noAuth` (`KEY_NO_AUTH`).

**Tipagem**
- Tipar sempre: modelos em `shared/models/` ou junto do serviço (ex.: `NewsPost`, `Credentials`).
- Evite `any`; o projeto tem `strict: false`, mas isso é dívida técnica — código novo deve ser
  fortemente tipado.

**Imports e organização**
- Use os **aliases** (`@core`, `@shared`, `@features`, `@app`) e os **barrels** (`index.ts`).
- Assets sempre de `public/…`; nunca embuta caminhos absolutos de máquina.

**Estilo**
- SCSS por componente; reutilize tokens/estilos do Gov.br DS antes de criar CSS próprio.
- Respeite os budgets de bundle do `angular.json` (aviso em 2MB / erro em 3MB no inicial) — atenção
  ao importar bibliotecas grandes.

**Testes**
- Specs estão desabilitados por padrão nos schematics, mas o projeto possui suíte
  (Karma/Jasmine + Spectator). Para lógica crítica (serviços, guards, jogos), **adicione testes**
  gerando com `--skip-tests=false` e rode `ng test`.

---

## Checklist de Pull Request

- [ ] Branch a partir de `main` com prefixo (`feat/`, `fix/`, `docs/`…).
- [ ] Componentes novos são **standalone** e usam **SCSS**.
- [ ] Rotas novas usam **`loadComponent`**, com `title` e `data.breadCrumb`; rotas de escrita têm
      `canActivate: [authGuard]`.
- [ ] Dados vêm de um **serviço** (`Observable` + `async` pipe), não de acesso direto no componente.
- [ ] Reutilizei componentes de `shared/` em vez de recriar UI.
- [ ] Assets referenciados a partir de `public/`.
- [ ] `ng build` passa sem estourar budgets; `ng test` verde para o que toquei.
- [ ] Sem `console.log` esquecido, sem `any` desnecessário, imports com aliases.
```
