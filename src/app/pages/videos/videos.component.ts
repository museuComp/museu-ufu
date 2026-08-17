import { Component, inject, OnInit } from '@angular/core';
import { MatCard } from "@angular/material/card";
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Observable } from 'rxjs';
import { FirestoreVideosService, Video } from 'core/services/firestore-videos.service';
import { AboutRoutingModule } from "../about/about-routing.module";
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [MatCard, CommonModule, AboutRoutingModule],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.scss'
})
export class VideosComponent implements OnInit{
  videosList$: Observable<Video[]>;

  firestoreVideoService = inject(FirestoreVideosService);
  readonly nav = inject(NavigationService);

  ngOnInit(): void {
    this.videosList$ = this.firestoreVideoService.getAllVideos();
  }
}