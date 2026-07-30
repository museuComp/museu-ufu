import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {
  AlertComponent,
  LoadingComponent,
} from 'govbr-ds-angular';
import {HeaderComponent} from './shared/components/header/header.component';
import {MenuComponent} from './shared/components/menu/menu.component';
import {FooterComponent} from './shared/components/footer/footer.component';
import {BreadcrumbComponent} from './shared/components/breadcrump/breadcrumb.component';
import {NgClass} from '@angular/common';
import {AuthService } from './core/auth/services/auth.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {CheckUpdateService} from './core/update/check-update.service';
import { PerfisNavComponent } from "./perfis-nav/perfis-nav.component";
import { TranslocoService } from '@jsverse/transloco';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    MenuComponent,
    FooterComponent,
    BreadcrumbComponent,
    AlertComponent,
    LoadingComponent,
    NgClass,
    PerfisNavComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isMobile = signal<boolean>(false);
  hideNavbar = signal<boolean>(true);

  authService = inject(AuthService);
  breakpointObserver = inject(BreakpointObserver);
  router = inject(Router);
  checkUpdateService = inject(CheckUpdateService);
  private readonly transloco = inject(TranslocoService);

  isPublic = this.authService.isPublic;

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Web, Breakpoints.Tablet]).subscribe(() => {
      this.isMobile.set(this.breakpointObserver.isMatched(Breakpoints.Handset));
    });

    this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        this.validateUrl(data.url);
        let route = this.router.url.split('/');
        this.transloco.setActiveLang(route[1]);
        this.transloco.load(route[1]);
      
        if (typeof gtag !== 'undefined') {
          gtag('config', 'G-M29PJKZS0R', {
            'page_path': data.urlAfterRedirects
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.checkUpdateService.init();
  }

  private validateUrl(url: string) {
    if (url.startsWith('/login') || url === '/' || url === '/home') {
      this.hideNavbar.set(true);
    } else {
      this.hideNavbar.set(false);
    }
  }
}
