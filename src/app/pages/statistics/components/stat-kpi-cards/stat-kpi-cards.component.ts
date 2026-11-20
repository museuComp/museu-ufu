import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { TranslocoPipe } from '@jsverse/transloco';
import { StatKpi } from '../../models/statistics.models';

@Component({
  selector: 'app-stat-kpi-cards',
  imports: [MatIconModule, NgxSkeletonLoaderComponent, TranslocoPipe],
  templateUrl: './stat-kpi-cards.component.html',
  styleUrls: ['./stat-kpi-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatKpiCardsComponent {
  readonly kpis = input.required<StatKpi[]>();
  readonly isLoading = input<boolean>(false);
}

