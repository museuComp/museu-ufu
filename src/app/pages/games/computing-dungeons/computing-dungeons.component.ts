import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-computing-dungeons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './computing-dungeons.component.html',
  styleUrls: ['./computing-dungeons.component.css']
})
export class ComputingDungeonsComponent implements OnInit, AfterViewInit, OnDestroy {
  private scriptElement: HTMLScriptElement | null = null;

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadGameScript();
    }, 100);
  }

  private loadGameScript(): void {
    this.scriptElement = document.createElement('script');
    this.scriptElement.type = 'module';
    this.scriptElement.src = 'assets/games/computing-dungeons/main.js';
    this.scriptElement.onerror = () => {
      console.error('Failed to load Computing Dungeons game script');
    };
    document.body.appendChild(this.scriptElement);
  }

  ngOnDestroy(): void {
    // Remove the game script
    if (this.scriptElement && this.scriptElement.parentNode) {
      this.scriptElement.parentNode.removeChild(this.scriptElement);
    }
    
    // Clean up any game elements
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      const ctx = (canvas as HTMLCanvasElement).getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      }
    }
  }
}
