import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "@app/core/auth/services/auth.service";
import { Role } from "@app/features/login/models/credentials.model";
import { FirestoreNewsService, NewsPost } from "core/services/firestore-news.service";
import { Observable, Subscription } from "rxjs";
import { DashboardDeleteConfirmDialog } from "../dashboard.component";
import { FirestoreVideosService, Video } from "core/services/firestore-videos.service";

@Component({
  selector: 'app-news-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatDialogModule,
    RouterLink,
    ],
  templateUrl: './videos-dashboard.component.html',
  styleUrl: './videos-dashboard.component.scss'
})
export class VideosDashboardComponent implements OnInit,OnDestroy {
    videosList$!: Observable<Video[]>;
    videosItems: Video[] = [];

    isLoading = true;
    isUpdatingOrder = false;

    private videosSubscription?: Subscription;
    authService = inject(AuthService);
    private firestoreVideoService = inject(FirestoreVideosService);

    private router = inject(Router);
    private dialog = inject(MatDialog);

    user = this.authService.credentials;
    isAdmin = computed(() => this.user()?.role === Role.ADMIN);

    ngOnInit(): void {
        if (this.isAdmin()) {
            this.videosList$ = this.firestoreVideoService.getAllVideos();
            this.videosSubscription = this.firestoreVideoService.getAllVideos().subscribe(videos => {
                // Ignora a atualização visual se estiver salvando a ordem
                if (this.isUpdatingOrder) return; 
            
                this.videosItems = videos.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                this.isLoading = false;
            });
        }
    }

    async saveNewOrder(): Promise<void> {
        this.isUpdatingOrder = true; // Liga a trava
        try {
        const updatePromises = this.videosItems.map((video, index) => {
            if (!video.id) return Promise.resolve();
            return this.firestoreVideoService.updateVideoPost(video.id, { order: index });
        });

        await Promise.all(updatePromises);
        console.log('Ordem dos videos atualizada com sucesso!');
        } catch (error) {
        console.error('Erro ao atualizar ordem dos videos:', error);
        } finally {
        this.isUpdatingOrder = false; // Desliga a trava após salvar tudo
        }
    }

    onDrop(event: CdkDragDrop<Video[]>): void {
        moveItemInArray(this.videosItems, event.previousIndex, event.currentIndex);
        this.saveNewOrder();
    }

    editVideo(videoItem: Video): void {
        this.router.navigate(['/videos/edit', videoItem.id]);
    }

    deleteVideo(videoItem: Video): void {
        if (!videoItem.id) return;
        const dialogRef = this.dialog.open(DashboardDeleteConfirmDialog, {
          width: '350px',
          data: { title: videoItem.summary.title }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result === true) {
            this.firestoreVideoService.deleteVideo(videoItem.id!)
              .then(() => console.log('Vídeo deletada!'))
              .catch(error => console.error('Erro:', error));
          }
        });
    }

    trackByVideoId(index: number, video: Video): string {
        return video.id || index.toString();
    }

    ngOnDestroy(): void {
        
    }
}