import {Component, inject} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import {FirestoreNewsService, NewsPost} from '../../../core/services/firestore-news.service';
import { Observable } from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatIconButton} from '@angular/material/button';


@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatIconButton
  ],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.scss'
})
export class NewsDetailComponent {
  news$: Observable<NewsPost | undefined>; // Alterado para Observable
  private firestoreNewsService = inject(FirestoreNewsService);
  showImageModal = false;
  modalImageUrl: string | null = null;

  constructor(private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.news$ = this.firestoreNewsService.getNewsById(id);
    } else {
      // Tratar caso de ID não encontrado, talvez redirecionar
      console.error('ID da notícia não encontrado na rota');
    }
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
