import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { SEARCH_MODULES, SearchResult } from '@shared/models/search-result.model';

/** Carrega o índice das páginas públicas no idioma selecionado, sem carregar componentes. */
@Injectable({ providedIn: 'root' })
export class PublicSearchCatalogService {
  private readonly http = inject(HttpClient);
  private readonly catalogs = new Map<string, Observable<SearchResult[]>>();

  /** Reutiliza o catálogo por idioma e permite repetir a requisição após uma falha. */
  getContent(language = 'pt-br'): Observable<SearchResult[]> {
    const locale = ['pt-br', 'en', 'es'].includes(language) ? language : 'pt-br';
    if (!this.catalogs.has(locale)) {
      this.catalogs.set(locale, this.http.get<{ documents: SearchResult[] }>(`public/search/${locale}.json`).pipe(
        // Descarta seções removidas mesmo ao receber um catálogo de uma versão anterior.
        map(catalog => catalog.documents.filter(document => SEARCH_MODULES.includes(document.module))),
        shareReplay({ bufferSize: 1, refCount: false }),
      ));
    }
    return this.catalogs.get(locale)!;
  }
}
