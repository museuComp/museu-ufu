import { SearchModule, SearchResult, SearchSort } from '@shared/models/search-result.model';

/** Opções recebidas da URL para filtrar, ordenar e paginar os resultados. */
export interface SearchFilters {
  module: SearchModule | 'all';
  sort: SearchSort;
  page: number;
}

/** Converte datas do Firestore e de publicações antigas sem criar datas para itens sem data. */
export function searchTimestamp(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  let timestamp: number;
  if (value instanceof Date) timestamp = value.getTime();
  else if (typeof value === 'number') timestamp = value;
  else if (typeof value === 'string') timestamp = Date.parse(value);
  else if (typeof (value as { toMillis?: unknown }).toMillis === 'function') timestamp = (value as { toMillis(): number }).toMillis();
  else if (typeof (value as { seconds?: unknown }).seconds === 'number') timestamp = (value as { seconds: number }).seconds * 1000;
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

/** Aplica filtros e ordenação antes de recortar os itens da página solicitada. */
export function selectSearchPage(results: SearchResult[], filters: SearchFilters, pageSize = 10) {
  const filtered = results.filter(result => filters.module === 'all' || result.module === filters.module);
  if (filters.sort !== 'relevance') {
    filtered.sort((a, b) => {
      if (a.publishedAt === undefined) return b.publishedAt === undefined ? 0 : 1;
      if (b.publishedAt === undefined) return -1;
      return filters.sort === 'newest' ? b.publishedAt - a.publishedAt : a.publishedAt - b.publishedAt;
    });
  }
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.max(1, Math.min(totalPages, Number.isFinite(filters.page) ? Math.floor(filters.page) : 1));
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(total, page * pageSize);
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  return {
    results: filtered.slice((page - 1) * pageSize, page * pageSize), total, totalPages, page, start, end,
    pages: Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index),
  };
}
