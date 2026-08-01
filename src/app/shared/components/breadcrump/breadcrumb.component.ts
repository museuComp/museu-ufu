import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
	signal,
	ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import BRBreadcrumb from '@govbr-ds/core/dist/components/breadcrumb/breadcrumb';
import { NgClass } from '@angular/common';

/**
 * Componente BreadcrumbComponent é responsável por exibir a navegação de breadcrumb.
 * Ele escuta eventos de navegação do Angular Router e constrói a trilha de navegação dinamicamente.
 * @example
 * <app-breadcrumb></app-breadcrumb>
 *
 * @public
 * {@link https://www.gov.br/ds/components/breadcrumb?tab=desenvolvedor|Documentação oficial}
 */
@Component({
	selector: 'app-breadcrumb',
	standalone: true,
	imports: [RouterLink, NgClass],
	host: {
		class: 'br-breadcrumb',
		'[class.d-none]': '!showBreadcrumb()',
	},
	templateUrl: './breadcrumb.component.html',
	styleUrl: './breadcrumb.component.scss',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent implements AfterViewInit, OnInit {
	/** Instância do componente BRBreadcrumb */
	instance: unknown;
	/** Lista de breadcrumbs a serem exibidos */
	crumbs: Array<{ label: string; url: string; home?: boolean; active?: boolean }> = [];
	/** Sinal para controlar a exibição do breadcrumb */
	showBreadcrumb = signal<boolean>(false);

	/** Instância do Angular Router */
	router = inject(Router);
	/** Instância do ActivatedRoute para acessar informações da rota */
	route = inject(ActivatedRoute);

	constructor() {}

	/**
	 * @internal
	 */
	ngOnInit(): void {
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.crumbs = [
					{
						label: 'Página Inicial',
						url: '/home',
						home: true,
					},
				];

				this.showBreadcrumb.set(false);

				const firstChild = this.route.root?.firstChild;
				if (firstChild) {
					this.buildBreadcrumbs(firstChild);

					const lastCrumb = this.crumbs[this.crumbs.length - 1];
					if (lastCrumb && lastCrumb.url !== '/home' && lastCrumb.url !== '/login') {
						this.showBreadcrumb.set(true);
						setTimeout(() => {
							this.setNewInstance();
						});
					}
				}
			}
		});
	}

	/**
	 * Cria uma nova instância do componente BRBreadcrumb.
	 * @internal
	 */
	setNewInstance(): void {
		this.instance = new BRBreadcrumb('br-breadcrumb', document.querySelector('.br-breadcrumb'));
	}

	/**
	 * Constrói a trilha de navegação de breadcrumbs recursivamente com base na rota ativa.
	 * @internal
	 */
	buildBreadcrumbs(route: ActivatedRoute, url: string = '') {
		if (route.snapshot.routeConfig) {
			const routePath = route.snapshot.routeConfig.path;

			if (routePath) {
				url += `/${routePath}`;
			}

			if (route.snapshot.data['breadCrumb'] && routePath) {
				this.crumbs.push({
					label: route.snapshot.data['breadCrumb'],
					url: url,
					active: route.children.length === 0,
				});
			}
		}

		if (route.firstChild) {
			this.buildBreadcrumbs(route.firstChild, url);
		}
	}

	/**
	 * Método do ciclo de vida do Angular chamado após a visualização ser inicializada.
	 * Cria uma nova instância do componente BRBreadcrumb.
	 * @internal
	 */
	ngAfterViewInit(): void {
		this.setNewInstance();
	}
}
