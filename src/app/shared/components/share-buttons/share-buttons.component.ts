import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Representa uma rede social suportada pelo componente de compartilhamento.
 */
interface ShareLink {
	/** Identificador interno da rede (usado no nome da janela popup). */
	name: string;
	/** Classe do ícone do Font Awesome (marca). */
	icon: string;
	/** Rótulo acessível, exibido no aria-label e no title do botão. */
	label: string;
	/** Monta a URL de compartilhamento a partir da URL e do título já codificados. */
	buildUrl: (encodedUrl: string, encodedTitle: string) => string;
}

/**
 * Componente ShareButtonsComponent exibe um conjunto de botões reutilizáveis para
 * compartilhar uma página em redes sociais (Facebook, X, LinkedIn, Telegram e WhatsApp).
 *
 * É genérico e não depende do tipo de conteúdo -- pode ser usado em qualquer página de
 * detalhe (notícia, vídeo, personalidade, revista, etc.), bastando informar a URL e o
 * título a compartilhar.
 *
 * @example
 * <app-share-buttons [title]="newsItem.summary.title"></app-share-buttons>
 *
 * @example
 * <!-- Informando a URL explicitamente, em vez de usar a URL atual da página -->
 * <app-share-buttons [url]="fullUrl" [title]="video.summary.title"></app-share-buttons>
 */
@Component({
	selector: 'app-share-buttons',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './share-buttons.component.html',
	styleUrl: './share-buttons.component.scss',
})
export class ShareButtonsComponent {
	/**
	 * URL a ser compartilhada. Se não for informada, usa a URL atual do navegador
	 * (window.location.href) no momento do clique.
	 */
	@Input() url?: string;

	/**
	 * Título ou texto a acompanhar o link, usado pelas redes que suportam
	 * (X, Telegram, WhatsApp). Facebook e LinkedIn ignoram este campo.
	 */
	@Input() title: string = '';

	/** Lista de redes sociais suportadas, na ordem em que são exibidas. */
	readonly shareLinks: ShareLink[] = [
		{
			name: 'facebook',
			icon: 'fa-brands fa-facebook-f',
			label: 'Compartilhar no Facebook',
			buildUrl: encodedUrl => `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
		},
		{
			name: 'x',
			icon: 'fa-brands fa-x-twitter',
			label: 'Compartilhar no X',
			buildUrl: (encodedUrl, encodedTitle) =>
				`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
		},
		{
			name: 'linkedin',
			icon: 'fa-brands fa-linkedin-in',
			label: 'Compartilhar no LinkedIn',
			buildUrl: encodedUrl => `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
		},
		{
			name: 'telegram',
			icon: 'fa-brands fa-telegram',
			label: 'Compartilhar no Telegram',
			buildUrl: (encodedUrl, encodedTitle) =>
				`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
		},
		{
			name: 'whatsapp',
			icon: 'fa-brands fa-whatsapp',
			label: 'Compartilhar no WhatsApp',
			buildUrl: (encodedUrl, encodedTitle) =>
				`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
		},
	];

	/**
	 * Abre a janela de compartilhamento da rede escolhida.
	 * A URL é lida no momento do clique (não no ngOnInit), para que o componente
	 * continue funcionando corretamente mesmo em páginas onde a URL muda sem o
	 * componente ser recriado (ex: navegação entre "próxima notícia"/"anterior").
	 * @param link - A rede social escolhida.
	 * @param event - O evento de clique, usado para impedir a navegação padrão do link.
	 */
	share(link: ShareLink, event: MouseEvent): void {
		event.preventDefault();

		const pageUrl = this.url ?? window.location.href;
		const encodedUrl = encodeURIComponent(pageUrl);
		const encodedTitle = encodeURIComponent(this.title ?? '');
		const shareUrl = link.buildUrl(encodedUrl, encodedTitle);

		const width = 600;
		const height = 500;
		const left = Math.max(0, (window.screen.width - width) / 2);
		const top = Math.max(0, (window.screen.height - height) / 2);

		window.open(
			shareUrl,
			`share-${link.name}`,
			`width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
		);
	}
}