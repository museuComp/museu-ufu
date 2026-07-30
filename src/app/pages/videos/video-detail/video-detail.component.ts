import { Component, inject, OnInit } from "@angular/core";
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter, MatCardActions } from "@angular/material/card";
import { VideoPlayerComponent } from "@app/shared/components/video-player/video-player.component";
import { FirestoreVideosService, Video } from "core/services/firestore-videos.service";
import { Observable, switchMap } from "rxjs";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { ShareButtonsComponent } from "@shared/components/share-buttons/share-buttons.component";

@Component({
    selector: 'app-video-detail',
    standalone: true,
    templateUrl: './video-detail.component.html',
    styleUrl: './video-detail.component.scss',
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, VideoPlayerComponent, MatCardFooter, CommonModule, MatCardActions, MatIcon, RouterLink, ShareButtonsComponent]
})
export class VideoDetailComponent implements OnInit {
    video$: Observable<Video | undefined>;
    prev$: Observable<Video | null>;
    next$: Observable<Video | null>;

    private firestoreVideosService = inject(FirestoreVideosService);

  constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.video$ = this.firestoreVideosService.getVideoById(id);
                this.prev$ = this.video$.pipe(
                    switchMap(video => this.firestoreVideosService.getPreviousVideo(video.order))
                );
                
                this.next$ = this.video$.pipe(
                        switchMap(video => this.firestoreVideosService.getNextVideo(video.order))
                        );
            } else {
                console.error('ID do vídeo não encontrado na rota');
            }
        });
    }
}