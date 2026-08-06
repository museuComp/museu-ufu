import {Component, inject} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import {FirestoreNewsService, NewsPost} from '../../../core/services/firestore-news.service';
import { Observable } from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatIconButton} from '@angular/material/button';
import { MarkdownModule } from 'ngx-markdown';
import { ShareButtonsComponent } from '@shared/components/share-buttons/share-buttons.component';

@Component({
  selector: 'app-personalities-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatIconButton,
    MarkdownModule,
    ShareButtonsComponent
  ],
  templateUrl: './personalities-detail.component.html',
  styleUrl: './personalities-detail.component.scss'
})
export class PersonalitiesDetailComponent {

  personality$: Observable<NewsPost | undefined>;
  private firestoreNewsService = inject(FirestoreNewsService);

  showImageModal = false;
  modalImageUrl: string | null = null;

  constructor(private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.personality$ = this.firestoreNewsService.getNewsById(id);
    } else {
      console.error('ID da personalidade não encontrado na rota');
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