import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { AboutRoutingModule } from "@app/pages/about/about-routing.module";
import { Router, UrlSegment } from '@angular/router';

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
    // Troca apenas o segmento do idioma e preserva pesquisa, filtros e fragmentos.
    const url = this.router.parseUrl(this.router.url);
    const primary = url.root.children['primary'];
    if (primary?.segments.length) primary.segments[0] = new UrlSegment(lang, primary.segments[0].parameters);
    this.transloco.setActiveLang(lang);
    this.router.navigateByUrl(url);
  }
}
