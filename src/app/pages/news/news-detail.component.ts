import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirestoreNewsService, NewsPost } from '../../../core/services/firestore-news.service';
import { Observable, switchMap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MarkdownModule } from 'ngx-markdown';
import { ReadingTimePipe } from '../../shared/pipes/reading-time/reading-time.pipe';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MarkdownModule,
    ReadingTimePipe
  ],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.scss'
})
export class NewsDetailComponent {
  news$: Observable<NewsPost | undefined>;
  prev$: Observable<NewsPost | null>;
  next$: Observable<NewsPost | null>;

  private firestoreNewsService = inject(FirestoreNewsService);
  showImageModal = false;
  modalImageUrl: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.news$ = this.firestoreNewsService.getNewsById(id);

        this.prev$ = this.news$.pipe(
          switchMap(news => this.firestoreNewsService.getPreviousNews(news!.order))
        );

        this.next$ = this.news$.pipe(
          switchMap(news => this.firestoreNewsService.getNextNews(news!.order))
        );
      } else {
        console.error('ID da notícia não encontrado na rota');
      }
    });
  }

  openImageModal(imageUrl: string): void {
    this.modalImageUrl = imageUrl;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.modalImageUrl = null;
  }

  onModalBackgroundClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('image-modal-overlay')) {
      this.closeImageModal();
    }
  }
}