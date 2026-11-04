import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnDestroy, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "@app/core/auth/services/auth.service";
import { Role } from "@app/features/login/models/credentials.model";

import { FirestoreMagazineService, Magazine } from "core/services/firestore-magazine.service";

import { Observable, Subscription } from "rxjs";
import { DashboardDeleteConfirmDialog } from "../dashboard.component";

@Component({
  selector: 'app-magazine-dashboard',
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
  templateUrl: './magazine-dashboard.component.html',
  styleUrl: './magazine-dashboard.component.scss'
})
export class MagazineDashboardComponent implements OnInit, OnDestroy {

  magazinesList$!: Observable<Magazine[]>;
  magazineItems: Magazine[] = [];

  isLoading = true;
  isUpdatingOrder = false;

  private magazineSubscription?: Subscription;

  authService = inject(AuthService);
  private firestoreMagazineService = inject(FirestoreMagazineService);

  private router = inject(Router);
  private dialog = inject(MatDialog);

  user = this.authService.credentials;
  isAdmin = computed(() => this.user()?.role === Role.ADMIN);

  ngOnInit(): void {
    if (this.isAdmin()) {

      this.magazinesList$ = this.firestoreMagazineService.getAllMagazines();

      this.magazineSubscription =
        this.firestoreMagazineService.getAllMagazines().subscribe(magazines => {

          if (this.isUpdatingOrder) return;

          this.magazineItems = magazines.sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          );

          this.isLoading = false;
        });
    }
  }

  async saveNewOrder(): Promise<void> {

    this.isUpdatingOrder = true;

    try {

      const updatePromises = this.magazineItems.map((magazine, index) => {

        if (!magazine.id) return Promise.resolve();

        return this.firestoreMagazineService.updateMagazine(
          magazine.id,
          { order: index }
        );

      });

      await Promise.all(updatePromises);

      console.log("Ordem das revistas atualizada com sucesso!");

    } catch (error) {

      console.error("Erro ao atualizar ordem das revistas:", error);

    } finally {

      this.isUpdatingOrder = false;

    }
  }

  onDrop(event: CdkDragDrop<Magazine[]>): void {

    moveItemInArray(
      this.magazineItems,
      event.previousIndex,
      event.currentIndex
    );

    this.saveNewOrder();
  }

  editMagazine(magazine: Magazine): void {

    this.router.navigate(['/magazine/edit', magazine.id]);

  }

  deleteMagazine(magazine: Magazine): void {

    if (!magazine.id) return;

    const dialogRef = this.dialog.open(
      DashboardDeleteConfirmDialog,
      {
        width: '350px',
        data: { title: magazine.title }
      }
    );

    dialogRef.afterClosed().subscribe(result => {

      if (result === true) {

        this.firestoreMagazineService.deleteMagazine(magazine.id!)
          .then(() => console.log('Revista deletada!'))
          .catch(error => console.error('Erro:', error));

      }

    });

  }

  trackByMagazineId(index: number, magazine: Magazine): string {

    return magazine.id || index.toString();

  }

  ngOnDestroy(): void {

    if (this.magazineSubscription) {

      this.magazineSubscription.unsubscribe();

    }

  }

}