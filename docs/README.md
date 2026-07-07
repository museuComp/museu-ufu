# Museu Virtual da FACOM/UFU — Documentação

> Portal de documentação técnica do **Museu Virtual da Faculdade de Computação (FACOM)** da
> **Universidade Federal de Uberlândia (UFU)**. Este é o ponto de entrada para desenvolvedores:
> aqui você entende *o que* é o projeto, *como* rodá-lo, *como* ele está organizado por dentro e
> *como* contribuir sem quebrar os padrões existentes.

---

## Navegação da Wiki

| Documento | Para quê serve |
| --- | --- |
| **[README.md](./README.md)** _(este arquivo)_ | Visão geral, propósito, público-alvo e referências externas. |
| **[QUICKSTART.md](./QUICKSTART.md)** | Pré-requisitos, instalação e comandos do dia a dia (`ng serve`, `ng build`, `ng test`…). |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Estrutura de diretórios, papel de cada camada e a stack tecnológica. |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Guia prático para criar features, componentes, jogos e expandir a linha do tempo/exposição. |

---

## O que é o Museu Virtual da FACOM/UFU

O Museu Virtual é uma **plataforma web** dedicada a **preservar, organizar e apresentar a história
da Faculdade de Computação (FACOM) da UFU**. A aplicação transforma um acervo físico e uma memória
institucional dispersa em uma experiência digital interativa, permitindo que qualquer pessoa —
de qualquer lugar — explore a trajetória da computação na instituição e na região.

Tecnicamente, trata-se de uma **Single Page Application (SPA) em Angular 19**, com componentes
_standalone_, roteamento com _lazy loading_ e conteúdo dinâmico (notícias, personalidades e vídeos)
servido pelo **Firebase Firestore**. O restante da experiência — exposição digital do acervo,
linha do tempo, visita virtual em 360°, revista e jogos educativos — é entregue diretamente pelo
front-end.

### Funcionalidades principais

- **Exposição Digital do Acervo** — visualização dos itens da coleção com imagens e descrições
  (imagens em `src/public/itens/`).
- **Linha do Tempo Interativa** — apresentação cronológica dos marcos da FACOM e da computação.
- **Visita Virtual (360°)** — passeio imersivo por ambientes usando a biblioteca **Pannellum**
  (rota `visita-virtual`).
- **Notícias e Personalidades** — conteúdo editorial dinâmico persistido no Firestore, com painel
  administrativo protegido por autenticação (`dashboard`).
- **Vídeos** — galeria de vídeos servida por um segundo projeto Firestore.
- **Revista Digital** — leitura da revista do museu renderizada a partir de PDF (`pdfjs-dist`).
- **Jogos Educativos** — quizzes, jogo da memória, caça-palavras, desafio lógico, tabela-verdade,
  puzzle de Linux, _Computing Dungeons_ e _MuseuDle_ (rotas em `/games`).
- **Doações** — canal para a comunidade contribuir com o acervo (rota `donations`).
- **Acessibilidade** — recursos e configurações de acessibilidade, alinhados ao padrão **Gov.br DS**.

---

## Motivação do projeto

O Museu Virtual nasce da necessidade de **resgatar e não perder** a memória da computação
construída ao longo de décadas na UFU. Equipamentos, documentos, revistas e as histórias das
pessoas que fizeram a faculdade correm o risco de se dispersar com o tempo. Digitalizar esse
acervo e dar a ele uma vitrine pública cumpre três objetivos:

1. **Preservação** — garantir que o registro histórico sobreviva independentemente do estado
   físico dos objetos.
2. **Democratização do acesso** — permitir que qualquer pessoa, sem precisar visitar o campus,
   conheça a história e o acervo.
3. **Educação e engajamento** — usar recursos interativos (jogos, quizzes, visita 360°) para
   aproximar o público mais jovem da história da computação.

---

## Público-alvo

| Público | Como o museu os atende |
| --- | --- |
| **Alunos e ex-alunos** | Conectam gerações, revisitam a história da instituição e se reconhecem no acervo. |
| **Pesquisadores e historiadores** | Encontram uma fonte organizada de consulta sobre a evolução da computação na UFU e região. |
| **Comunidade externa e escolar** | Acessam cultura, ciência e tecnologia de forma interativa e gratuita. |
| **Docentes e a própria FACOM** | Ganham uma vitrine institucional viva, atualizável via painel administrativo. |

---

## Referências Externas

- **Site Oficial:** <https://museu.facom.ufu.br/home>
- **Documento do Projeto:** <https://docs.google.com/document/d/1vX-5Be_FuXJ3O5pexzls_60_ckg--HiQ9KqpVe77rVI/>
- **Artigo Científico:** <https://drive.google.com/file/d/1k3hgdpcdYazdfjlk_soKI6Q-uNNZ7_jM/view?usp=sharing>
- **Notion do Projeto:** <https://stupendous-walk-485.notion.site/2a37d2ae7bf5801d8551e02940e4f63a?v=2a37d2ae7bf5806c8d6a000c935c05b0&pvs=74>

---

## Primeiros passos rápidos

```bash
git clone <url-do-repositorio> museu-ufu
cd museu-ufu
npm install
ng serve
# abra http://localhost:4200/
```

Detalhes completos em **[QUICKSTART.md](./QUICKSTART.md)**.
