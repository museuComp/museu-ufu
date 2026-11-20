import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatDivider, MatListModule } from "@angular/material/list";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "@app/core/auth/services/auth.service";
import { Role } from "@app/features/login/models/credentials.model";
import { FirestoreNewsService, NewsPost } from "core/services/firestore-news.service";
import { IMAGE_STORAGE } from 'core/services/image-storage.contract';
import { Observable, Subscription } from "rxjs";
import { DashboardDeleteConfirmDialog } from "../dashboard.component";
import { NavigationService } from "@app/services/navigation.service";

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
    MatDividerModule,
    MatDialogModule,
    RouterLink,
    ],
  templateUrl: './news-dashboard.component.html',
  styleUrl: './news-dashboard.component.scss'
})
export class NewsDashboardComponent implements OnInit,OnDestroy {
    newsList$!: Observable<NewsPost[]>;
    newsItems: NewsPost[] = [];

    isLoading = true;
    isUpdatingOrder = false;

    private newsSubscription?: Subscription;
    authService = inject(AuthService);
    readonly nav = inject(NavigationService);
    private firestoreNewsService = inject(FirestoreNewsService);
    private imageStorage = inject(IMAGE_STORAGE);

    private router = inject(Router);
    private dialog = inject(MatDialog);

    user = this.authService.credentials;
    isAdmin = computed(() => this.user()?.role === Role.ADMIN);

    ngOnInit(): void {
        if (this.isAdmin()) {
            this.newsList$ = this.firestoreNewsService.getAllNews();
            this.newsSubscription = this.firestoreNewsService.getAllNews().subscribe(news => {
                // Ignora a atualização visual se estiver salvando a ordem
                if (this.isUpdatingOrder) return; 
            
                this.newsItems = news.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                this.isLoading = false;
            });
        }
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

    onDrop(event: CdkDragDrop<NewsPost[]>): void {
        moveItemInArray(this.newsItems, event.previousIndex, event.currentIndex);
        this.saveNewOrder();
    }

    editNews(newsItem: NewsPost): void {
        this.router.navigate([this.nav.route('/news/edit/' + newsItem.id)]);
    }

    deleteNews(newsItem: NewsPost): void {
      const newsId = newsItem.id;

      if (!newsId) return;

      const dialogRef = this.dialog.open(DashboardDeleteConfirmDialog, {
        width: '350px',
        data: { title: newsItem.summary.title }
      });

      dialogRef.afterClosed().subscribe(async result => {
        if (result !== true) return;

        try {
          // Primeiro remove o documento do Firestore.
          // Dessa forma, uma falha no Firestore nunca apaga a imagem
          // de uma notícia que continua existente.
          await this.firestoreNewsService.deleteNews(newsId);

          const mainImagePath = newsItem.summary.mainImagePath;

          // Notícias antigas podem não possuir mainImagePath.
          if (mainImagePath) {
            try {
              await this.imageStorage.deleteImage(mainImagePath);
            } catch (cleanupError) {
              // A notícia já foi removida do Firestore.
              // Uma falha de limpeza não deve reverter a exclusão.
              console.error(
                'Notícia excluída, mas não foi possível remover a imagem associada:',
                cleanupError
              );
            }
          }

          console.log('Notícia deletada!');
        } catch (error) {
          console.error('Erro ao excluir notícia:', error);
        }
      });
    }

    trackByNewsId(index: number, news: NewsPost): string {
        return news.id || index.toString();
    }

    ngOnDestroy(): void {
        if (this.newsSubscription) {
            this.newsSubscription.unsubscribe();
        }
    }
}