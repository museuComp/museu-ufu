import { Component } from '@angular/core';

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
	imports: [],
	templateUrl: './footer.component.html',
	styleUrl: './footer.component.scss',
})
export class FooterComponent {


	license = {
		text: 'Todo o conteúdo deste site está publicado sob a licença Creative Commons Atribuição-SemDerivações 3.0',
		url: 'http://creativecommons.org/licenses/by-nd/3.0/deed.pt_BR'
	};
}
