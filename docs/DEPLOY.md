# CI/CD e Deploy

Este documento descreve os dois fluxos de deploy da aplicação: o **pipeline automático via GitHub
Actions** (fluxo principal de produção) e o **deploy manual via GitHub Pages** (fluxo alternativo).

---

## Visão Geral — Dois Fluxos de Deploy

| | Fluxo 1 — Produção (principal) | Fluxo 2 — GitHub Pages (alternativo) |
| --- | --- | --- |
| **Trigger** | Push na branch `main` | Manual (`npm run deploy`) |
| **Runner** | Self-hosted (`museu-ufu`) | Máquina local do dev |
| **Destino** | Servidor Nginx próprio | GitHub Pages |
| **`baseHref`** | `/` | `/museu-ufu/` |
| **Arquivo** | `.github/workflows/main.yml` | Script em `package.json` |
| **Quando usar** | Sempre que houver merge em `main` | Alternativa para ambientes de demonstração |

---

## Fluxo 1 — Deploy Automático via GitHub Actions

### Trigger

O pipeline é disparado automaticamente em **todo push para a branch `main`**, sem nenhuma ação
manual necessária.

```yaml
on:
  push:
    branches: [ "main" ]
```

### Etapas do Pipeline

```
Push para main
    │
    ▼
1. Checkout do código (actions/checkout@v4)
    │
    ▼
2. Setup Node.js 20 com cache de npm
    │
    ▼
3. npm ci  →  instala dependências de forma limpa (usa package-lock.json)
    │
    ▼
4. ng build --configuration production --base-href /
   Saída: dist/museu-ufu/browser/
    │
    ▼
5. rsync -av --delete dist/museu-ufu/browser/ /var/www/museu-ufu/
   Sincroniza os arquivos com a pasta servida pelo Nginx
    │
    ▼
6. sudo systemctl reload nginx
   Recarrega o Nginx sem derrubar conexões ativas
```

### Arquivo de workflow completo

O pipeline está em `.github/workflows/main.yml`:

```yaml
name: Deploy Museu (Angular)

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: [self-hosted, museu-ufu]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install deps
        run: npm ci

      - name: Build (prod)
        run: npm run build -- --configuration production --base-href /

      - name: Deploy browser/ to Nginx root
        run: |
          rsync -av --delete dist/museu-ufu/browser/ /var/www/museu-ufu/

      - name: Reload nginx
        run: |
          sudo systemctl reload nginx
```

---

## Self-Hosted Runner

### O que é

Um **self-hosted runner** é um agente do GitHub Actions executado em um servidor controlado pela
equipe, ao invés de usar a infraestrutura do GitHub. Isso permite que o pipeline tenha acesso
direto ao servidor de produção (Nginx) sem precisar de chaves SSH externas.

### Identificação

O runner está configurado com os labels `self-hosted` e `museu-ufu`:

```yaml
runs-on: [self-hosted, museu-ufu]
```

O label `museu-ufu` garante que apenas o runner correto (no servidor do museu) execute o job.

### Como configurar um runner

> _(A ser documentado pela equipe de infraestrutura com os passos de instalação no servidor.)_
>
> Referência oficial: [GitHub Docs — About self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners)

### Quem tem acesso

O servidor onde o runner está instalado é gerenciado pelos mantenedores do projeto
(`@museuComp`, `@D-Salge`, `@salgeee`). Para solicitar acesso, abra uma Issue ou entre em
contato pelo canal da equipe.

---

## Servidor Nginx

### Onde os arquivos ficam

Após o `rsync`, os arquivos do build de produção ficam em:

```
/var/www/museu-ufu/
```

O Nginx serve esse diretório como raiz (`root`) do virtual host do museu.

### Comportamento do `rsync`

A flag `--delete` garante que arquivos removidos da build anterior sejam apagados do servidor,
mantendo o diretório de produção sempre sincronizado com o que foi gerado.

### Reload vs. Restart

O pipeline usa `systemctl reload nginx` (não `restart`). O reload **não encerra conexões ativas**
— o Nginx recebe as novas configurações e novos arquivos sem causar downtime perceptível.

### Configuração do virtual host

> _(A ser documentado pela equipe de infraestrutura com a configuração do virtual host Nginx,
> incluindo SSL/HTTPS e redirecionamentos.)_

---

## Monitoramento e Troubleshooting

### Verificar o status de um deploy

1. Acesse a aba **Actions** do repositório no GitHub.
2. Clique no workflow **"Deploy Museu (Angular)"**.
3. Selecione o run correspondente ao commit desejado.
4. Expanda cada etapa para ver os logs detalhados.

### O que fazer quando o build quebra

| Etapa que falhou | Causa provável | Ação |
| --- | --- | --- |
| `npm ci` | Conflito de versão no `package-lock.json` | Rodar `npm install` localmente e comitar o `package-lock.json` atualizado |
| `ng build` | Erro de TypeScript ou budget de bundle estourado | Reproduzir localmente com `npm run build` e corrigir o erro apontado |
| `rsync` | Runner sem permissão no diretório de destino | Verificar permissões do diretório `/var/www/museu-ufu/` no servidor |
| `systemctl reload nginx` | Runner sem permissão sudo para nginx | Verificar configuração de sudoers no servidor |
| Runner offline | Runner não está rodando no servidor | Contatar os mantenedores para reiniciar o runner |

### Logs no servidor

Para verificar logs do Nginx diretamente no servidor (requer acesso SSH):

```bash
sudo journalctl -u nginx --since "1 hour ago"
sudo tail -f /var/log/nginx/error.log
```

---

## Fluxo 2 — Deploy Manual via GitHub Pages

### Quando usar

- Para criar uma versão de **demonstração pública** sem afetar o servidor de produção.
- Como alternativa temporária caso o servidor de produção esteja indisponível.

### Como executar

```bash
npm run deploy
```

### O que o script faz

Internamente executa:

```bash
ng build --configuration production && npx angular-cli-ghpages --dir=dist/museu-ufu/browser
```

Note que este comando usa `baseHref: /museu-ufu/` (configurado no script do `package.json`), que
é diferente do `baseHref: /` usado pelo pipeline de produção.

> ⚠️ **Atenção:** o deploy via GitHub Pages sobrescreve o conteúdo do branch `gh-pages` do
> repositório. Não use em ambientes onde isso possa causar conflito.

---

## CODEOWNERS

O arquivo `.github/CODEOWNERS` define que qualquer alteração em qualquer arquivo do repositório
(`*`) requer revisão de pelo menos um dos mantenedores:

```
* @museuComp @D-Salge @salgeee
```

Isso significa que **todos os PRs** precisam de aprovação de um desses usuários antes de poderem
ser mergeados para `main` — e consequentemente, antes de disparar o pipeline de deploy.

---

## Referências

| Arquivo | Descrição |
| --- | --- |
| `.github/workflows/main.yml` | Pipeline completo do GitHub Actions |
| `.github/CODEOWNERS` | Responsáveis por aprovar PRs |
| `package.json` → `scripts.deploy` | Script de deploy via GitHub Pages |
| `angular.json` → `production` | Configuração de build de produção |
