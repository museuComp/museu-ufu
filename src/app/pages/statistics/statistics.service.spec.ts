import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { StatisticsService } from './statistics.service';
import { FirestoreNewsService, NewsPost } from '../../../core/services/firestore-news.service';
import { FirestoreVideosService, Video } from '../../../core/services/firestore-videos.service';
import { FirestorePersonalitiesService, PersonalityPost } from '../../../core/services/firestore-personalities.service';
import { AuthService } from '@app/core/auth/services/auth.service';
import { NavigationService } from '@app/services/navigation.service';
import { Role } from '@features/login/models/credentials.model';

describe('StatisticsService', () => {
  let service: StatisticsService;

  const mockNews: NewsPost[] = [
    {
      id: 'news-1',
      summary: {
        title: 'Nova Exposição',
        description: 'Descrição da exposição',
        category: 'História',
        mainImage: 'img.jpg',
        writer: 'Prof. Silva',
      },
      fullContent: [],
      createdAt: new Date('2026-03-01T10:00:00Z'),
    },
    {
      id: 'news-2',
      summary: {
        title: 'Computador Quântico',
        description: 'Avanços em computação quântica',
        category: 'Hardware',
        mainImage: 'img2.jpg',
        writer: 'Dra. Maria',
      },
      fullContent: [],
      createdAt: new Date('2026-02-15T10:00:00Z'),
    },
  ];

  const mockVideos: Video[] = [
    {
      id: 'video-1',
      summary: {
        title: 'História do ENIAC',
        coverUrl: 'cover.jpg',
        category: 'Documentário',
        writer: 'Prof. Silva',
      },
      videoUrl: 'https://youtube.com/watch?v=123',
      createdAt: new Date('2026-03-05T14:00:00Z'),
    },
  ];

  const mockPersonalities: PersonalityPost[] = [
    {
      id: 'pers-1',
      summary: {
        title: 'Alan Turing',
        description: 'Pioneiro da computação',
        category: 'Pioneiros',
        mainImage: 'turing.jpg',
        writer: 'Prof. Silva',
      },
      fullContent: [],
      createdAt: new Date('2026-01-10T09:00:00Z'),
    },
  ];

  const mockFirestoreNewsService = {
    getAllNews: () => of(mockNews),
  };

  const mockFirestoreVideosService = {
    getAllVideos: () => of(mockVideos),
  };

  const mockFirestorePersonalitiesService = {
    getAllPersonalities: () => of(mockPersonalities),
  };

  const mockAuthService = {
    isAuthenticated: true,
    credentials: signal({
      accessToken: 'token-123',
      role: Role.ADMIN,
      name: 'Admin User',
    }),
  };

  const mockNavigationService = {
    route: (path: string) => `/pt-br/${path}`,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StatisticsService,
        { provide: FirestoreNewsService, useValue: mockFirestoreNewsService },
        { provide: FirestoreVideosService, useValue: mockFirestoreVideosService },
        { provide: FirestorePersonalitiesService, useValue: mockFirestorePersonalitiesService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: NavigationService, useValue: mockNavigationService },
      ],
    });

    service = TestBed.inject(StatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should aggregate all content items correctly', () => {
    const items = service.allContent();
    expect(items.length).toBe(4);

    // Verify types
    const newsItems = items.filter((i) => i.type === 'news');
    const videoItems = items.filter((i) => i.type === 'video');
    const personalityItems = items.filter((i) => i.type === 'personality');

    expect(newsItems.length).toBe(2);
    expect(videoItems.length).toBe(1);
    expect(personalityItems.length).toBe(1);

    // Check routerPath prefix
    expect(newsItems[0].routerPath).toContain('/pt-br/news/detail/');
  });

  it('should compute KPI totals accurately', () => {
    const kpis = service.kpis();
    expect(kpis.length).toBe(4);

    const newsKpi = kpis.find((k) => k.type === 'news');
    const videoKpi = kpis.find((k) => k.type === 'video');
    const personalityKpi = kpis.find((k) => k.type === 'personality');
    const totalKpi = kpis.find((k) => k.type === 'total');

    expect(newsKpi?.value).toBe(2);
    expect(videoKpi?.value).toBe(1);
    expect(personalityKpi?.value).toBe(1);
    expect(totalKpi?.value).toBe(4);
  });

  it('should compute category distribution for doughnut chart', () => {
    const dist = service.categoryDistribution();
    expect(dist.length).toBe(3);

    const newsDist = dist.find((d) => d.label === 'Notícias');
    expect(newsDist?.count).toBe(2);
  });

  it('should rank authors by number of publications', () => {
    const ranking = service.authorsRanking();
    expect(ranking.length).toBeGreaterThan(0);

    // Prof. Silva published 1 news + 1 video + 1 personality = 3
    const topAuthor = ranking[0];
    expect(topAuthor.writer).toBe('Prof. Silva');
    expect(topAuthor.count).toBe(3);
    expect(topAuthor.newsCount).toBe(1);
    expect(topAuthor.videosCount).toBe(1);
    expect(topAuthor.personalitiesCount).toBe(1);
  });

  it('should filter items by type', () => {
    service.setType('video');
    const filtered = service.filteredContent();
    expect(filtered.length).toBe(1);
    expect(filtered[0].type).toBe('video');
  });

  it('should filter items by search term', () => {
    service.setSearch('quântico');
    const filtered = service.filteredContent();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Computador Quântico');
  });

  it('should clear all filters', () => {
    service.setType('video');
    service.setSearch('test');
    service.clearFilters();

    expect(service.activeType()).toBe('all');
    expect(service.searchTerm()).toBe('');
    expect(service.filteredContent().length).toBe(4);
  });
});

