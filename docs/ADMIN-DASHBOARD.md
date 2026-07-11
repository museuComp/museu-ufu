# Painel Administrativo (Dashboard)

Este documento descreve o painel de gerenciamento de conteúdo do Museu Virtual, suas seções,
operações disponíveis e como utilizá-lo para publicar e manter notícias, vídeos e personalidades.

> **Pré-requisito:** é necessário ter uma conta com o perfil `ADMIN` para acessar o dashboard.
> Para entender o fluxo de autenticação completo, consulte **[AUTH.md](./AUTH.md)**.

---

## Acesso ao Dashboard

### Como fazer login

1. Acesse a aplicação em `https://museu.facom.ufu.br/home` (produção) ou `http://localhost:4200/`
   (desenvolvimento local).
2. Clique em **Login** na navegação (ou acesse diretamente `/login`).
3. Informe seu usuário e senha da conta administrativa.
4. Após o login bem-sucedido, você será redirecionado para `/home`.
5. Para ir ao dashboard: navegue manualmente para `/dashboard` ou clique no link de gerenciamento
   caso esteja visível no menu (depende do seu perfil).

> O dashboard só é acessível por usuários com `role === Role.ADMIN`. Usuários `STUDENT` e `PUBLIC`
> serão redirecionados para `/login` se tentarem acessar a rota diretamente.

---

## Interface do Dashboard

O dashboard possui uma estrutura com três seções principais, acessíveis por botões no topo da
tela:

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard de Gerenciamento          [Bem-vindo, Nome!]  │
│  [Notícias]  [Vídeos]  [Personalidades]        [Sair ↩] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Gerenciar Notícia              [+ Criar Notícia]       │
│  ─────────────────────────────────────────────────────  │
│  • Título da notícia A          [✏️ Editar] [🗑️ Excluir] │
│  • Título da notícia B          [✏️ Editar] [🗑️ Excluir] │
│  • (arrastar para reordenar)                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Navegação entre seções

Clicar nos botões **Notícias**, **Vídeos** ou **Personalidades** altera a view exibida abaixo e
navega para a subrota correspondente (`/dashboard/news`, `/dashboard/videos`,
`/dashboard/personalities`).

---

## Operações por Entidade

### Notícias (`/dashboard/news`)

Gerenciadas pelo `NewsDashboardComponent` via `FirestoreNewsService`.

| Operação | Como fazer | Rota/Ação |
| --- | --- | --- |
| **Listar** | Automático ao acessar a seção | Carrega todas as notícias ordenadas pelo campo `order` |
| **Criar** | Clicar no botão "Criar Notícia" | Navega para `/news/create` |
| **Editar** | Clicar no ícone de edição na linha | Navega para `/news/edit/:id` |
| **Excluir** | Clicar no ícone de lixeira na linha | Abre modal de confirmação → `deleteNews(id)` |
| **Reordenar** | Arrastar e soltar os itens da lista | Salva a nova ordem via campo `order` no Firestore |

> **Sobre reordenação:** o dashboard suporta **drag-and-drop** para definir a ordem em que as
> notícias aparecem na listagem pública. Arraste o item para a posição desejada e a ordem é salva
> automaticamente no Firestore.

### Vídeos (`/dashboard/videos`)

Gerenciados pelo `VideosDashboardComponent` via `FirestoreVideosService`.

| Operação | Como fazer | Rota/Ação |
| --- | --- | --- |
| **Listar** | Automático ao acessar a seção | Carrega todos os vídeos |
| **Criar** | Botão "Criar Vídeo" | Navega para `/videos/create` |
| **Editar** | Ícone de edição | Navega para `/videos/edit/:id` |
| **Excluir** | Ícone de lixeira | Abre modal de confirmação → `deleteVideo(id)` |

### Personalidades (`/dashboard/personalities`)

Gerenciadas pelo `PersonalitiesDashboardComponent`. As personalidades compartilham a **mesma
coleção Firestore** das notícias (`news`), diferenciadas pelo campo
`summary.category === 'Personalidades'`.

| Operação | Como fazer | Rota/Ação |
| --- | --- | --- |
| **Listar** | Automático ao acessar a seção | Carrega itens com `category === 'Personalidades'` |
| **Criar** | Botão "Criar Personalidade" | Navega para `/personalities/create` |
| **Editar** | Ícone de edição | Navega para `/personalities/edit/:id` _(verificar se implementado)_ |
| **Excluir** | Ícone de lixeira | Confirmação → `deleteNews(id)` (mesma coleção) |

---

## Como Publicar uma Notícia (passo a passo)

1. Acesse `/dashboard` e certifique-se de que a seção **Notícias** está selecionada.
2. Clique em **"+ Criar Notícia"**.
3. Você será redirecionado para o formulário em `/news/create`.
4. Preencha os campos do formulário:
   - **Título** — título da notícia (obrigatório)
   - **Conteúdo/Corpo** — texto principal da notícia
   - **Categoria** — define se é "Notícia" ou "Personalidade" (campo `category`)
   - **Imagem** — upload para o Firebase Storage (bucket `museu-ufu-news`)
   - **Data** — data de publicação
   - Demais campos conforme o formulário apresentar
5. Clique em **Salvar** / **Publicar**.
6. A notícia aparecerá imediatamente na listagem pública em `/news`.

> Para detalhes sobre o schema completo de um documento de notícia no Firestore, consulte
> **[FIREBASE.md](./FIREBASE.md)** _(a criar)_.

---

## Modal de Confirmação de Exclusão

Ao clicar no ícone de exclusão, um dialog do Angular Material é exibido:

```
┌──────────────────────────────────┐
│  Confirmar exclusão              │
│                                  │
│  Tem certeza que deseja excluir  │
│  a publicação "Título da peça"?  │
│                                  │
│         [Cancelar]  [Excluir]    │
└──────────────────────────────────┘
```

- **Cancelar** — fecha o dialog sem fazer nada.
- **Excluir** — confirma e chama o método `delete*()` do serviço correspondente, removendo o
  documento do Firestore permanentemente.

> ⚠️ **A exclusão é irreversível.** Não há lixeira ou soft-delete implementado atualmente.

---

## Como Criar uma Conta de Admin

A criação de novas contas administrativas é um processo **externo ao frontend** — não existe
tela de cadastro na aplicação. O processo é realizado diretamente no backend/API do museu por
um administrador existente ou pela equipe de infraestrutura.

> _(A ser documentado pela equipe com o processo específico de criação via API ou banco de dados.)_

Para solicitar acesso, entre em contato com os mantenedores:
- **GitHub:** `@museuComp`, `@D-Salge`, `@salgeee`
- **Canal da equipe:** _(a preencher pelos mantenedores)_

---

## Referências no Código

| Arquivo | Papel |
| --- | --- |
| `src/app/features/dashboard/dashboard.component.ts` | Shell do dashboard, navegação entre seções, logout |
| `src/app/features/dashboard/news-dashboard/` | Listagem, reordenação e exclusão de notícias |
| `src/app/features/dashboard/videos-dashboard/` | Listagem e gestão de vídeos |
| `src/app/features/dashboard/personalities-dashboard/` | Listagem e gestão de personalidades |
| `src/app/pages/news/` | Formulários de criação/edição de notícias e personalidades |
| `src/app/pages/videos/` | Formulários de criação/edição de vídeos |
| `src/core/services/firestore-news.service.ts` | `addNews`, `updateNews`, `deleteNews`, `getNews` |
| `src/core/services/firestore-videos.service.ts` | Equivalentes para vídeos |
