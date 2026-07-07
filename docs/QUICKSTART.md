# Quickstart — Instalação e Comandos Básicos

Este guia leva um novo integrante do **zero até a aplicação rodando localmente** e resume os
comandos usados no dia a dia. O projeto é um Angular 19 (`museu-ufu`, ver `angular.json`).

---

## Pré-requisitos

| Ferramenta | Versão recomendada | Observação |
| --- | --- | --- |
| **Node.js** | **18 ou superior** (LTS) | Necessário para o toolchain do Angular. Verifique com `node -v`. |
| **npm** | Acompanha o Node.js | Gerenciador de pacotes usado pelo projeto (há `package-lock.json`). |
| **Angular CLI** | **19.2.8 ou compatível** (linha 19.2.x) | O projeto usa `@angular/cli ^19.2.13`. Verifique com `ng version`. |
| **Git** | Qualquer versão recente | Para clonar e versionar o código. |

> **Dica:** você não é obrigado a instalar o Angular CLI globalmente. Todos os comandos `ng ...`
> podem ser executados via `npx ng ...` ou pelos scripts do `package.json` (`npm start`,
> `npm run build`, `npm test`). Usar a CLI local evita conflitos de versão entre projetos.

Instalação global do CLI (opcional):

```bash
npm install -g @angular/cli@19.2.8
```

---

## Instalação (passo a passo)

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio> museu-ufu
cd museu-ufu
```

### 2. Instalar as dependências

```bash
npm install
```

Isso instala Angular, Angular Material, Firebase, Gov.br DS, Bootstrap, Font Awesome, Pannellum,
ng2-charts, pdfjs-dist, entre outros (ver seção de stack em [ARCHITECTURE.md](./ARCHITECTURE.md)).

### 3. Iniciar o servidor de desenvolvimento

```bash
ng serve
# ou, usando o script do projeto:
npm start
```

Acesse **<http://localhost:4200/>**. O servidor recarrega automaticamente ao salvar arquivos
(_hot reload_).

> **Sobre o `baseHref`:** o build de produção usa `baseHref: /museu-ufu/` (deploy em GitHub Pages),
> mas as configurações de `serve` e `development` sobrescrevem para `/`, então o app abre em
> `localhost:4200/` sem prefixo. Você não precisa fazer nada.

---

## Comandos do dia a dia

### Rodar localmente

```bash
ng serve                 # ambiente de desenvolvimento (padrão), http://localhost:4200/
npm start                # atalho equivalente a "ng serve"
```

### Gerar código com a CLI (schematics)

O `angular.json` já define os padrões dos schematics do projeto: **estilos em SCSS** e
**testes desabilitados por padrão** (`skipTests: true`). Ou seja, ao gerar um componente você
recebe `.ts`, `.html` e `.scss`, sem `.spec.ts`.

```bash
# Componente (respeita os padrões do projeto: SCSS + sem spec)
ng generate component pages/nome-do-componente
ng g c pages/nome-do-componente          # forma abreviada

# Outros artefatos comuns
ng g service core/services/nome          # serviço (providedIn: 'root')
ng g interceptor core/interceptors/nome  # interceptor HTTP funcional
ng g pipe shared/pipes/nome              # pipe reutilizável
ng g directive shared/directives/nome    # diretiva reutilizável
ng g guard core/auth/services/nome       # guard de rota
```

> Precisa de um `.spec.ts` para um componente específico? Gere com `--skip-tests=false`.

### Build de produção

```bash
ng build                 # build de produção (defaultConfiguration: production)
npm run build            # atalho equivalente
```

A saída vai para `dist/museu-ufu/`. A configuração de produção habilita _output hashing_,
_service worker_ (`ngsw-config.json`) e aplica os _budgets_ de tamanho definidos no `angular.json`
(aviso em 2MB / erro em 3MB para o bundle inicial).

Build em modo _watch_ (desenvolvimento contínuo):

```bash
npm run watch            # ng build --watch --configuration development
```

### Testes unitários

O projeto está configurado com **Karma + Jasmine** (ver `angular.json` → `test`). Há também
dependências de **Jest/Spectator** (`@ngneat/spectator`) usadas em specs mais novos.

```bash
ng test                  # executa a suíte de testes unitários
npm test                 # atalho equivalente
```

### Deploy (GitHub Pages)

```bash
npm run deploy           # build de produção + publicação via angular-cli-ghpages
```

Internamente: `ng build --configuration production && npx angular-cli-ghpages --dir=dist/museu-ufu/browser`.

---

## Configuração de ambiente (Firebase)

As credenciais do Firebase estão em dois lugares:

- **`src/app/app.config.ts`** — inicializa o app padrão (`museu-ufu-news`, usado por notícias e
  personalidades) e um segundo app (`videosApp` → projeto `museu-comp-ufu`, usado por vídeos).
- **`enviroment.ts`** (na raiz — atenção ao nome do arquivo) — exporta `env.API_KEY_FIRESTORE_VIDEOS`,
  a chave do projeto de vídeos.

Para desenvolvimento local o projeto funciona com as chaves já versionadas. Caso precise apontar
para outro projeto Firebase, altere esses dois pontos.

---

## Checklist do primeiro dia

- [ ] `node -v` retorna 18+.
- [ ] `ng version` mostra a linha 19.2.x (ou use `npx ng`).
- [ ] `npm install` concluiu sem erros.
- [ ] `ng serve` sobe e a home abre em `http://localhost:4200/`.
- [ ] Você leu o **[ARCHITECTURE.md](./ARCHITECTURE.md)** antes de escrever código.
