# Autenticação e Controle de Acesso

Este documento descreve o sistema de autenticação do Museu Virtual: como o login funciona, quais
perfis existem, como os guards protegem as rotas e como o token é gerenciado ao longo da sessão.

---

## Visão Geral

O museu **não usa Firebase Auth**. A autenticação é feita contra a **API REST oficial do museu**,
hospedada em `https://museu.facom.ufu.br/api/v1/auth`. O token recebido (JWT Bearer) é armazenado
no `localStorage` do navegador e, uma vez autenticado, o usuário permanece logado entre sessões
até fazer logout explícito ou até o token expirar.

A lógica de autenticação é centralizada no `AuthService` (`src/app/core/auth/services/auth.service.ts`),
que usa **Angular Signals** para gerenciar o estado reativo da sessão.

---

## Fluxo de Login (passo a passo)

```
1. Usuário acessa /login e preenche usuário + senha
        │
        ▼
2. LoginComponent chama AuthService.login({ username, password })
        │
        ▼
3. AuthService envia POST /api/v1/auth/login
   com FormData: { username, password }
        │
        ▼
4. API retorna { access_token: "eyJ..." }
        │
        ▼
5. AuthService envia GET /api/v1/auth/me
   com header: Authorization: Bearer <access_token>
        │
        ▼
6. API retorna dados do usuário: { id, name, email, is_admin, ... }
        │
        ▼
7. AuthService monta o objeto Credentials:
   { accessToken, role (ADMIN | STUDENT), name, email, id, is_superuser }
        │
        ▼
8. setCredentials() salva em:
   - Signal: this.credentials.set(fullCredentials)
   - localStorage: chave "credentials" (JSON serializado)
        │
        ▼
9. Router redireciona para /home (ou rota anterior)
```

### Exemplo do objeto salvo no `localStorage`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ADMIN",
  "id": 1,
  "name": "Fulano de Tal",
  "email": "fulano@facom.ufu.br",
  "is_superuser": false
}
```

> A chave no `localStorage` é `"credentials"` (constante `KEY_STORAGE` em `auth.service.ts`).

---

## Perfis de Usuário (Roles)

Os perfis são definidos pelo enum `Role` em
`src/app/features/login/models/credentials.model.ts`:

| Role | Valor | Como é atribuído | Permissões |
| --- | --- | --- | --- |
| **`PUBLIC`** | `'PUBLIC'` | Visitante não autenticado | Acesso a todas as páginas públicas da aplicação. |
| **`STUDENT`** | `'STUDENT'` | Login com conta de estudante | Mesmas permissões do `PUBLIC`. Verificar com a equipe se há páginas exclusivas previstas. |
| **`ADMIN`** | `'ADMIN'` | Login com conta administrativa (`is_admin: true` na API) | Tudo do `PUBLIC` + acesso ao `/dashboard` e rotas protegidas de criação/edição de conteúdo. |
| **`COORDINATOR`** | `'COORDINATOR'` | _(a definir — role existe no enum mas sem uso mapeado no frontend)_ | _(a definir pela equipe)_ |

> **Como o role é determinado:** ao receber os dados do usuário em `GET /auth/me`, o `AuthService`
> avalia o campo `is_admin`:
> ```ts
> role: user.is_admin ? Role.ADMIN : Role.STUDENT
> ```
> `Role.PUBLIC` é o estado padrão quando nenhuma credencial está presente.

---

## Guards de Rota

Guards são funções que protegem rotas, impedindo o acesso de usuários não autorizados.
Ambos os guards estão definidos no final de `auth.service.ts`.

### `authGuard`

Verifica se o usuário está **autenticado** (se há um `accessToken` válido).
Caso contrário, redireciona para `/login`.

```ts
// Uso em app.routes.ts:
{
  path: 'dashboard',
  canActivate: [authGuard],
  // ...
}
```

**Rotas protegidas por `authGuard`:**

| Rota | Descrição |
| --- | --- |
| `/dashboard` e subrotas | Painel administrativo completo |
| `/news/create` | Criar nova notícia |
| `/news/edit/:id` | Editar notícia existente |
| `/videos/create` | Criar nova publicação de vídeo |
| `/videos/edit/:id` | Editar vídeo existente |
| `/personalities/create` | Criar nova personalidade |

### `authGuardStudent`

Verifica se o usuário tem especificamente o papel `Role.STUDENT`. Caso contrário, redireciona
para `/login`. _(Atualmente não está aplicado em nenhuma rota — disponível para uso futuro.)_

---

## Gerenciamento do Token e da Sessão

### Persistência

O token e os dados do usuário são salvos no `localStorage` do navegador. Isso significa que
a sessão **persiste entre abas e entre fechamentos do navegador** até que o logout seja feito
explicitamente ou o token expire.

### Recarregamento da página

No `constructor` do `AuthService`, as credenciais são recuperadas do `localStorage` automaticamente:

```ts
constructor() {
  const savedCredentials = this.storage.getItem(KEY_STORAGE);
  if (savedCredentials) {
    this.credentials.set(JSON.parse(savedCredentials));
  }
}
```

Isso garante que o usuário continue logado ao recarregar a página.

### Logout

O `AuthService.logout()` realiza três ações:

1. Reseta o Signal: `this.credentials.set(null)`
2. Remove do `localStorage`: `this.storage.removeItem(KEY_STORAGE)`
3. Redireciona para `/login` (se o parâmetro `redirect` for `true`, que é o padrão)

```ts
// Logout manual (ex.: botão no dashboard):
authService.logout();

