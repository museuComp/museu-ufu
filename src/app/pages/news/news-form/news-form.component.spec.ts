/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { NewsFormComponent } from './news-form.component';
import { FirestoreNewsService } from '../../../../core/services/firestore-news.service';
import { IMAGE_STORAGE } from '../../../../core/services/image-storage.contract';
import { NavigationService } from '@app/services/navigation.service';

describe('NewsFormComponent', () => {
  let component: NewsFormComponent;
  let fixture: ComponentFixture<NewsFormComponent>;

  let firestoreNewsServiceMock: {
    getNewsById: jasmine.Spy;
    addNews: jasmine.Spy;
    updateNews: jasmine.Spy;
  };

  let imageStorageMock: {
    uploadImage: jasmine.Spy;
    deleteImage: jasmine.Spy;
  };

  let routerMock: {
    navigate: jasmine.Spy;
  };

  let navigationServiceMock: {
    route: jasmine.Spy;
  };

  beforeEach(async () => {
    firestoreNewsServiceMock = {
      getNewsById: jasmine
        .createSpy('getNewsById')
        .and.returnValue(of(undefined)),

      addNews: jasmine
        .createSpy('addNews')
        .and.returnValue(Promise.resolve(undefined)),

      updateNews: jasmine
        .createSpy('updateNews')
        .and.returnValue(Promise.resolve(undefined))
    };

    imageStorageMock = {
      uploadImage: jasmine
        .createSpy('uploadImage')
        .and.returnValue(
          Promise.resolve({
            url: 'https://cdn.exemplo.com/news/imagem.webp',
            path: 'news/imagem.webp'
          })
        ),

      deleteImage: jasmine
        .createSpy('deleteImage')
        .and.returnValue(Promise.resolve())
    };

    routerMock = {
      navigate: jasmine
        .createSpy('navigate')
        .and.returnValue(Promise.resolve(true))
    };

    navigationServiceMock = {
      route: jasmine
        .createSpy('route')
        .and.callFake((path: string) => `/pt-br/${path}`)
    };

    await TestBed.configureTestingModule({
      imports: [NewsFormComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        },
        {
          provide: Router,
          useValue: routerMock
        },
        {
          provide: FirestoreNewsService,
          useValue: firestoreNewsServiceMock
        },
        {
          provide: IMAGE_STORAGE,
          useValue: imageStorageMock
        },
        {
          provide: NavigationService,
          useValue: navigationServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewsFormComponent);
    component = fixture.componentInstance;
  });

  it('deve persistir url e path da nova imagem antes de criar a noticia', async () => {
    const file = new File(
      ['conteudo-da-imagem'],
      'imagem.webp',
      { type: 'image/webp' }
    );

    component.newsForm.setValue({
      summaryTitle: 'Teste Storage',
      summaryDescription: 'Descrição válida para testar o armazenamento.',
      category: 'Notícias',
      mainImage: 'data:image/webp;base64,preview',
      writer: 'Guilherme'
    });

    component.selectedMainImageFile = file;

    await component.onSubmit();

    expect(imageStorageMock.uploadImage)
      .toHaveBeenCalledWith(file, 'news');

    expect(firestoreNewsServiceMock.addNews)
      .toHaveBeenCalledTimes(1);

    const newsData =
      firestoreNewsServiceMock.addNews.calls.mostRecent().args[0];

    expect(newsData.summary.mainImage)
      .toBe('https://cdn.exemplo.com/news/imagem.webp');

    expect(newsData.summary.mainImagePath)
      .toBe('news/imagem.webp');

    expect(firestoreNewsServiceMock.updateNews)
      .not.toHaveBeenCalled();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/pt-br/dashboard']);
  });

  it('deve preservar imagem e path existentes durante edicao sem novo arquivo', async () => {
    const existingImage =
      'https://cdn.exemplo.com/news/imagem-existente.webp';

    const existingImagePath =
      'news/news-123/imagem-existente.webp';

    component.isEditMode = true;
    component.newsId = 'news-123';
    component.existingMainImagePath = existingImagePath;

    component.newsForm.setValue({
      summaryTitle: 'Notícia existente',
      summaryDescription: 'Descrição válida da notícia que está sendo editada.',
      category: 'Notícias',
      mainImage: existingImage,
      writer: 'Guilherme'
    });

    component.selectedMainImageFile = null;

    await component.onSubmit();

    expect(imageStorageMock.uploadImage)
      .not.toHaveBeenCalled();

    expect(firestoreNewsServiceMock.updateNews)
      .toHaveBeenCalledTimes(1);

    const [newsId, newsData] =
      firestoreNewsServiceMock.updateNews.calls.mostRecent().args;

    expect(newsId).toBe('news-123');

    expect(newsData.summary.mainImage)
      .toBe(existingImage);

    expect(newsData.summary.mainImagePath)
      .toBe(existingImagePath);

    expect(firestoreNewsServiceMock.addNews)
      .not.toHaveBeenCalled();
  });

  it('deve manter compatibilidade com noticia legada sem mainImagePath', async () => {
    const existingImage =
      'data:image/webp;base64,imagem-legada';

    component.isEditMode = true;
    component.newsId = 'news-legada';
    component.existingMainImagePath = null;

    component.newsForm.setValue({
      summaryTitle: 'Notícia legada',
      summaryDescription:
        'Descrição válida para testar compatibilidade com notícia antiga.',
      category: 'Notícias',
      mainImage: existingImage,
      writer: 'Guilherme'
    });

    component.selectedMainImageFile = null;

    await component.onSubmit();

    expect(imageStorageMock.uploadImage)
      .not.toHaveBeenCalled();

    expect(firestoreNewsServiceMock.updateNews)
      .toHaveBeenCalledTimes(1);

    const [newsId, newsData] =
      firestoreNewsServiceMock.updateNews.calls.mostRecent().args;

    expect(newsId)
      .toBe('news-legada');

    expect(newsData.summary.mainImage)
      .toBe(existingImage);

    expect(
      Object.prototype.hasOwnProperty.call(
        newsData.summary,
        'mainImagePath'
      )
    ).toBeFalse();

    expect(firestoreNewsServiceMock.addNews)
      .not.toHaveBeenCalled();
  });

  it('nao deve salvar noticia quando o upload da imagem falhar', async () => {
    spyOn(console, 'error');

    imageStorageMock.uploadImage.and.returnValue(
      Promise.reject(new Error('Falha simulada no upload'))
    );

    const file = new File(
      ['conteudo-da-imagem'],
      'imagem.webp',
      { type: 'image/webp' }
    );

    component.newsForm.setValue({
      summaryTitle: 'Teste de erro',
      summaryDescription: 'Descrição válida para testar uma falha no upload.',
      category: 'Notícias',
      mainImage: 'data:image/webp;base64,preview',
      writer: 'Guilherme'
    });

    component.selectedMainImageFile = file;

    await component.onSubmit();

    expect(imageStorageMock.uploadImage)
      .toHaveBeenCalledWith(file, 'news');

    expect(firestoreNewsServiceMock.addNews)
      .not.toHaveBeenCalled();

    expect(firestoreNewsServiceMock.updateNews)
      .not.toHaveBeenCalled();

    expect(component.mainImageError)
      .toBe(
        'Não foi possível salvar a notícia ou enviar a imagem. Tente novamente.'
      );
  });
});