import { inject, Injectable, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirestoreNewsService, NewsPost } from '../../../core/services/firestore-news.service';
import { FirestoreVideosService, Video } from '../../../core/services/firestore-videos.service';
import { FirestorePersonalitiesService, PersonalityPost } from '../../../core/services/firestore-personalities.service';
import { NavigationService } from '@app/services/navigation.service';
import {
  AuthorStat,
  CategoryData,
  ContentItem,
  ContentType,
  PeriodFilter,
  StatKpi,
  TemporalData,
} from './models/statistics.models';

function parseFirestoreDate(raw: unknown): Date {
  if (!raw) return new Date();
  if (raw instanceof Date) return isNaN(raw.getTime()) ? new Date() : raw;
  if (typeof raw === 'object' && raw !== null) {
    if ('toDate' in raw && typeof (raw as { toDate: () => unknown }).toDate === 'function') {
      const d = (raw as { toDate: () => unknown }).toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    }
    if ('seconds' in raw && typeof (raw as { seconds: unknown }).seconds === 'number') {
      return new Date((raw as { seconds: number }).seconds * 1000);
    }
  }
  if (typeof raw === 'string' || typeof raw === 'number') {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

function cleanString(str: unknown, fallback: string): string {
  if (typeof str !== 'string') return fallback;
  const trimmed = str.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private readonly newsService = inject(FirestoreNewsService);
  private readonly videosService = inject(FirestoreVideosService);
  private readonly personalitiesService = inject(FirestorePersonalitiesService);
  private readonly nav = inject(NavigationService);

  // Firestore Observables to Signals
  readonly rawNews = toSignal(this.newsService.getAllNews(), { initialValue: [] as NewsPost[] });
  readonly rawVideos = toSignal(this.videosService.getAllVideos(), { initialValue: [] as Video[] });
  readonly rawPersonalities = toSignal(this.personalitiesService.getAllPersonalities(), {
    initialValue: [] as PersonalityPost[],
  });

  // Filter signals
  readonly activePeriod = signal<PeriodFilter>('all');
  readonly activeType = signal<ContentType | 'all'>('all');
  readonly activeCategory = signal<string>('all');
  readonly searchTerm = signal<string>('');

  // Unified Content List
  readonly allContent = computed<ContentItem[]>(() => {
    const news = this.rawNews();
    const videos = this.rawVideos();
    const personalities = this.rawPersonalities();

    const items: ContentItem[] = [];

    for (const n of news) {
      if (!n.id) continue;
      items.push({
        id: n.id,
        title: cleanString(n.summary?.title, 'Sem título'),
        type: 'news',
        category: cleanString(n.summary?.category, 'Geral'),
        writer: cleanString(n.summary?.writer, 'Não informado'),
        createdAt: parseFirestoreDate(n.createdAt),
        routerPath: this.nav.route(`news/detail/${n.id}`),
      });
    }

    for (const v of videos) {
      if (!v.id) continue;
      items.push({
        id: v.id,
        title: cleanString(v.summary?.title, 'Sem título'),
        type: 'video',
        category: cleanString(v.summary?.category, 'Geral'),
        writer: cleanString(v.summary?.writer, 'Não informado'),
        createdAt: parseFirestoreDate(v.createdAt),
        routerPath: this.nav.route(`videos/detail/${v.id}`),
      });
    }

    for (const p of personalities) {
      if (!p.id) continue;
      items.push({
        id: p.id,
        title: cleanString(p.summary?.title, 'Sem título'),
        type: 'personality',
        category: cleanString(p.summary?.category, 'Geral'),
        writer: cleanString(p.summary?.writer, 'Não informado'),
        createdAt: parseFirestoreDate(p.createdAt),
        routerPath: this.nav.route(`personalities/detail/${p.id}`),
      });
    }

    // Sort by createdAt descending
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  // Loading state (true if all 3 are still initial empty arrays before firestore emits)
  readonly isLoading = computed(() => {
    // If news, videos and personalities are all empty and no content exists yet
    return (
      this.rawNews().length === 0 &&
      this.rawVideos().length === 0 &&
      this.rawPersonalities().length === 0
    );
  });

  // Dynamic available categories
  readonly availableCategories = computed<string[]>(() => {
    const cats = new Set<string>();
    for (const item of this.allContent()) {
      if (item.category) {
        cats.add(item.category);
      }
    }
    return Array.from(cats).sort();
  });

  // Filtered Content
  readonly filteredContent = computed<ContentItem[]>(() => {
    const items = this.allContent();
    const period = this.activePeriod();
    const type = this.activeType();
    const category = this.activeCategory();
    const search = this.searchTerm().trim().toLowerCase();

    const now = new Date();
    let minDate: Date | null = null;

    if (period === 'this-month') {
      minDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'last-3-months') {
      minDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (period === 'last-6-months') {
      minDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else if (period === 'this-year') {
      minDate = new Date(now.getFullYear(), 0, 1);
    }

    return items.filter((item) => {
      if (type !== 'all' && item.type !== type) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (minDate && item.createdAt < minDate) return false;
      if (search) {
        const matchesTitle = item.title.toLowerCase().includes(search);
        const matchesWriter = item.writer.toLowerCase().includes(search);
        const matchesCategory = item.category.toLowerCase().includes(search);
        if (!matchesTitle && !matchesWriter && !matchesCategory) return false;
      }
      return true;
    });
  });

  // KPI Cards
  readonly kpis = computed<StatKpi[]>(() => {
    const items = this.allContent();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const isThisMonth = (d: Date) =>
      d.getFullYear() === currentYear && d.getMonth() === currentMonth;

    let newsCount = 0;
    let newsThisMonth = 0;
    let videoCount = 0;
    let videoThisMonth = 0;
    let personalityCount = 0;
    let personalityThisMonth = 0;

    for (const item of items) {
      const thisMonth = isThisMonth(item.createdAt);
      if (item.type === 'news') {
        newsCount++;
        if (thisMonth) newsThisMonth++;
      } else if (item.type === 'video') {
        videoCount++;
        if (thisMonth) videoThisMonth++;
      } else if (item.type === 'personality') {
        personalityCount++;
        if (thisMonth) personalityThisMonth++;
      }
    }

    const totalCount = newsCount + videoCount + personalityCount;
    const totalThisMonth = newsThisMonth + videoThisMonth + personalityThisMonth;

    return [
      {
        labelKey: 'statistics.kpis.news',
        value: newsCount,
        icon: 'newspaper',
        trend: newsThisMonth,
        type: 'news',
        sublabelKey: 'statistics.kpis.thisMonth',
      },
      {
        labelKey: 'statistics.kpis.videos',
        value: videoCount,
        icon: 'smart_display',
        trend: videoThisMonth,
        type: 'video',
        sublabelKey: 'statistics.kpis.thisMonth',
      },
      {
        labelKey: 'statistics.kpis.personalities',
        value: personalityCount,
        icon: 'person',
        trend: personalityThisMonth,
        type: 'personality',
        sublabelKey: 'statistics.kpis.thisMonth',
      },
      {
        labelKey: 'statistics.kpis.total',
        value: totalCount,
        icon: 'inventory_2',
        trend: totalThisMonth,
        type: 'total',
        sublabelKey: 'statistics.kpis.inCollection',
      },
    ];
  });

  // Category Distribution (for Doughnut chart)
  readonly categoryDistribution = computed<CategoryData[]>(() => {
    const items = this.allContent();
    let news = 0;
    let videos = 0;
    let personalities = 0;

    for (const item of items) {
      if (item.type === 'news') news++;
      else if (item.type === 'video') videos++;
      else if (item.type === 'personality') personalities++;
    }

    return [
      { label: 'Notícias', count: news, color: '#1351b4' },
      { label: 'Vídeos', count: videos, color: '#e53935' },
      { label: 'Personalidades', count: personalities, color: '#2e7d32' },
    ];
  });

  // Temporal Data (Monthly publications for Stacked Bar chart)
  readonly temporalData = computed<TemporalData[]>(() => {
    const items = this.allContent();
    if (items.length === 0) return [];

    const monthMap = new Map<string, { news: number; videos: number; personalities: number }>();

    for (const item of items) {
      const year = item.createdAt.getFullYear();
      const month = String(item.createdAt.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      const entry = monthMap.get(key) || { news: 0, videos: 0, personalities: 0 };
      if (item.type === 'news') entry.news++;
      else if (item.type === 'video') entry.videos++;
      else if (item.type === 'personality') entry.personalities++;
      monthMap.set(key, entry);
    }

    // Sort months chronologically
    const sortedKeys = Array.from(monthMap.keys()).sort();

    // Take the last 12 months if there are many
    const recentKeys = sortedKeys.slice(-12);

    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    return recentKeys.map((k) => {
      const [year, monthStr] = k.split('-');
      const monthIndex = parseInt(monthStr, 10) - 1;
      const label = `${monthNames[monthIndex]}/${year.slice(2)}`;
      const data = monthMap.get(k)!;

      return {
        month: k,
        monthLabel: label,
        news: data.news,
        videos: data.videos,
        personalities: data.personalities,
        total: data.news + data.videos + data.personalities,
      };
    });
  });

  // Recent Activity (cross-collection)
  readonly recentActivity = computed<ContentItem[]>(() => {
    return this.allContent().slice(0, 10);
  });

  // Authors Ranking
  readonly authorsRanking = computed<AuthorStat[]>(() => {
    const items = this.allContent();
    const authorMap = new Map<
      string,
      { count: number; newsCount: number; videosCount: number; personalitiesCount: number }
    >();

    for (const item of items) {
      const writer = item.writer;
      if (!writer || writer.toLowerCase() === 'não informado') continue;

      const current = authorMap.get(writer) || {
        count: 0,
        newsCount: 0,
        videosCount: 0,
        personalitiesCount: 0,
      };

      current.count++;
      if (item.type === 'news') current.newsCount++;
      else if (item.type === 'video') current.videosCount++;
      else if (item.type === 'personality') current.personalitiesCount++;

      authorMap.set(writer, current);
    }

    return Array.from(authorMap.entries())
      .map(([writer, stats]) => ({
        writer,
        count: stats.count,
        newsCount: stats.newsCount,
        videosCount: stats.videosCount,
        personalitiesCount: stats.personalitiesCount,
      }))
      .sort((a, b) => b.count - a.count);
  });

  // Setters for filters
  setPeriod(period: PeriodFilter): void {
    this.activePeriod.set(period);
  }

  setType(type: ContentType | 'all'): void {
    this.activeType.set(type);
  }

  setCategory(category: string): void {
    this.activeCategory.set(category);
  }

  setSearch(search: string): void {
    this.searchTerm.set(search);
  }

  clearFilters(): void {
    this.activePeriod.set('all');
    this.activeType.set('all');
    this.activeCategory.set('all');
    this.searchTerm.set('');
  }
}
