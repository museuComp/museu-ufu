import { Component, inject, OnInit } from '@angular/core';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { ContentSectionComponent } from "@app/shared/components/content-section/content-section.component";
import { FirestorePersonalitiesService, PersonalityPost } from 'core/services/firestore-personalities.service';
import { FirestoreVideosService, Video } from 'core/services/firestore-videos.service';
import { Observable } from 'rxjs';
import { magazines } from '../magazine/magazine.mock';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { posters } from './posters.mock';
import { MatIcon } from '@angular/material/icon';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-resources',
  imports: [CommonModule, ContentSectionComponent, RouterLink, MatCard, MatCardTitle, MatIcon],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.scss'
})
export class ResourcesComponent implements OnInit {
  private videoService = inject(FirestoreVideosService);
  private personalitiesService = inject(FirestorePersonalitiesService);
  readonly nav = inject(NavigationService);
  
  revistas = magazines;
  posteres = posters;
  showModal = false;
  modalPath:string;

  private limit = 3;

  personalitiesList$: Observable<PersonalityPost[]>;
  videosList$: Observable<Video[]>;

  ngOnInit(): void {
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