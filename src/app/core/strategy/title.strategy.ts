import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class CustomPageTitleStrategy extends TitleStrategy {
	private readonly transloco = inject(TranslocoService);

	constructor(private readonly title: Title) {
		super();
	}

	override updateTitle(routerState: RouterStateSnapshot) {
		const title = this.buildTitle(routerState);
		if (title !== undefined) {
			this.transloco.selectTranslate(`breadcrumb.${title}`).subscribe(t => {
				this.title.setTitle(`${t} | Museu Virtual Facom`);
			});
		}
	}
}
