import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { AboutRoutingModule } from "@app/pages/about/about-routing.module";
import { Router } from '@angular/router';

@Component({
  selector: 'app-barra-brasil',
  standalone: true,
  imports: [CommonModule, AboutRoutingModule],
  templateUrl: './barra-brasil.component.html',
  styleUrls: ['./barra-brasil.component.scss']
})
export class BarraBrasilComponent {
  readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);

  constructor() {}

  changeLang(lang:string): void {
    let url = this.router.url;
    url = url.replace(this.transloco.getActiveLang(), lang);
    this.router.navigate([url]);
  }
} 