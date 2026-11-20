import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { CategoryData, TemporalData } from '../../models/statistics.models';

@Component({
  selector: 'app-stat-charts',
  imports: [BaseChartDirective, MatProgressSpinnerModule, TranslocoPipe],
  templateUrl: './stat-charts.component.html',
  styleUrls: ['./stat-charts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatChartsComponent {
  readonly categoryData = input.required<CategoryData[]>();
  readonly temporalData = input.required<TemporalData[]>();
  readonly isLoading = input<boolean>(false);

  // Doughnut Chart Configuration
  readonly doughnutType: ChartType = 'doughnut';

  readonly doughnutChartData = computed<ChartData<'doughnut'>>(() => {
    const cats = this.categoryData();
    return {
      labels: cats.map((c) => c.label),
      datasets: [
        {
          data: cats.map((c) => c.count),
          backgroundColor: cats.map((c) => c.color),
          hoverBackgroundColor: cats.map((c) => c.color),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  });

  readonly hasDoughnutData = computed(() => {
    const data = this.doughnutChartData().datasets[0]?.data;
    if (!data) return false;
    return data.some((val) => typeof val === 'number' && val > 0);
  });

  readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          font: {
            size: 13,
            family: 'inherit',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const dataset = context.dataset;
            const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return ` ${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  // Stacked Bar Chart Configuration
  readonly barType: ChartType = 'bar';

  readonly barChartData = computed<ChartData<'bar'>>(() => {
    const temps = this.temporalData();
    return {
      labels: temps.map((t) => t.monthLabel),
      datasets: [
        {
          label: 'Notícias',
          data: temps.map((t) => t.news),
          backgroundColor: '#1351b4',
          borderRadius: 4,
        },
        {
          label: 'Vídeos',
          data: temps.map((t) => t.videos),
          backgroundColor: '#e53935',
          borderRadius: 4,
        },
        {
          label: 'Personalidades',
          data: temps.map((t) => t.personalities),
          backgroundColor: '#2e7d32',
          borderRadius: 4,
        },
      ],
    };
  });

  readonly hasBarData = computed(() => {
    return this.temporalData().length > 0;
  });

  readonly barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'inherit',
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            family: 'inherit',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          font: {
            size: 13,
            family: 'inherit',
          },
        },
      },
    },
  };
}

