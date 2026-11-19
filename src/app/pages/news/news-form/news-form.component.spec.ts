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

    expect(imageStorageMock.deleteImage)
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
      summaryDescription:
        'Descrição válida da notícia que está sendo editada.',
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
      .toBe('news-123');

    expect(newsData.summary.mainImage)
      .toBe(existingImage);

    expect(newsData.summary.mainImagePath)
      .toBe(existingImagePath);

    expect(firestoreNewsServiceMock.addNews)
      .not.toHaveBeenCalled();

    expect(imageStorageMock.deleteImage)
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

    expect(imageStorageMock.deleteImage)
      .not.toHaveBeenCalled();
  });

  it('deve excluir imagem anterior somente apos atualizar a noticia', async () => {
    const oldImage =
      'https://cdn.exemplo.com/news/imagem-antiga.webp';

    const oldImagePath =
      'news/news-123/imagem-antiga.webp';

    component.isEditMode = true;
    component.newsId = 'news-123';
    component.existingMainImagePath = oldImagePath;

    component.newsForm.setValue({
      summaryTitle: 'Notícia atualizada',
      summaryDescription:
        'Descrição válida para testar substituição segura.',
      category: 'Notícias',
      mainImage: oldImage,
      writer: 'Guilherme'
    });

    const file = new File(
      ['nova-imagem'],
      'nova-imagem.webp',
      { type: 'image/webp' }
    );

    let resolveUpdate!: () => void;

    firestoreNewsServiceMock.updateNews.and.returnValue(
      new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      })
    );

    component.selectedMainImageFile = file;

    const submitPromise = component.onSubmit();

    // Libera as continuações assíncronas do upload para que
    // o fluxo chegue ao updateNews(), que permanece pendente.
    await Promise.resolve();
    await Promise.resolve();

    expect(imageStorageMock.uploadImage)
      .toHaveBeenCalledWith(file, 'news');

    expect(firestoreNewsServiceMock.updateNews)
      .toHaveBeenCalledTimes(1);

    // Enquanto o Firestore ainda não confirmou a atualização,
    // a imagem antiga não pode ser excluída.
    expect(imageStorageMock.deleteImage)
      .not.toHaveBeenCalled();

    // Simula a confirmação bem-sucedida do Firestore.
    resolveUpdate();

    await submitPromise;

    // Somente depois da persistência bem-sucedida
    // a imagem antiga pode ser removida.
    expect(imageStorageMock.deleteImage)
      .toHaveBeenCalledOnceWith(oldImagePath);

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/pt-br/dashboard']);
  });

  it('deve substituir imagem de noticia legada sem tentar excluir path inexistente', async () => {
    component.isEditMode = true;
    component.newsId = 'news-legada';
    component.existingMainImagePath = null;

    component.newsForm.setValue({
      summaryTitle: 'Notícia legada',
      summaryDescription:
        'Descrição válida para testar substituição em notícia antiga.',
      category: 'Notícias',
      mainImage: 'data:image/webp;base64,imagem-antiga',
      writer: 'Guilherme'
    });

    const file = new File(
      ['nova-imagem'],
      'nova-imagem.webp',
      { type: 'image/webp' }
    );

    component.selectedMainImageFile = file;

    await component.onSubmit();

    expect(imageStorageMock.uploadImage)
      .toHaveBeenCalledWith(file, 'news');

    expect(firestoreNewsServiceMock.updateNews)
      .toHaveBeenCalledTimes(1);

    const [, newsData] =
      firestoreNewsServiceMock.updateNews.calls.mostRecent().args;

    expect(newsData.summary.mainImage)
      .toBe('https://cdn.exemplo.com/news/imagem.webp');

    expect(newsData.summary.mainImagePath)
      .toBe('news/imagem.webp');

    expect(imageStorageMock.deleteImage)
      .not.toHaveBeenCalled();
  });

  it('deve remover nova imagem quando atualizacao da noticia falhar', async () => {
    spyOn(console, 'error');

    const oldImagePath =
      'news/news-123/imagem-antiga.webp';

    component.isEditMode = true;
    component.newsId = 'news-123';
    component.existingMainImagePath = oldImagePath;

    component.newsForm.setValue({
      summaryTitle: 'Notícia com falha',
      summaryDescription:
        'Descrição válida para testar compensação após falha.',
      category: 'Notícias',
      mainImage:
        'https://cdn.exemplo.com/news/imagem-antiga.webp',
      writer: 'Guilherme'
    });

    const file = new File(
      ['nova-imagem'],
      'nova-imagem.webp',
      { type: 'image/webp' }
    );

    component.selectedMainImageFile = file;

    firestoreNewsServiceMock.updateNews
      .and.returnValue(
        Promise.reject(
          new Error('Falha simulada no Firestore')
        )
      );

    await component.onSubmit();

    expect(imageStorageMock.uploadImage)
      .toHaveBeenCalledWith(file, 'news');

    expect(firestoreNewsServiceMock.updateNews)
      .toHaveBeenCalledTimes(1);

    // Como a persistência falhou, o arquivo recém-enviado
    // deve ser removido para não ficar órfão no storage.
    expect(imageStorageMock.deleteImage)
      .toHaveBeenCalledOnceWith('news/imagem.webp');

    // A imagem antiga continua sendo a referência válida
    // da notícia e, portanto, não pode ser apagada.
    expect(imageStorageMock.deleteImage)
      .not.toHaveBeenCalledWith(oldImagePath);

    expect(component.mainImageError)
      .toBe(
        'Não foi possível salvar a notícia ou enviar a imagem. Tente novamente.'
      );
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
      summaryDescription:
        'Descrição válida para testar uma falha no upload.',
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

    expect(imageStorageMock.deleteImage)
      .not.toHaveBeenCalled();

    expect(component.mainImageError)
      .toBe(
        'Não foi possível salvar a notícia ou enviar a imagem. Tente novamente.'
      );
  });
});