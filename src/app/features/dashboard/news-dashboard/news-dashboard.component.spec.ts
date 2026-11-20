/// <reference types="jasmine" />

import {
  fakeAsync,
  flushMicrotasks,
  TestBed
} from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { NewsDashboardComponent } from './news-dashboard.component';

import {
  FirestoreNewsService,
  NewsPost
} from '../../../../core/services/firestore-news.service';

import {
  IMAGE_STORAGE
} from '../../../../core/services/image-storage.contract';

import {
  AuthService
} from '../../../core/auth/services/auth.service';

import {
  NavigationService
} from '../../../services/navigation.service';

describe('NewsDashboardComponent', () => {
  let component: NewsDashboardComponent;

  let firestoreNewsServiceMock: {
    getAllNews: jasmine.Spy;
    updateNews: jasmine.Spy;
    deleteNews: jasmine.Spy;
  };

  let imageStorageMock: {
    uploadImage: jasmine.Spy;
    deleteImage: jasmine.Spy;
  };

  let dialogMock: {
    open: jasmine.Spy;
  };

  let navigationServiceMock: {
    route: jasmine.Spy;
  };

  const createNews = (
    mainImagePath?: string
  ): NewsPost => ({
    id: 'news-123',
    order: 0,
    summary: {
      title: 'Notícia de teste',
      description: 'Descrição da notícia usada nos testes.',
      category: 'Notícias',
      mainImage: 'https://cdn.exemplo.com/news/imagem.webp',
      ...(mainImagePath ? { mainImagePath } : {}),
      writer: 'Guilherme'
    },
    fullContent: [],
    createdAt: null
  });

  beforeEach(async () => {
    firestoreNewsServiceMock = {
      getAllNews: jasmine
        .createSpy('getAllNews')
        .and.returnValue(of([])),

      updateNews: jasmine
        .createSpy('updateNews')
        .and.returnValue(Promise.resolve()),

      deleteNews: jasmine
        .createSpy('deleteNews')
        .and.returnValue(Promise.resolve())
    };

    imageStorageMock = {
      uploadImage: jasmine
        .createSpy('uploadImage'),

      deleteImage: jasmine
        .createSpy('deleteImage')
        .and.returnValue(Promise.resolve())
    };

    dialogMock = {
      open: jasmine
        .createSpy('open')
        .and.returnValue({
          afterClosed: () => of(true)
        })
    };

    navigationServiceMock = {
      route: jasmine
        .createSpy('route')
        .and.callFake(
          (path: string) => `/pt-br/${path}`
        )
    };

    TestBed.configureTestingModule({
      imports: [
        NewsDashboardComponent
      ]
    });

    TestBed.overrideProvider(
      FirestoreNewsService,
      {
        useValue: firestoreNewsServiceMock
      }
    );

    TestBed.overrideProvider(
      IMAGE_STORAGE,
      {
        useValue: imageStorageMock
      }
    );

    TestBed.overrideProvider(
      MatDialog,
      {
        useValue: dialogMock
      }
    );

    TestBed.overrideProvider(
      AuthService,
      {
        useValue: {
          credentials: signal(null)
        }
      }
    );

    TestBed.overrideProvider(
      NavigationService,
      {
        useValue: navigationServiceMock
      }
    );

    await TestBed.compileComponents();

    const fixture =
      TestBed.createComponent(
        NewsDashboardComponent
      );

    component = fixture.componentInstance;
  });

  it(
    'deve excluir a notícia e a imagem associada quando mainImagePath existir',
    fakeAsync(() => {
      const news = createNews(
        'news/news-123/imagem.webp'
      );

      component.deleteNews(news);

      flushMicrotasks();

      expect(
        firestoreNewsServiceMock.deleteNews
      ).toHaveBeenCalledOnceWith(
        'news-123'
      );

      expect(
        imageStorageMock.deleteImage
      ).toHaveBeenCalledOnceWith(
        'news/news-123/imagem.webp'
      );
    })
  );

  it(
    'deve excluir notícia legada sem tentar remover imagem quando mainImagePath não existir',
    fakeAsync(() => {
      const news = createNews();

      component.deleteNews(news);

      flushMicrotasks();

      expect(
        firestoreNewsServiceMock.deleteNews
      ).toHaveBeenCalledOnceWith(
        'news-123'
      );

      expect(
        imageStorageMock.deleteImage
      ).not.toHaveBeenCalled();
    })
  );

  it(
    'não deve excluir a imagem quando a exclusão da notícia no Firestore falhar',
    fakeAsync(() => {
      spyOn(console, 'error');

      firestoreNewsServiceMock.deleteNews
        .and.returnValue(
          Promise.reject(
            new Error(
              'Falha simulada no Firestore'
            )
          )
        );

      const news = createNews(
        'news/news-123/imagem.webp'
      );

      component.deleteNews(news);

      flushMicrotasks();

      expect(
        firestoreNewsServiceMock.deleteNews
      ).toHaveBeenCalledOnceWith(
        'news-123'
      );

      expect(
        imageStorageMock.deleteImage
      ).not.toHaveBeenCalled();
    })
  );

  it(
    'deve manter a exclusão da notícia concluída mesmo quando a limpeza da imagem falhar',
    fakeAsync(() => {
      spyOn(console, 'error');

      imageStorageMock.deleteImage
        .and.returnValue(
          Promise.reject(
            new Error(
              'Falha simulada no storage'
            )
          )
        );

      const news = createNews(
        'news/news-123/imagem.webp'
      );

      component.deleteNews(news);

      flushMicrotasks();

      expect(
        firestoreNewsServiceMock.deleteNews
      ).toHaveBeenCalledOnceWith(
        'news-123'
      );

      expect(
        imageStorageMock.deleteImage
      ).toHaveBeenCalledOnceWith(
        'news/news-123/imagem.webp'
      );

      expect(
        console.error
      ).toHaveBeenCalled();
    })
  );
});