import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreNewsService, NewsPost } from '../../../core/services/firestore-news.service';
import { Observable } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    RouterModule
  ]
})
export class NewsComponent implements OnInit {
  readonly nav = inject(NavigationService);
  newsList$: Observable<NewsPost[]>;
  private firestoreNewsService = inject(FirestoreNewsService);

  constructor() {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.newsList$ = this.firestoreNewsService.getAllNews();
  }
}