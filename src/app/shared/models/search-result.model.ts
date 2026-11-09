/** Seções com conteúdo informativo ou educativo que participam da busca. */
export const SEARCH_MODULE_LABELS = {
  about: 'breadcrumb.about',
  norms: 'breadcrumb.norms',
  personalities: 'breadcrumb.personalities',
  games: 'breadcrumb.games.title',
  news: 'breadcrumb.news',
  tour: 'breadcrumb.tour',
  magazine: 'breadcrumb.magazine',
  videos: 'breadcrumb.videos',
} as const;

export type SearchModule = keyof typeof SEARCH_MODULE_LABELS;
export const SEARCH_MODULES = Object.keys(SEARCH_MODULE_LABELS) as SearchModule[];
export type SearchSort = 'relevance' | 'newest' | 'oldest';

/** Idioma do índice e opção de tolerar pequenos erros de escrita. */
export interface SearchOptions {
  language?: string;
  /** A busca aproximada só é usada quando o visitante ativa a opção. */
  approximate?: boolean;
}

/** Dados usados para identificar, exibir e abrir um resultado da pesquisa. */
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  /** Seção do portal, compartilhada pela página inicial do módulo e seus conteúdos. */
  module: SearchModule;
  /** Rota de detalhe sem o idioma, que será acrescentado pelo NavigationService. */
  path: string;
  /** Corpo completo, sem imagens, usado para encontrar ocorrências além do resumo. */
  content?: string;
  /** Texto escolhido para o resumo quando a correspondência está no corpo da publicação. */
  matchText?: string;
  /** Arquivo público aberto diretamente, como o PDF de uma edição da revista. */
  assetUrl?: string;
  publishedAt?: number;
  datePrecision?: 'year' | 'day';
  approximate?: boolean;
}
