# Museu Virtual da FACOM/UFU

> **Documentação técnica completa:** [`docs/`](./docs/README.md)

---

## Descrição

Plataforma web dedicada a preservar e apresentar a história da Faculdade de Computação (FACOM) da Universidade Federal de Uberlândia (UFU). A aplicação oferece uma experiência digital interativa, permitindo explorar o acervo, a trajetória da faculdade e exposições virtuais temáticas.

**Stack:** Angular 19 · Firebase Firestore · Gov.br Design System · Angular Material

---

## Funcionalidades Principais

- **Exposição Digital do Acervo** — visualização da coleção com imagens e descrições
- **Linha do Tempo Interativa** — marcos cronológicos da FACOM e da computação
- **Visita Virtual (360°)** — passeio imersivo com Pannellum
- **Notícias e Personalidades** — conteúdo editorial dinâmico via Firestore
- **Vídeos** — galeria servida por um segundo projeto Firestore
- **Revista Digital** — renderização de PDF via `pdfjs-dist`
- **Jogos Educativos** — quizzes, jogo da memória, caça-palavras, desafio lógico e mais
- **Doações** — canal para contribuir com o acervo

---

## Como Começar

### Pré-requisitos

- Node.js 18 ou superior
- Angular CLI 19.2.x
- Git

### Instalação e Execução

```bash
git clone https://github.com/museuComp/museu-ufu.git
cd museu-ufu
npm install
ng serve
# Acesse: http://localhost:4200/
```

Para instruções detalhadas (Firebase, deploy, utilitários), consulte a **[documentação em `docs/`](./docs/QUICKSTART.md)**.

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── core/       → Auth, interceptors, guards, estratégias (singletons)
│   ├── features/   → Home, login, dashboard, profile, not-found
│   ├── pages/      → Páginas de conteúdo (jogos, notícias, vídeos, etc.)
│   └── shared/     → Componentes, diretivas, pipes e utils reutilizáveis
├── core/services/  → Serviços de acesso ao Firestore
└── public/         → Assets estáticos (imagens, logos, revista)
```

Descrição detalhada em **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**.

---

## Referências Externas

- **Site Oficial:** <https://museu.facom.ufu.br/home>
- **Documento do Projeto:** <https://docs.google.com/document/d/1vX-5Be_FuXJ3O5pexzls_60_ckg--HiQ9KqpVe77rVI/>
- **Artigo Científico:** <https://drive.google.com/file/d/1k3hgdpcdYazdfjlk_soKI6Q-uNNZ7_jM/view?usp=sharing>
- **Notion do Projeto:** <https://stupendous-walk-485.notion.site/2a37d2ae7bf5801d8551e02940e4f63a?v=2a37d2ae7bf5806c8d6a000c935c05b0&pvs=74>
