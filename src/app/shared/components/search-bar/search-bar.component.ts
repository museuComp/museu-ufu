import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { distinctUntilChanged, filter, map, startWith, tap } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';
import { parseSearchQuery, SEARCH_QUERY_LIMITS } from '@shared/utils/search-text.utils';

/**
 * Componente SearchBarComponent exibe a lupa e a barra expansível do cabeçalho.
 * Mantém a pesquisa na URL e permite abrir e fechar o campo pelo teclado.
 * O botão de ajuda mostra dicas de uso ao lado do campo.
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
    '(keydown.escape)': '$event.preventDefault(); onEscape()',
    '(document:click)': 'onDocumentClick($event)',
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
  /** Referências do botão de ajuda e do painel, usadas no foco e no clique fora. */
  private readonly helpTrigger = viewChild<ElementRef<HTMLButtonElement>>('helpTrigger');
  private readonly helpPanel = viewChild<ElementRef<HTMLElement>>('helpPanel');
  /** Indica se a barra está expandida; o formulário guarda o termo digitado. */
  readonly isOpen = signal(false);
  /** Indica se o painel com as dicas de pesquisa está visível. */
  readonly isHelpOpen = signal(false);
  readonly queryLimits = SEARCH_QUERY_LIMITS;
  readonly query = new FormControl('', {
    nonNullable: true,
    validators: control => {
      const error = parseSearchQuery(control.value).error;
      return error ? { searchQuery: error } : null;
    },
  });
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
    this.closeHelp();
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

  /** Mostra ou esconde as dicas de pesquisa. */
  toggleHelp(): void {
    this.isHelpOpen.update(open => !open);
  }

  /**
   * Esconde as dicas de pesquisa.
   * @param restoreFocus Indica se o foco deve voltar para o botão de ajuda.
   */
  closeHelp(restoreFocus = false): void {
    const wasOpen = this.isHelpOpen();
    this.isHelpOpen.set(false);
    if (wasOpen && restoreFocus) {
      this.helpTrigger()?.nativeElement.focus();
    }
  }

  /** Com as dicas abertas, o Esc fecha apenas o painel; depois recolhe a barra. */
  onEscape(): void {
    if (this.isHelpOpen()) {
      this.closeHelp(true);
    } else {
      this.close();
    }
  }

  /**
   * Fecha as dicas quando o clique ou toque acontece fora do botão e do painel.
   * @param event Clique recebido pelo documento.
   */
  onDocumentClick(event: MouseEvent): void {
    if (!this.isHelpOpen()) return;
    const target = event.target as Node | null;
    const inside = [this.helpTrigger(), this.helpPanel()].some(ref => target && ref?.nativeElement.contains(target));
    if (!inside) {
      this.closeHelp();
    }
  }

  /** Abre a página de resultados no idioma atual e grava o termo no parâmetro q. */
  search(): void {
    if (this.query.invalid) return;
    const query = this.query.value.trim();
    // Pesquisas com apenas espaços não iniciam uma navegação.
    if (query) {
      this.close();
      this.router.navigate([this.nav.route('search')], { queryParams: { q: query } });
    }
  }
}
