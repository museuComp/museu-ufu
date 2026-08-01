import { ChangeDetectionStrategy, Component, inject, input, HostListener } from '@angular/core';
import { AuthService } from '@app/core/auth/services/auth.service';
import { CdkMenuModule } from '@angular/cdk/menu';
import { MenuService } from '@app/core/services/menu.service'
import { BarraBrasilComponent } from '../barra-brasil/barra-brasil.component';
import { RouterLink } from '@angular/router';
import { AccessibilityService } from '@app/services/accessibility.service';

@Component({
	selector: 'app-header',
	standalone: true,
  imports: [CdkMenuModule, BarraBrasilComponent, RouterLink],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HeaderComponent {
	hideNavbar = input<boolean>(false);
	authService = inject(AuthService);
	user = this.authService.credentials;
	private _menuService = inject(MenuService);

	isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = scrollTop > 40;
  }

	constructor(private accessibilityService: AccessibilityService) {}

	toggleMenu(): void {
		this._menuService.toggle();
	}

	logout() {
		this.authService.logout();
	}

	toggleContrast() {
		this.accessibilityService.toggleContrast();
	}

	increaseZoom() {
		this.accessibilityService.increaseZoom();
	}

	decreaseZoom() {
		this.accessibilityService.decreaseZoom();
	}

	resetZoom() {
		this.accessibilityService.resetZoom();
	}
}
