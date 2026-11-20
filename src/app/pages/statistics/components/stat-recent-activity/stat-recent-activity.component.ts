import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/es';
import { ContentItem } from '../../models/statistics.models';

dayjs.extend(relativeTime);

@Component({
  selector: 'app-stat-recent-activity',
  imports: [RouterLink, MatIconModule, TranslocoPipe],
  templateUrl: './stat-recent-activity.component.html',
  styleUrls: ['./stat-recent-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatRecentActivityComponent {
  private readonly transloco = inject(TranslocoService);

  readonly items = input.required<ContentItem[]>();
  readonly limit = input<number>(5);
  readonly showViewAll = input<boolean>(false);
  readonly viewAllClicked = output<void>();

  readonly displayedItems = computed(() => {
    return this.items().slice(0, this.limit());
  });

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

  formatRelativeTime(date: Date): string {
    const lang = this.transloco.getActiveLang();
    const locale = lang === 'pt-br' ? 'pt-br' : lang === 'es' ? 'es' : 'en';
    return dayjs(date).locale(locale).fromNow();
  }

  onViewAll(): void {
    this.viewAllClicked.emit();
  }
}

