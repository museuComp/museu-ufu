import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FirestorePersonalitiesService, PersonalityPost } from '../../../core/services/firestore-personalities.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-personalities',
  templateUrl: './personalities.component.html',
  styleUrls: ['./personalities.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    RouterModule
  ]
})
export class PersonalitiesComponent implements OnInit {
  personalitiesList$: Observable<PersonalityPost[]>;
  
  // Injetando o novo serviço
  private firestorePersonalitiesService = inject(FirestorePersonalitiesService);

  constructor() {}

  ngOnInit(): void {
    this.loadPersonalities();
  }

  loadPersonalities(): void {
    // Usando o método getAllPersonalities do serviço novo
    this.personalitiesList$ = this.firestorePersonalitiesService.getAllPersonalities();
  }
}