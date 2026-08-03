import { Component, inject, OnInit } from '@angular/core';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { ContentSectionComponent } from "@app/shared/components/content-section/content-section.component";

// 1. Removi o FirestoreNewsService e adicionei o FirestorePersonalitiesService
import { FirestorePersonalitiesService, PersonalityPost } from 'core/services/firestore-personalities.service';
import { FirestoreVideosService, Video } from 'core/services/firestore-videos.service';

import { Observable } from 'rxjs';
import { magazines } from '../magazine/magazine.mock';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { posters } from './posters.mock';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-resources',
  imports: [CommonModule, ContentSectionComponent, RouterLink, MatCard, MatCardTitle, MatIcon],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.scss'
})
export class ResourcesComponent implements OnInit {
  private videoService = inject(FirestoreVideosService);
  
  // 2. Injetando o novo serviço de personalidades
  private personalitiesService = inject(FirestorePersonalitiesService);
  
  revistas = magazines;
  posteres = posters;
  showModal = false;
  modalPath:string;

  private limit = 3;

  // 3. Atualizado de NewsPost[] para Personality[]
  personalitiesList$: Observable<PersonalityPost[]>;
  videosList$: Observable<Video[]>;

  ngOnInit(): void {
    // 4. Puxando os dados da coleção nova
    // ATENÇÃO: Dependendo de como você chamou o método no seu FirestorePersonalitiesService,
    // pode ser que seja getPersonalities(this.limit) ou getLimitedPersonalities(this.limit).
    // Substitua pelo nome correto do método no seu serviço:
    this.personalitiesList$ = this.personalitiesService.getLimitedPersonalities(this.limit); 
    
    this.videosList$ = this.videoService.getLimitedVideos(this.limit);
  }

  openModal(path:string): void {
    this.showModal = true;
    this.modalPath = path;
  }
  closeModal():void {
    this.showModal = false;
    this.modalPath = "";
  }
}