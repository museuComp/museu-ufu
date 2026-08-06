import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'readingTime',
  standalone: true
})
export class ReadingTimePipe implements PipeTransform {

  transform(content: string | Array<{ type: string; content: string }> | null | undefined): string {
    if (!content) {
      return '⏱️ 1 min de leitura';
    }

    let rawText = '';

    // Se for um array de blocos (fullContent), junta o texto de todos os blocos de tipo 'text' e 'title'
    if (Array.isArray(content)) {
      rawText = content
        .filter(item => item.type === 'text' || item.type === 'title')
        .map(item => item.content)
        .join(' ');
    } else {
      rawText = content;
    }

    if (!rawText) {
      return '⏱️ 1 min de leitura';
    }

    // 1. Limpeza de sintaxe Markdown
    const cleanText = rawText
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/(\*\*|__|\*|_)/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*>\s+/gm, '')
      .replace(/^[\s-*\n]{3,}/gm, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      return '⏱️ 1 min de leitura';
    }

    // 2. Contagem de palavras e cálculo
    const wordsCount = cleanText.split(/\s+/).length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordsCount / wordsPerMinute);

    return `⏱️ ${Math.max(1, minutes)} min de leitura`;
  }
}