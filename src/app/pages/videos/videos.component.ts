import { Component, inject, OnInit } from '@angular/core';
import { MatCard } from "@angular/material/card";
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Observable } from 'rxjs';
import { FirestoreVideosService, Video } from 'core/services/firestore-videos.service';
import { AboutRoutingModule } from "../about/about-routing.module";

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [MatCard, CommonModule, AboutRoutingModule, NgOptimizedImage],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.scss'
})
export class VideosComponent implements OnInit{
  videosList$: Observable<Video[]>;

  firestoreVideoService = inject(FirestoreVideosService);

  ngOnInit(): void {
    this.videosList$ = this.firestoreVideoService.getAllVideos();
  }
}