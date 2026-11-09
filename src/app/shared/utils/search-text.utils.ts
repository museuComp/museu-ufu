/** Trecho de texto e indicação de que ele deve aparecer destacado. */
export interface SearchTextPart {
  text: string;
  highlighted: boolean;
}

/** Posições de início e fim de uma correspondência no texto. O fim não está incluído. */
interface MatchRange {
  start: number;
  end: number;
}

/** Termos obrigatórios da busca e frase completa usada na ordenação. */
export interface SearchQuery {
  terms: string[];
  phrase: string;
  /** Termos entre aspas sempre exigem a escrita exata, sem tolerância a erros. */
  exactTerms: string[];
}

/** Separa os acentos das letras e remove esses sinais para comparar a escrita. */
function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}

/**
 * Padroniza o texto para comparar acentos, maiúsculas e espaços.
 * @param text Texto que será comparado.
 * @returns Texto sem acentos, em minúsculas e com espaços padronizados.
 * @example
 * normalizeSearchText('  Computação  '); // 'computacao'
 */
export function normalizeSearchText(text: string): string {
  return removeAccents(text).toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Separa palavras livres e mantém cada frase entre aspas como um único termo.
 * @param query Pesquisa digitada pelo visitante.
 * @returns Termos obrigatórios e frase completa, sem as aspas de busca.
 * @example
 * parseSearchQuery('museu "Alan Turing"'); // Termos: 'museu' e 'alan turing'.
 */
export function parseSearchQuery(query: string): SearchQuery {
  const terms: string[] = [];
  const exactTerms: string[] = [];
  // Aceita tanto aspas retas quanto as aspas tipográficas copiadas de outros textos.
  const input = query.replace(/[“”]/gu, '"');
  for (const match of input.matchAll(/"([^"]*)"|([^"\s]+)/gu)) {
    const term = normalizeSearchText(match[1] ?? match[2]);
    if (term) {
      terms.push(term);
      if (match[1] !== undefined) exactTerms.push(term);
    }
  }
  // Evita termos duplicados no filtro e preserva a ordem da frase para a relevância.
  return { terms: [...new Set(terms)], phrase: terms.join(' '), exactTerms: [...new Set(exactTerms)] };
}

/** Mede pequenas diferenças de escrita, incluindo a troca de duas letras vizinhas. */
function spellingDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return Infinity;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  let older = previous;
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) current[j] = Math.min(current[j], older[j - 2] + 1);
    }
    older = previous;
    previous = current;
  }
  return previous[b.length];
}

/** Localiza o termo normalizado, aceitando pequenos erros apenas nas palavras livres. */
export function findSearchTermMatches(text: string, term: string, exact = false): Array<MatchRange & { distance: number }> {
  if (!term) return [];
  const literal: Array<MatchRange & { distance: number }> = [];
  let position = text.indexOf(term);
  while (position !== -1) {
    literal.push({ start: position, end: position + term.length, distance: 0 });
    position = text.indexOf(term, position + 1);
  }
  if (literal.length || exact || term.includes(' ') || term.length < 4 || term.length > 64) return literal;

  const limit = term.length >= 8 ? 2 : 1;
  let best = limit + 1;
  let matches: Array<MatchRange & { distance: number }> = [];
  for (const word of text.matchAll(/[\p{L}\p{N}]+/gu)) {
    const distance = spellingDistance(term, word[0], limit);
    if (distance > limit || distance > best) continue;
    if (distance < best) { best = distance; matches = []; }
    matches.push({ start: word.index!, end: word.index! + word[0].length, distance });
  }
  return matches;
}

/**
 * Mede o menor trecho que contém todos os termos da consulta.
 * @param text Texto já padronizado pelo normalizeSearchText.
 * @param terms Palavras ou frases obrigatórias, também já padronizadas.
 * @returns Tamanho do menor trecho, ou Infinity se algum termo estiver ausente.
 */
export function getSearchProximity(text: string, terms: readonly string[]): number {
  if (!terms.length || terms.some(term => !term)) {
    return Infinity;
  }
  if (terms.length === 1) {
    return text.includes(terms[0]) ? terms[0].length : Infinity;
  }

  // Registra todas as ocorrências para considerar também repetições mais próximas.
  const occurrences: Array<MatchRange & { term: number }> = [];
  for (let term = 0; term < terms.length; term++) {
    let position = text.indexOf(terms[term]);
    if (position === -1) {
      return Infinity;
    }
    while (position !== -1) {
      occurrences.push({ start: position, end: position + terms[term].length, term });
      position = text.indexOf(terms[term], position + 1);
    }
  }
  occurrences.sort((a, b) => a.start - b.start || a.end - b.end);

  // Percorre um intervalo de ocorrências e conta quais termos já estão nele.
  const counts = new Array<number>(terms.length).fill(0);
  const endQueue: number[] = [];
  let queueHead = 0;
  let covered = 0;
  let left = 0;
  let shortest = Infinity;
  for (let right = 0; right < occurrences.length; right++) {
    const occurrence = occurrences[right];
    if (++counts[occurrence.term] === 1) {
      covered++;
    }
    // Guarda o fim mais distante do intervalo, inclusive quando há frases longas.
    while (endQueue.length > queueHead && occurrences[endQueue[endQueue.length - 1]].end <= occurrence.end) {
      endQueue.pop();
    }
    endQueue.push(right);

    // Encurta o intervalo enquanto ele ainda contém todos os termos obrigatórios.
    while (covered === terms.length) {
      shortest = Math.min(shortest, occurrences[endQueue[queueHead]].end - occurrences[left].start);
      if (endQueue[queueHead] === left) {
        queueHead++;
      }
      if (--counts[occurrences[left].term] === 0) {
        covered--;
      }
      left++;
    }
  }
  return shortest;
}

