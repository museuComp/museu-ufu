import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, map, Observable, of, shareReplay, startWith, switchMap } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';
import { SEARCH_MODULE_LABELS, SEARCH_MODULES, SearchModule, SearchResult } from '@shared/models/search-result.model';
import { SearchFilters, selectSearchPage } from '@shared/utils/search-results.utils';
import { parseSearchQuery, SEARCH_QUERY_LIMITS, SearchQueryError } from '@shared/utils/search-text.utils';
import { HighlightSearchPipe } from '@shared/pipes/highlight-search/highlight-search.pipe';
import { PortalSearchService } from 'core/services/portal-search.service';

/** Estado da consulta usado para exibir mensagens e resultados na página. */
interface SearchState {
  query: string;
  language: string;
  approximate: boolean;
  status: 'idle' | 'loading' | 'success' | 'error' | 'invalid';
  queryError?: SearchQueryError;
  results: SearchResult[];
}

/**
 * Componente SearchComponent exibe os resultados da consulta recebida pela URL.
 * Mostra a contagem, os destaques e os estados de carregamento, erro e busca vazia.
 * @standalone
 */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [AsyncPipe, RouterLink, NgTemplateOutlet, TranslocoDirective, HighlightSearchPipe],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  /** Mantém o idioma atual nos links que abrem as publicações. */
  readonly nav = inject(NavigationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  private readonly searchService = inject(PortalSearchService);
  /** Permite repetir a busca após um erro sem mudar o termo na URL. */
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly moduleLabels = SEARCH_MODULE_LABELS;
  readonly queryLimits = SEARCH_QUERY_LIMITS;

  /** Ordena as opções pelo nome traduzido de cada módulo no idioma selecionado. */
  private readonly modules$ = this.transloco.selectTranslate<string[]>(Object.values(SEARCH_MODULE_LABELS)).pipe(
    map(labels => SEARCH_MODULES.map((value, index) => ({ value, label: labels[index] }))
      .sort((a, b) => a.label.localeCompare(b.label, this.transloco.getActiveLang(), { sensitivity: 'base' }))),
  );

  /** Refaz a busca quando o termo, o idioma, a aproximação ou a tentativa mudam. */
  private readonly data$: Observable<SearchState> = combineLatest([
    this.route.queryParamMap.pipe(
      map(params => ({ query: params.get('q') ?? '', approximate: params.get('approximate') === '1' })),
      distinctUntilChanged((previous, current) => previous.query === current.query && previous.approximate === current.approximate),
    ),
    this.transloco.langChanges$.pipe(distinctUntilChanged()),
    this.refresh$,
  ]).pipe(
    // Considera apenas a consulta mais recente quando o visitante troca o termo.
    switchMap(([{ query, approximate }, language]): Observable<SearchState> => {
      const { error: queryError } = parseSearchQuery(query);
      const state = { query: queryError ? '' : query.trim(), language, approximate };
      if (queryError) {
        return of({ ...state, status: 'invalid', queryError, results: [] });
      }
      if (!state.query) {
        return of({ ...state, status: 'idle', results: [] });
      }

      // Informa o carregamento e transforma falhas em uma mensagem recuperável.
      return this.searchService.search(state.query, { language, approximate }).pipe(
        map(results => ({ ...state, status: 'success' as const, results })),
        startWith({ ...state, status: 'loading' as const, results: [] }),
        catchError(() => of({ ...state, status: 'error' as const, results: [] })),
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Os filtros ficam na URL para preservar links compartilhados e o histórico. */
  readonly state$ = combineLatest([this.data$, this.route.queryParamMap, this.modules$]).pipe(
    map(([data, params, modules]) => {
      const module = params.get('module');
      const sort = params.get('sort');
      const filters: SearchFilters = {
        module: SEARCH_MODULES.includes(module as SearchModule) ? module as SearchModule : 'all',
        sort: sort === 'newest' || sort === 'oldest' ? sort : 'relevance',
        page: Number(params.get('page') ?? 1),
      };
      return { ...data, ...selectSearchPage(data.results, filters), filters, modules };
    }),
  );

  /** Uma mudança de filtro volta à primeira página e mantém o termo pesquisado. */
  updateFilter(key: 'module' | 'sort', value: string): void {
    // Remove parâmetros da classificação anterior ao salvar o filtro por módulo.
    const queryParams = { [key]: value === 'all' || value === 'relevance' || !value ? null : value, type: null, category: null, page: null };
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  /** Ativa a aproximação pela caixa de seleção e volta à primeira página. */
  toggleApproximate(enabled: boolean): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { approximate: enabled ? '1' : null, page: null, type: null, category: null },
      queryParamsHandling: 'merge',
    });
  }

  /** Remove os filtros e volta à primeira página da consulta atual. */
  clearFilters(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { module: null, approximate: null, type: null, category: null, sort: null, page: null }, queryParamsHandling: 'merge' });
  }

  /** Guarda a página na URL sem alterar o termo e os filtros escolhidos. */
  setPage(page: number): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { page: page > 1 ? page : null, type: null, category: null }, queryParamsHandling: 'merge' });
  }

  /** Exibe apenas o ano quando essa é a precisão conhecida da publicação. */
  formatDate(result: SearchResult, language: string): string {
    return new Intl.DateTimeFormat(language, result.datePrecision === 'year' ? { year: 'numeric', timeZone: 'UTC' } : { day: 'numeric', month: 'short', year: 'numeric' }).format(result.publishedAt);
  }

  /** Executa novamente a consulta atual ao clicar em Tentar novamente. */
  retry(): void {
    this.refresh$.next();
  }
}
