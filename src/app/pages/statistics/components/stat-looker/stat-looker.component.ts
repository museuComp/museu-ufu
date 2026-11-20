import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-stat-looker',
  imports: [MatProgressSpinnerModule, MatIconModule, TranslocoPipe],
  templateUrl: './stat-looker.component.html',
  styleUrls: ['./stat-looker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatLookerComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly rawUrl =
    'https://lookerstudio.google.com/embed/reporting/dba5c595-b69a-41d9-9e03-510414a374a5/page/kIV1C';

  readonly safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawUrl);

  readonly isIframeLoading = signal<boolean>(true);

  onIframeLoad(): void {
    this.isIframeLoading.set(false);
  }
}

