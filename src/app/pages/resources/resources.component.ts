import { Component, inject, OnInit } from '@angular/core';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { ContentSectionComponent } from "@app/shared/components/content-section/content-section.component";
import { FirestoreNewsService, NewsPost } from 'core/services/firestore-news.service';
import { FirestoreVideosService, Video } from 'core/services/firestore-videos.service';
import { Observable } from 'rxjs';
import { magazines } from '../magazine/magazine.mock';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resources',
  imports: [CommonModule, ContentSectionComponent, RouterLink, MatCard, MatCardTitle],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.scss'
})
export class ResourcesComponent implements OnInit {
  private videoService = inject(FirestoreVideosService);
  private newsService = inject(FirestoreNewsService);
  
  revistas = magazines;

  private limit = 3;

  personalitiesList$: Observable<NewsPost[]>;
  videosList$: Observable<Video[]>;

  ngOnInit(): void {
    this.personalitiesList$ = this.newsService.getLimitedPersonalities(this.limit);
    this.videosList$ = this.videoService.getLimitedVideos(this.limit);
  }
}