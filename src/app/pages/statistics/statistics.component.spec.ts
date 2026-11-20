import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { StatisticsComponent } from './statistics.component';
import { StatisticsService } from './statistics.service';
import { FirestoreNewsService } from '../../../core/services/firestore-news.service';
import { FirestoreVideosService } from '../../../core/services/firestore-videos.service';
import { FirestorePersonalitiesService } from '../../../core/services/firestore-personalities.service';
import { AuthService } from '@app/core/auth/services/auth.service';
import { NavigationService } from '@app/services/navigation.service';
import { Role } from '@features/login/models/credentials.model';

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;

  const mockFirestoreNewsService = {
    getAllNews: () => of([]),
  };

  const mockFirestoreVideosService = {
    getAllVideos: () => of([]),
  };

  const mockFirestorePersonalitiesService = {
    getAllPersonalities: () => of([]),
  };

  const mockAuthService = {
    isAuthenticated: false,
    credentials: signal(null),
  };

  const mockNavigationService = {
    route: (path: string) => `/pt-br/${path}`,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideCharts(withDefaultRegisterables()),
        provideTransloco({
          config: {
            availableLangs: ['pt-br', 'en', 'es'],
            defaultLang: 'pt-br',
          },
        }),
        StatisticsService,
        { provide: FirestoreNewsService, useValue: mockFirestoreNewsService },
        { provide: FirestoreVideosService, useValue: mockFirestoreVideosService },
        { provide: FirestorePersonalitiesService, useValue: mockFirestorePersonalitiesService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: NavigationService, useValue: mockNavigationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize on tab index 0 (Visão Geral)', () => {
    expect(component.selectedTabIndex()).toBe(0);
  });

  it('should switch to details tab when switchToDetailsTab is called', () => {
    component.switchToDetailsTab();
    expect(component.selectedTabIndex()).toBe(1);
  });

  it('should update tab index on change', () => {
    component.onTabChange(2);
    expect(component.selectedTabIndex()).toBe(2);
  });
});

