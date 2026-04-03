import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreNewsService, NewsPost } from '../../../core/services/firestore-news.service';
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
  personalitiesList$: Observable<NewsPost[]>;
  private firestoreNewsService = inject(FirestoreNewsService);

  constructor() {}

  ngOnInit(): void {
    this.loadPersonalities();
  }

  loadPersonalities(): void {
    this.personalitiesList$ = this.firestoreNewsService.getPersonalities();
  }
}