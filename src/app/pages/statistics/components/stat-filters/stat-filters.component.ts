import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContentType, PeriodFilter } from '../../models/statistics.models';

@Component({
  selector: 'app-stat-filters',
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, MatIconModule, TranslocoPipe],
  templateUrl: './stat-filters.component.html',
  styleUrls: ['./stat-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatFiltersComponent {
  readonly activePeriod = input.required<PeriodFilter>();
  readonly activeType = input.required<ContentType | 'all'>();
  readonly activeCategory = input.required<string>();
  readonly searchTerm = input.required<string>();
  readonly categories = input.required<string[]>();

  readonly periodChange = output<PeriodFilter>();
  readonly typeChange = output<ContentType | 'all'>();
  readonly categoryChange = output<string>();
  readonly searchChange = output<string>();
  readonly resetFilters = output<void>();

  onPeriodChange(event: MatSelectChange): void {
    this.periodChange.emit(event.value as PeriodFilter);
  }

  onTypeChange(event: MatSelectChange): void {
    this.typeChange.emit(event.value as ContentType | 'all');
  }

  onCategoryChange(event: MatSelectChange): void {
    this.categoryChange.emit(event.value as string);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
  }

  onClear(): void {
    this.resetFilters.emit();
  }
}

