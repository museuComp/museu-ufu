import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component, computed, EventEmitter, inject, OnDestroy, OnInit, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "@app/core/auth/services/auth.service";
import { Role } from "@app/features/login/models/credentials.model";
import { FirestorePersonalitiesService, PersonalityPost } from "../../../../core/services/firestore-personalities.service";
import { Observable, Subscription } from "rxjs";
import { DashboardDeleteConfirmDialog } from "../dashboard.component";
import { NavigationService } from "@app/services/navigation.service";

@Component({
  selector: 'app-personalities-dashboard', // Ajustei o seletor para evitar confusão
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
export class PersonalitiesDashboardComponent implements OnInit, OnDestroy {
  @Output() lengthEvent = new EventEmitter<number>();

  // Passando a usar PersonalityPost
  personalitiesList$!: Observable<PersonalityPost[]>;
  personalitiesItems: PersonalityPost[] = [];

  isLoading = true;
  isUpdatingOrder = false;

  private personalitiesSubscription?: Subscription;
  authService = inject(AuthService);
  readonly nav = inject(NavigationService);
  private firestorePersonalitiesService = inject(FirestorePersonalitiesService);

  private router = inject(Router);
  private dialog = inject(MatDialog);

  user = this.authService.credentials;
  isAdmin = computed(() => this.user()?.role === Role.ADMIN);

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.personalitiesList$ = this.firestorePersonalitiesService.getAllPersonalities();
      this.personalitiesSubscription = this.personalitiesList$.subscribe(p => {
        if (this.isUpdatingOrder) return; 

        this.personalitiesItems = p.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        this.isLoading = false;
      });
    }
  }

  async saveNewOrder(): Promise<void> {
    this.isUpdatingOrder = true;
    try {
      const updatePromises = this.personalitiesItems.map((p, index) => {
        if (!p.id) return Promise.resolve();
        // Usando o updatePersonality do serviço novo
        return this.firestorePersonalitiesService.updatePersonality(p.id, { order: index });
      });

      await Promise.all(updatePromises);
      console.log('Ordem das personalidades atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar ordem das personalidades:', error);
    } finally {
      this.isUpdatingOrder = false;
    }
  }

  onDrop(event: CdkDragDrop<PersonalityPost[]>): void {
    moveItemInArray(this.personalitiesItems, event.previousIndex, event.currentIndex);
    this.saveNewOrder();
  }

  editPersonality(personalityItem: PersonalityPost): void {
    // Redirecionando para a rota de edição de personalidades
    this.router.navigate([this.nav.route('personalities/edit/' + personalityItem.id)]);
  }

  deletePersonality(personalityItem: PersonalityPost): void {
    if (!personalityItem.id) return;
    const dialogRef = this.dialog.open(DashboardDeleteConfirmDialog, {
      width: '350px',
      data: { title: personalityItem.summary.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Usando o deletePersonality do serviço novo
        this.firestorePersonalitiesService.deletePersonality(personalityItem.id!)
          .then(() => console.log('Personalidade deletada!'))
          .catch(error => console.error('Erro:', error));
      }
    });
  }

  trackByPersonalityId(index: number, p: PersonalityPost): string {
    return p.id || index.toString();
  }

  ngOnDestroy(): void {
    if (this.personalitiesSubscription) {
      this.personalitiesSubscription.unsubscribe();
    }
  }
}