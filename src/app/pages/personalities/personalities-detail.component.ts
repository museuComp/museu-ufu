import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirestorePersonalitiesService, PersonalityPost } from '../../../core/services/firestore-personalities.service';
import { Observable } from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatIconButton} from '@angular/material/button';
import { MarkdownModule } from 'ngx-markdown';
import { ShareButtonsComponent } from '@shared/components/share-buttons/share-buttons.component';
import { NavigationService } from '@app/services/navigation.service';

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
  personality$: Observable<PersonalityPost | undefined>;
  
  // Injetando o novo serviço
  private firestorePersonalitiesService = inject(FirestorePersonalitiesService);

  showImageModal = false;
  modalImageUrl: string | null = null;

  constructor(private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Usando o método getPersonalityById do serviço novo
      this.personality$ = this.firestorePersonalitiesService.getPersonalityById(id);
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