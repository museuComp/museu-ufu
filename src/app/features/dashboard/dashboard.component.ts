import { Component, computed, inject, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '@app/core/auth/services/auth.service';
import { FirestoreNewsService, NewsPost } from '../../../core/services/firestore-news.service';
import { FirestoreVideosService, Video } from '../../../core/services/firestore-videos.service';
import { Role } from '@app/features/login/models/credentials.model';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatListModule,
    MatDividerModule,
    MatDialogModule,
    DragDropModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  newsList$!: Observable<NewsPost[]>;
  videoList$!: Observable<Video[]>;
  
  newsItems: NewsPost[] = [];
  videoItems: Video[] = [];

  currentView: string;
  isLoading = true;
  
  // NOVA VARIÁVEL: Trava de atualização
  isUpdatingOrder = false; 
  
  private newsSubscription?: Subscription;
  private videoSubscription?: Subscription;

  authService = inject(AuthService);
  private firestoreNewsService = inject(FirestoreNewsService);
  private firestoreVideoService = inject(FirestoreVideosService);

  private router = inject(Router);
  private dialog = inject(MatDialog);

  constructor() { }

  user = this.authService.credentials;
  isAdmin = computed(() => this.user()?.role === Role.ADMIN);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.newsList$ = this.firestoreNewsService.getAllNews();
      this.videoList$ = this.firestoreVideoService.getAllVideos();
      this.currentView = 'news';

      this.newsSubscription = this.firestoreNewsService.getAllNews().subscribe(news => {
        // Ignora a atualização visual se estiver salvando a ordem
        if (this.isUpdatingOrder) return; 
        
        this.newsItems = news.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        this.isLoading = false;
      });

      this.videoSubscription = this.firestoreVideoService.getAllVideos().subscribe(videos => {
        // Ignora a atualização visual se estiver salvando a ordem
        if (this.isUpdatingOrder) return; 

        this.videoItems = videos.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        this.isLoading = false;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.newsSubscription) {
      this.newsSubscription.unsubscribe();
    }
    if (this.videoSubscription) {
      this.videoSubscription.unsubscribe();
    }
  }

  // --- Funções de Drag & Drop para Notícias ---
  onDrop(event: CdkDragDrop<NewsPost[]>): void {
    moveItemInArray(this.newsItems, event.previousIndex, event.currentIndex);
    this.saveNewOrder();
  }

  async saveNewOrder(): Promise<void> {
    this.isUpdatingOrder = true; // Liga a trava
    try {
      const updatePromises = this.newsItems.map((news, index) => {
        if (!news.id) return Promise.resolve();
        return this.firestoreNewsService.updateNews(news.id, { order: index });
      });

      await Promise.all(updatePromises);
      console.log('Ordem das notícias atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar ordem das notícias:', error);
    } finally {
      this.isUpdatingOrder = false; // Desliga a trava após salvar tudo
    }
  }

  // --- Funções de Drag & Drop para Vídeos ---
  onVideoDrop(event: CdkDragDrop<Video[]>): void {
    moveItemInArray(this.videoItems, event.previousIndex, event.currentIndex);
    this.saveNewVideoOrder();
  }

  async saveNewVideoOrder(): Promise<void> {
    this.isUpdatingOrder = true; // Liga a trava
    try {
      const updatePromises = this.videoItems.map((video, index) => {
        if (!video.id) return Promise.resolve();
        return this.firestoreVideoService.updateVideoPost(video.id, { order: index });
      });

      await Promise.all(updatePromises);
      console.log('Ordem dos vídeos atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar ordem dos vídeos:', error);
    } finally {
      this.isUpdatingOrder = false; // Desliga a trava após salvar tudo
    }
  }

  // --- Funções de Edição e Exclusão ---
  editNews(newsItem: NewsPost): void {
    this.router.navigate(['/news/edit', newsItem.id]);
  }

  editVideo(videoItem: Video): void {
    this.router.navigate(['/videos/edit', videoItem.id]);
  }

  deleteNews(newsItem: NewsPost): void {
    if (!newsItem.id) return;
    const dialogRef = this.dialog.open(DashboardDeleteConfirmDialog, {
      width: '350px',
      data: { title: newsItem.summary.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.firestoreNewsService.deleteNews(newsItem.id!)
          .then(() => console.log('Notícia deletada!'))
          .catch(error => console.error('Erro:', error));
      }
    });
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
          .then(() => console.log('Vídeo deletado!'))
          .catch(error => console.error('Erro:', error));
      }
    });
  }

  toggleView(): void {
    if(this.currentView == 'news') this.currentView = 'video';
    else this.currentView = 'news';
  }

  trackByNewsId(index: number, news: NewsPost): string {
    return news.id || index.toString();
  }

  trackByVideoId(index: number, video: Video): string {
    return video.id || index.toString();
  }
}

@Component({
  selector: 'dashboard-delete-confirm-dialog',
  template: `
    <h2 mat-dialog-title>Confirmar exclusão</h2>
    <mat-dialog-content>
      <p>Tem certeza que deseja excluir a publicação "{{data.title}}"?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancelar</button>
      <button mat-button color="warn" (click)="onYesClick()">Excluir</button>
    </mat-dialog-actions>
    `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class DashboardDeleteConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<DashboardDeleteConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) { }

  onNoClick(): void { this.dialogRef.close(false); }
  onYesClick(): void { this.dialogRef.close(true); }
}