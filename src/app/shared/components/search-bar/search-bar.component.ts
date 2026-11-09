import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { distinctUntilChanged, filter, map, startWith, tap } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';

/**
 * Componente SearchBarComponent exibe a lupa e a barra expansível do cabeçalho.
 * Mantém a pesquisa na URL e permite abrir e fechar o campo pelo teclado.
 * @example
 * <app-search-bar></app-search-bar>
 * @standalone
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoDirective],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  host: {
    '[class.expanded]': 'isOpen()',
    '(keydown.escape)': '$event.preventDefault(); close()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  private readonly router = inject(Router);
  private readonly nav = inject(NavigationService);
  private readonly injector = inject(Injector);
  /** Referências usadas para mover o foco entre a lupa e o campo de pesquisa. */
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('searchTrigger');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  /** Indica se a barra está expandida; o formulário guarda o termo digitado. */
  readonly isOpen = signal(false);
  readonly query = new FormControl('', { nonNullable: true });
  readonly form = new FormGroup({ q: this.query });

  constructor() {
    // Preenche o campo pela URL inicial e acompanha as próximas navegações.
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null),
      tap(() => this.close(false)),
      map(() => this.router.parseUrl(this.router.url).queryParamMap.get('q') ?? ''),
      distinctUntilChanged(),
      // Encerra a assinatura quando o componente deixa de existir.
      takeUntilDestroyed(),
    ).subscribe(query => this.query.setValue(query));
  }

  /** Expande a barra e seleciona o texto para facilitar uma nova pesquisa. */
  open(): void {
    this.isOpen.set(true);
    // Aguarda o campo ficar visível antes de tentar receber o foco.
    afterNextRender(() => {
      if (this.isOpen()) {
        this.searchInput()?.nativeElement.focus();
        this.searchInput()?.nativeElement.select();
      }
    }, { injector: this.injector });
  }

  /**
   * Recolhe a barra de pesquisa.
   * @param restoreFocus Indica se o foco deve voltar para a lupa ao fechar.
   */
  close(restoreFocus = true): void {
    const wasOpen = this.isOpen();
    this.isOpen.set(false);
    if (wasOpen && restoreFocus) {
      this.trigger()?.nativeElement.focus();
    }
  }

  /** Alterna a lupa entre abrir a barra e fechar a pesquisa. */
  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Abre a página de resultados no idioma atual e grava o termo no parâmetro q. */
  search(): void {
    const query = this.query.value.trim();
    // Pesquisas com apenas espaços não iniciam uma navegação.
    if (query) {
      this.close();
      this.router.navigate([this.nav.route('search')], { queryParams: { q: query } });
    }
  }
}
