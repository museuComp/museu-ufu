import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthorStat, ContentItem } from '../../models/statistics.models';

@Component({
  selector: 'app-stat-detail-table',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './stat-detail-table.component.html',
  styleUrls: ['./stat-detail-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatDetailTableComponent implements AfterViewInit {
  readonly items = input.required<ContentItem[]>();
  readonly authorsRanking = input.required<AuthorStat[]>();
  readonly displayedColumns: string[] = ['title', 'type', 'category', 'writer', 'createdAt', 'actions'];
  readonly dataSource = new MatTableDataSource<ContentItem>([]);

  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor() {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'title':
          return item.title.toLowerCase();
        case 'type':
          return item.type;
        case 'category':
          return item.category.toLowerCase();
        case 'writer':
          return item.writer.toLowerCase();
        case 'createdAt':
          return item.createdAt.getTime();
        default:
          return '';
      }
    };

    effect(() => {
      const data = this.items();
      this.dataSource.data = data;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'news':
        return 'newspaper';
      case 'video':
        return 'smart_display';
      case 'personality':
        return 'person';
      default:
        return 'article';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'news':
        return 'Notícia';
      case 'video':
        return 'Vídeo';
      case 'personality':
        return 'Personalidade';
      default:
        return 'Item';
    }
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

}

