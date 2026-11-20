import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, shareReplay } from 'rxjs';
import { SearchOptions, SearchResult } from '@shared/models/search-result.model';
import { findSearchTermMatches, getSearchProximity, normalizeSearchText as normalize, parseSearchQuery } from '@shared/utils/search-text.utils';
import { searchTimestamp } from '@shared/utils/search-results.utils';
import { FirestoreNewsService } from './firestore-news.service';
import { FirestoreVideosService } from './firestore-videos.service';
import { FirestorePersonalitiesService } from './firestore-personalities.service';
import { PublicSearchCatalogService } from './public-search-catalog.service';

/**
 * Serviço PortalSearchService reúne os conteúdos pesquisáveis e ordena os resultados.
 * Combina as publicações do Firestore com o catálogo dos arquivos e páginas públicas.
 * @example
 * searchService.search('"Alan Turing"');
 */
@Injectable({ providedIn: 'root' })
export class PortalSearchService {
  private readonly news = inject(FirestoreNewsService);
  private readonly videos = inject(FirestoreVideosService);
  private readonly personalities = inject(FirestorePersonalitiesService);
  private readonly catalog = inject(PublicSearchCatalogService);

  // Lê as coleções quando uma busca precisa do índice e aguarda os três conteúdos.
  private readonly publications$ = combineLatest([
    this.news.getAllNews(),
    this.videos.getAllVideos(),
    this.personalities.getAllPersonalities(),
  ]).pipe(
    map(([news, videos, personalities]) => {
      // Converte as publicações para o mesmo formato, sem incluir imagens no índice.
      const results: SearchResult[] = [
        ...news.map(post => ({
          id: post.id,
          title: post.summary?.title ?? '',
          description: post.summary?.description ?? '',
          module: 'news' as const,
          path: `news/detail/${post.id}`,
          content: post.fullContent?.filter(block => block.type !== 'image').map(block => block.content).join(' ') ?? '',
          publishedAt: searchTimestamp(post.createdAt),
        })),
        ...videos.map(video => ({
          id: video.id,
          title: video.summary?.title ?? '',
          description: video.description ?? '',
          module: 'videos' as const,
          path: `videos/detail/${video.id}`,
          publishedAt: searchTimestamp(video.createdAt),
        })),
        ...personalities.map(post => ({
          id: post.id,
          title: post.summary?.title ?? '',
          description: post.summary?.description ?? '',
          module: 'personalities' as const,
          path: `personalities/detail/${post.id}`,
          content: post.fullContent?.filter(block => block.type !== 'image').map(block => block.content).join(' ') ?? '',
          publishedAt: searchTimestamp(post.createdAt),
        })),
      ];

      return results.filter(result => result.id && result.title.trim());
    }),
    // Compartilha o índice entre buscas ativas e libera a leitura quando elas terminam.
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Pesquisa todas as palavras livres e exige a sequência das frases entre aspas.
   * @param query Texto digitado pelo visitante.
   * @param options Idioma do catálogo e ativação opcional da busca aproximada.
   * @returns Resultados ordenados pela escrita, frase completa, proximidade e título.
   */
  search(query: string, options: SearchOptions = {}): Observable<SearchResult[]> {
    const { terms, phrase, exactTerms } = parseSearchQuery(query);
    // Evita consultar o Firestore quando a pesquisa está vazia ou contém só aspas.
    if (!terms.length) {
      return of([]);
    }

    return combineLatest([this.publications$, this.catalog.getContent(options.language)]).pipe(
      map(([publications, pages]) => [...publications, ...pages].map(result => {
        const title = normalize(result.title);
        const description = normalize(result.description);
        const content = normalize(result.content ?? '');
        const fields = [title, description, content];
        const matched = terms.map(term => {
          if (fields.some(field => field.includes(term))) return { term, distance: 0 };
          if (!options.approximate || exactTerms.includes(term)) return undefined;
          // Aproxima a escrita apenas com a opção ativada e sem ocorrência literal.
          const candidates = fields.flatMap(field => findSearchTermMatches(field, term).map(match => ({ term: field.slice(match.start, match.end), distance: match.distance })));
          return candidates.sort((a, b) => a.distance - b.distance)[0];
        });
        if (matched.some(match => !match)) return undefined;
        const actualTerms = [...new Set(matched.map(match => match!.term))];
        const typoCost = matched.reduce((total, match) => total + match!.distance, 0);
        const coverage = (field: string) => actualTerms.filter(term => field.includes(term)).length;
        return {
          result: {
            ...result,
            approximate: typoCost > 0,
            // Prefere o corpo quando ele mostra mais palavras pesquisadas que o resumo.
            matchText: coverage(content) > coverage(description) ? result.content : result.description,
          },
          typoCost,
          phraseMatch: title.includes(phrase) ? 2 : description.includes(phrase) || content.includes(phrase) ? 1 : 0,
          proximity: Math.min(...fields.map(field => getSearchProximity(field, actualTerms))),
          titleMatches: coverage(title),
        };
      })
        .filter(item => item !== undefined)
        // Correspondências exatas precedem aproximações; a frase e a proximidade desempatam.
        .sort((a, b) => a.typoCost - b.typoCost || b.phraseMatch - a.phraseMatch
          || (a.proximity === b.proximity ? 0 : a.proximity - b.proximity)
          || b.titleMatches - a.titleMatches
          || a.result.title.localeCompare(b.result.title))
        .map(item => item.result)),
    );
  }
}
