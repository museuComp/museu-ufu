import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent {
  private sanitizer = inject(DomSanitizer);
  
  // O link mágico do Google vai entrar aqui depois!
  // Coloquei um link de exemplo do próprio Google para você ver funcionando.
  googleDashboardUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://lookerstudio.google.com/embed/reporting/dba5c595-b69a-41d9-9e03-510414a374a5/page/kIV1C'
  );
}