// Logout sem redirecionar (ex.: chamado internamente pelo auth.interceptor):
authService.logout(false);
```

### Logout automático em 401

O `auth.interceptor.ts` (`src/app/core/auth/interceptors/auth.interceptor.ts`) detecta respostas
`401 Unauthorized` e chama `authService.logout()` automaticamente.

> ⚠️ **Gap conhecido:** o `authInterceptor` está implementado e correto, mas **não está registrado**
> em `app.config.ts` no `withInterceptors([...])`. Isso significa que o comportamento de logout
> automático e de injeção do token **não está ativo** no momento. A equipe deve verificar se há
> outro mecanismo de injeção de token em uso, ou registrar o interceptor.

---

## Signals Expostos pelo `AuthService`

O `AuthService` usa o padrão de **Signals** do Angular para reatividade. Os seguintes
signals/computeds podem ser consumidos diretamente nos componentes:

| Signal / Computed | Tipo | Descrição |
| --- | --- | --- |
| `credentials` | `Signal<Credentials \| null>` | Credenciais completas do usuário logado, ou `null`. |
| `credentials$` | `Observable<Credentials \| null>` | Versão Observable do signal (via `toObservable`). |
| `isStudent` | `Signal<boolean>` | `true` se o role for `Role.STUDENT`. |
| `isPublic` | `Signal<boolean>` | `true` se não houver credenciais ou role for `PUBLIC`. |
| `isAuthenticated` | `boolean` (getter) | `true` se houver `accessToken` presente. |

**Exemplo de uso em componente:**

```ts
export class MeuComponent {
  private authService = inject(AuthService);

  // Verificar se o usuário é admin para exibir/ocultar UI:
  isAdmin = computed(() => this.authService.credentials()?.role === Role.ADMIN);
}
```

---

## API de Autenticação

| Endpoint | Método | Body | Resposta |
| --- | --- | --- | --- |
| `/api/v1/auth/login` | `POST` | `FormData: { username, password }` | `{ access_token: string }` |
| `/api/v1/auth/me` | `GET` | — (requer `Authorization: Bearer <token>`) | `{ id, name, email, is_admin, is_superuser, ... }` |

**Base URL de produção:** `https://museu.facom.ufu.br`

---

## Como Criar uma Conta de Admin

A criação de contas de usuário com papel `ADMIN` é um processo **externo ao frontend** — não há
tela de cadastro na aplicação. O processo deve ser realizado diretamente no backend ou banco de
dados do museu.

> _(A ser documentado pela equipe de infraestrutura/backend com o processo específico de criação
> de contas administrativas.)_

Para obter acesso, entre em contato com os mantenedores (ver `.github/CODEOWNERS`):
`@museuComp`, `@D-Salge` ou `@salgeee`.

---

## Referências no Código

| Arquivo | Papel |
| --- | --- |
| `src/app/core/auth/services/auth.service.ts` | `AuthService`, `authGuard`, `authGuardStudent` |
| `src/app/core/auth/interceptors/auth.interceptor.ts` | Injeção de Bearer token + logout em 401 |
| `src/app/features/login/models/credentials.model.ts` | `Credentials` interface + `Role` enum |
| `src/app/features/login/login.component.ts` | Formulário de login |
| `src/app/app.routes.ts` | Aplicação dos guards nas rotas |
| `src/app/app.config.ts` | Registro dos interceptors (ver gap documentado acima) |