/** Localiza no texto original os trechos que receberão o destaque da pesquisa. */
function findMatches(text: string, query: string, approximate: boolean): MatchRange[] {
  const { terms, exactTerms } = parseSearchQuery(query);
  if (!terms.length) {
    return [];
  }

  const starts: number[] = [];
  const ends: number[] = [];
  let normalized = '';
  let offset = 0;

  // Relaciona cada posição do texto padronizado à posição original.
  // Isso preserva a escrita de acentos, emojis e espaços nos destaques.
  for (const character of text) {
    const plain = removeAccents(character);
    const end = offset + character.length;
    if (!plain && ends.length) {
      ends[ends.length - 1] = end;
    } else if (/^\s+$/u.test(plain)) {
      // Compara espaços repetidos como um só, mantendo a posição original do trecho.
      if (normalized && !normalized.endsWith(' ')) {
        normalized += ' ';
        starts.push(offset);
        ends.push(end);
      } else if (normalized) {
        ends[ends.length - 1] = end;
      }
    } else {
      for (let i = 0; i < plain.length; i++) {
        starts.push(offset);
        ends.push(end);
      }
      normalized += plain;
    }
    offset = end;
  }
  if (normalized.endsWith(' ')) {
    normalized = normalized.slice(0, -1);
    starts.pop();
    ends.pop();
  }
  normalized = normalized.toLowerCase();

  // Converte cada ocorrência encontrada para as posições do texto original.
  const matches: MatchRange[] = [];
  for (const term of terms) {
    for (const match of findSearchTermMatches(normalized, term, !approximate || exactTerms.includes(term))) {
      matches.push({ start: starts[match.start], end: ends[match.end - 1] });
    }
  }

  matches.sort((a, b) => a.start - b.start || a.end - b.end);
  // Junta marcações sobrepostas para não repetir partes do texto na página.
  const merged: MatchRange[] = [];
  for (const match of matches) {
    const previous = merged[merged.length - 1];
    if (previous && match.start <= previous.end) {
      previous.end = Math.max(previous.end, match.end);
    } else {
      merged.push({ ...match });
    }
  }
  return merged;
}

/**
 * Divide o texto em partes comuns e destacadas, podendo gerar um resumo com contexto.
 * @param text Texto original da publicação.
 * @param query Consulta que define as palavras ou frases destacadas.
 * @param snippetLength Tamanho aproximado do resumo; sem valor, usa o texto inteiro.
 * @param approximate Permite destacar aproximações apenas quando a opção está ativa.
 * @returns Partes de texto prontas para serem exibidas pelo template.
 */
export function highlightSearchText(text: string, query: string, snippetLength?: number, approximate = false): SearchTextPart[] {
  if (!text) {
    return [];
  }

  const matches = findMatches(text, query, approximate);
  let start = 0;
  let end = text.length;

  // Posiciona o resumo perto da primeira ocorrência, em vez de sempre usar o início.
  if (snippetLength > 0 && Number.isFinite(snippetLength) && text.length > snippetLength) {
    const first = matches[0];
    start = Math.max(0, (first?.start ?? 0) - Math.floor(snippetLength / 3));
    end = Math.min(text.length, Math.max(start + Math.floor(snippetLength), first?.end ?? 0));
    if (end === text.length) {
      start = Math.max(0, Math.min(start, end - Math.floor(snippetLength)));
    }

    // O tamanho é aproximado para não cortar palavras nem a primeira correspondência.
    while (start > 0 && !/\s/u.test(text[start - 1])) {
      start--;
    }
    while (end < text.length && !/\s/u.test(text[end])) {
      end++;
    }
  }

  // As reticências indicam que uma parte da descrição ficou fora do resumo.
  const parts: SearchTextPart[] = [];
  if (start > 0) {
    parts.push({ text: '…', highlighted: false });
  }

  // Alterna os trechos sem destaque com as correspondências encontradas.
  let cursor = start;
  for (const match of matches) {
    if (match.end <= start || match.start >= end) {
      continue;
    }
    if (match.start > cursor) {
      parts.push({ text: text.slice(cursor, match.start), highlighted: false });
    }
    parts.push({ text: text.slice(match.start, match.end), highlighted: true });
    cursor = match.end;
  }
  if (cursor < end) {
    parts.push({ text: text.slice(cursor, end), highlighted: false });
  }
  if (end < text.length) {
    parts.push({ text: '…', highlighted: false });
  }
  return parts;
}
