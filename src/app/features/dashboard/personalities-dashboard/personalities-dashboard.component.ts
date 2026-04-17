import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component, computed, EventEmitter, inject, OnDestroy, OnInit, Output } from "@angular/core";
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
import { Observable, Subscription } from "rxjs";
import { DashboardDeleteConfirmDialog } from "../dashboard.component";

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
  templateUrl: './personalities-dashboard.component.html',
  styleUrl: './personalities-dashboard.component.scss'
})
export class PersonalitiesDashboardComponent implements OnInit,OnDestroy {
    @Output() lengthEvent = new EventEmitter<number>();

    personalitiesList$!: Observable<NewsPost[]>;
    personalitiesItems: NewsPost[] = [];

    isLoading = true;
    isUpdatingOrder = false;

    private personalitiesSubscription?: Subscription;
    authService = inject(AuthService);
    private firestoreNewsService = inject(FirestoreNewsService);

    private router = inject(Router);
    private dialog = inject(MatDialog);

    user = this.authService.credentials;
    isAdmin = computed(() => this.user()?.role === Role.ADMIN);

    ngOnInit(): void {
        if (this.isAdmin()) {
            this.personalitiesList$ = this.firestoreNewsService.getPersonalities();
            this.personalitiesSubscription = this.firestoreNewsService.getPersonalities().subscribe(p => {
                // Ignora a atualização visual se estiver salvando a ordem
                if (this.isUpdatingOrder) return; 
            
                this.personalitiesItems = p.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                this.isLoading = false;
            });
        }
    }

    async saveNewOrder(): Promise<void> {
        this.isUpdatingOrder = true; // Liga a trava
        try {
        const updatePromises = this.personalitiesItems.map((p, index) => {
            if (!p.id) return Promise.resolve();
            return this.firestoreNewsService.updateNews(p.id, { order: index });
        });

        await Promise.all(updatePromises);
        console.log('Ordem das personalidades atualizada com sucesso!');
        } catch (error) {
        console.error('Erro ao atualizar ordem das personalidades:', error);
        } finally {
        this.isUpdatingOrder = false; // Desliga a trava após salvar tudo
        }
    }

    onDrop(event: CdkDragDrop<NewsPost[]>): void {
        moveItemInArray(this.personalitiesItems, event.previousIndex, event.currentIndex);
        this.saveNewOrder();
    }

    editNews(personalityItem: NewsPost): void {
        this.router.navigate(['/news/edit', personalityItem.id]);
    }

    deleteNews(personalityItem: NewsPost): void {
        if (!personalityItem.id) return;
        const dialogRef = this.dialog.open(DashboardDeleteConfirmDialog, {
          width: '350px',
          data: { title: personalityItem.summary.title }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result === true) {
            this.firestoreNewsService.deleteNews(personalityItem.id!)
              .then(() => console.log('Personalidade deletada!'))
              .catch(error => console.error('Erro:', error));
          }
        });
    }

    trackByPersonalityId(index: number, p: NewsPost): string {
        return p.id || index.toString();
    }

    ngOnDestroy(): void {
        if (this.personalitiesSubscription) {
            this.personalitiesSubscription.unsubscribe();
        }
    }
}