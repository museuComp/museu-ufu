export type ContentType = 'news' | 'video' | 'personality';

export type PeriodFilter = 'this-month' | 'last-3-months' | 'last-6-months' | 'this-year' | 'all';

export interface StatKpi {
  readonly labelKey: string;
  readonly value: number;
  readonly icon: string;
  readonly trend: number;
  readonly type: ContentType | 'total';
  readonly sublabelKey: string;
}

export interface ContentItem {
  readonly id: string;
  readonly title: string;
  readonly type: ContentType;
  readonly category: string;
  readonly writer: string;
  readonly createdAt: Date;
  readonly routerPath: string;
}

export interface CategoryData {
  readonly label: string;
  readonly count: number;
  readonly color: string;
}

export interface TemporalData {
  readonly month: string; // YYYY-MM
  readonly monthLabel: string;
  readonly news: number;
  readonly videos: number;
  readonly personalities: number;
  readonly total: number;
}

export interface AuthorStat {
  readonly writer: string;
  readonly count: number;
  readonly newsCount: number;
  readonly videosCount: number;
  readonly personalitiesCount: number;
}

export interface StatisticsFilterState {
  readonly period: PeriodFilter;
  readonly type: ContentType | 'all';
  readonly category: string;
  readonly searchTerm: string;
}

