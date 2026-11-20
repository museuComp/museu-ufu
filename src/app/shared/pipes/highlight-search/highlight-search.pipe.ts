import { Pipe, PipeTransform } from '@angular/core';
import { highlightSearchText, SearchTextPart } from '@shared/utils/search-text.utils';

/**
 * Pipe HighlightSearchPipe prepara os trechos comuns e destacados de uma publicação.
 * @example
 * highlightSearch.transform('História da Computação', 'computacao');
 * @standalone
 */
@Pipe({ name: 'highlightSearch', standalone: true })
export class HighlightSearchPipe implements PipeTransform {
  /**
   * @param text Título ou descrição original.
   * @param query Pesquisa que define os destaques.
   * @param snippetLength Tamanho aproximado do resumo, quando necessário.
   * @param approximate Indica se os destaques podem considerar erros de escrita.
   * @returns Trechos de texto com a indicação de destaque.
   */
  transform(text: string | null | undefined, query: string | null | undefined, snippetLength?: number, approximate = false): SearchTextPart[] {
    return highlightSearchText(text ?? '', query ?? '', snippetLength, approximate);
  }
}
