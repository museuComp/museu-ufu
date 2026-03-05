import { Component, computed, inject, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AuthService } from '@app/core/auth/services/auth.service';
import { FirestoreNewsService, NewsPost } from 'core/services/firestore-news.service';
import { FirestoreVideosService, Video } from 'core/services/firestore-videos.service';
import { Role } from '@app/features/login/models/credentials.model';
import { FireStorageImagesService } from 'core/services/firestorage-images.service';

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
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  newsList$!: Observable<NewsPost[]>;
  videoList$!: Observable<Video[]>;
  currentView: string;

  authService = inject(AuthService);
  private firestoreNewsService = inject(FirestoreNewsService);
  private firestoreVideoService = inject(FirestoreVideosService);
  private firestoreImageService = inject(FireStorageImagesService);

  private router = inject(Router);
  private dialog = inject(MatDialog);

  constructor() { }

  // --- Propriedades de Autenticação ---
  user = this.authService.credentials;
  isAdmin = computed(() => this.user()?.role === Role.ADMIN);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {

    console.log('Dados do usuário no Dashboard:', this.user());

    // if (this.isAdmin()) {
      this.newsList$ = this.firestoreNewsService.getAllNews();
      this.currentView = 'news';
    // }
  }

  editNews(newsItem: NewsPost): void {
    this.router.navigate(['/news/edit', newsItem.id]);
  }

  editVideo(videoItem: Video): void {
    this.router.navigate(['/video/edit', videoItem.id]);
  }

  deleteNews(newsItem: NewsPost): void {
    if (!newsItem.id) {
      console.error('News item ID is undefined, cannot delete');
      return;
    }
    const dialogRef = this.dialog.open(DashboardDeleteConfirmDialog, {
      width: '350px', // Largura do modal
      data: { title: newsItem.summary.title } // Passa o título da notícia para o modal
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.firestoreNewsService.deleteNews(newsItem.id!)
          .then(() => {
            console.log('Notícia deletada com sucesso!');
          })
          .catch(error => console.error('Erro ao deletar notícia:', error));
      }
    });
  }

  deleteVideo(videoItem: Video): void {
    if (!videoItem.id) {
      console.error('Video item ID is undefined, cannot delete');
      return;
    }
    const dialogRef = this.dialog.open(DashboardDeleteConfirmDialog, {
      width: '350px',
      data: { title: videoItem.summary.title } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.firestoreVideoService.deleteVideo(videoItem.id)
          .then(() => {
            console.log('Vídeo deletado com sucesso!');
          })
          .catch(error => console.error('Erro ao deletar vídeo:', error));

        this.firestoreImageService.deleteImage(videoItem.summary.coverPath);
      }
    });
    
  }

  toggleView(): void {
    if(this.currentView == 'news') this.currentView = 'video';
    else this.currentView = 'news';
  }
}

// --- Componente de Diálogo ---
@Component({
  selector: 'dashboard-delete-confirm-dialog',
  template: `
    <h2 mat-dialog-title>Confirmar exclusão</h2>
    <mat-dialog-content>
      <p>Tem certeza que deseja excluir a notícia "{{data.title}}"?</p>
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