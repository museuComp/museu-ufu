import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { StatisticsService } from './statistics.service';
import { StatKpiCardsComponent } from './components/stat-kpi-cards/stat-kpi-cards.component';
import { StatChartsComponent } from './components/stat-charts/stat-charts.component';
import { StatRecentActivityComponent } from './components/stat-recent-activity/stat-recent-activity.component';
import { StatFiltersComponent } from './components/stat-filters/stat-filters.component';
import { StatDetailTableComponent } from './components/stat-detail-table/stat-detail-table.component';
import { StatLookerComponent } from './components/stat-looker/stat-looker.component';

@Component({
  selector: 'app-statistics',
  imports: [
    MatTabsModule,
    MatIconModule,
    TranslocoPipe,
    StatKpiCardsComponent,
    StatChartsComponent,
    StatRecentActivityComponent,
    StatFiltersComponent,
    StatDetailTableComponent,
    StatLookerComponent,
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent {
  readonly stats = inject(StatisticsService);

  readonly selectedTabIndex = signal<number>(0);

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
  }

  switchToDetailsTab(): void {
    this.selectedTabIndex.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
