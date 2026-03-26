import { Component, inject, OnInit } from "@angular/core";
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter } from "@angular/material/card";
import { VideoPlayerComponent } from "@app/shared/components/video-player/video-player.component";
import { FirestoreVideosService, Video } from "core/services/firestore-videos.service";
import { Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-video-detail',
    standalone: true,
    templateUrl: './video-detail.component.html',
    styleUrl: './video-detail.component.scss',
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, VideoPlayerComponent, MatCardFooter, CommonModule]
})
export class VideoDetailComponent implements OnInit {
    video$: Observable<Video | undefined>;
    private firestoreVideosService = inject(FirestoreVideosService);

  constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.video$ = this.firestoreVideosService.getVideoById(id);
        } else {
            console.error('ID do vídeo não encontrado na rota');
        }
    }
}