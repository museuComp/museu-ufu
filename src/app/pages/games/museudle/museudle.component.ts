import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-museudle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './museudle.component.html',
  styleUrls: ['./museudle.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MuseudleComponent implements OnInit, AfterViewInit, OnDestroy {
  private scriptElements: HTMLScriptElement[] = [];
  private scriptsLoaded = false;

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadGameScripts();
    }, 100);
  }


  private loadGameScripts(): void {
    // Check if scripts are already loaded globally
    if ((window as any).itensData && (window as any).museudleScriptLoaded) {
      // Scripts already loaded, just reinitialize
      if (typeof (window as any).init === 'function') {
        (window as any).init();
      }
      return;
    }

    const scripts = [
      'assets/games/museudle/itens.js',
      'assets/games/museudle/script.js'
    ];

    this.loadScriptSequentially(scripts, 0);
  }

  private loadScriptSequentially(scripts: string[], index: number): void {
    if (index >= scripts.length) {
      (window as any).museudleScriptLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = scripts[index];
    script.onload = () => {
      this.loadScriptSequentially(scripts, index + 1);
    };
    script.onerror = () => {
      console.error(`Failed to load script: ${scripts[index]}`);
    };
    document.body.appendChild(script);
    this.scriptElements.push(script);
  }

  ngOnDestroy(): void {
    // Don't remove scripts, just clean up the reference
    // Scripts will stay loaded for performance
    this.scriptElements = [];
  }
}
