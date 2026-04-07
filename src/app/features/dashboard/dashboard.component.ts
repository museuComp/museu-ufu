import { Component, computed, inject, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
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
export class DashboardComponent implements OnInit {
  currentView: string;
  
  authService = inject(AuthService);
  private router = inject(Router);

  mapper = {
    '': 'Notícia',
    'news': 'Notícia',
    'videos': 'Vídeo',
  }

  user = this.authService.credentials;
  isAdmin = computed(() => this.user()?.role === Role.ADMIN);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.currentView = this.router.url.split('/')[2] || 'news';
    }
  }

  toggleView(type:string): void {
    this.currentView = type;
    this.router.navigate(['dashboard', type]);
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