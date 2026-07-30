import { Component, inject } from '@angular/core';
import { TranslocoDirective } from "@jsverse/transloco";
import { AboutRoutingModule } from "@app/pages/about/about-routing.module";
import { NavigationService } from '@app/services/navigation.service';
import { RouterLink } from '@angular/router';

/**
 * Componente FooterComponent é responsável por exibir o rodapé da aplicação.
 * @example
 * <app-footer></app-footer>
 * @public
 * {@link https://www.gov.br/ds/components/footer?tab=desenvolvedor|Documentação oficial}
 */
@Component({
	selector: 'app-footer',
	standalone: true,
	imports: [TranslocoDirective, AboutRoutingModule, RouterLink],
	templateUrl: './footer.component.html',
	styleUrl: './footer.component.scss',
})
export class FooterComponent {
	readonly nav = inject(NavigationService);

	license = {
		text: 'Todo o conteúdo deste site está publicado sob a licença Creative Commons Atribuição-SemDerivações 3.0',
		url: 'http://creativecommons.org/licenses/by-nd/3.0/deed.pt_BR'
	};
}
