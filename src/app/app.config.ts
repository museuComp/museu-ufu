import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  isDevMode,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';

import { routes } from '@app/app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { globalInterceptor } from '@core/interceptors/global-http.interceptor';
import { loadingInterceptor } from '@shared/components/loading/interceptors/loading.interceptor';
import { NoopScrollStrategy, Overlay } from '@angular/cdk/overlay';
import { DEFAULT_DIALOG_CONFIG, DIALOG_SCROLL_STRATEGY } from '@angular/cdk/dialog';
import { registerLocaleData } from '@angular/common';
import { CustomPageTitleStrategy } from '@core/strategy/title.strategy';
import localePt from '@angular/common/locales/pt';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getApps } from 'firebase/app';
import { env } from '../../enviroment';


registerLocaleData(localePt);

export function scrollFactory(overlay: Overlay): () => NoopScrollStrategy {
  return () => overlay.scrollStrategies.noop();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([globalInterceptor, loadingInterceptor]), withFetch()),
    provideAnimationsAsync(),
    provideEnvironmentNgxMask(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:3000',
    }),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    { provide: 'FIRESTORE_STANDARD',
      useFactory: () => getFirestore()},
    {
      provide: DEFAULT_DIALOG_CONFIG,
      useValue: { panelClass: 'dialog', hasBackdrop: true, autoFocus: false },
    },
    { provide: TitleStrategy, useClass: CustomPageTitleStrategy },
    {
      provide: DIALOG_SCROLL_STRATEGY,
      useFactory: scrollFactory,
      deps: [Overlay],
    },
    provideCharts(withDefaultRegisterables()),

    provideFirebaseApp(() => initializeApp({ projectId: "museu-ufu-news", appId: "1:560844053254:web:f6d19f08a3892c9c821c87", storageBucket: "museu-ufu-news.firebasestorage.app", apiKey: "AIzaSyCvRxmCP_nIZqSwksT4VZ41eVUa94PeVmk", authDomain: "museu-ufu-news.firebaseapp.com", messagingSenderId: "560844053254", measurementId: "G-B06W8DT2CT" })),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

    {
      provide: "FIRESTORE_VIDEOS",
      useFactory: () => {
        const app = getApps().find(app => app.name === 'videosApp') ||
          initializeApp({
              apiKey: env.API_KEY_FIRESTORE_VIDEOS,
              authDomain: "museu-comp-ufu.firebaseapp.com",
              projectId: "museu-comp-ufu",
              storageBucket: "museu-comp-ufu.firebasestorage.app",
              messagingSenderId: "306806823828",
              appId: "1:306806823828:web:44e2b2ee486a1441554d81"
            }, 'videosApp');
        return getFirestore(app);
      }
    },
  ],
};