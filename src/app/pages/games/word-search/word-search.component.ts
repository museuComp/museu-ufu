import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { GameService, Position, Word } from '../service/game.service';

@Component({
  selector: 'app-word-search',
  templateUrl: './word-search.component.html',
  styleUrls: ['./word-search.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})

export class WordSearchComponent implements OnInit, OnDestroy {
  grid: string[][] = [];
  words: Word[] = [];
  elapsedTime: number = 0;
  foundWordsCount: number = 0;
  selectedCells: Position[] = [];
  isSelecting: boolean = false;
  gameComplete: boolean = false;
  showCongratulations: boolean = false;
  focusedRow: number = 0;
  focusedCol: number = 0;
  announcement: string = '';
  private subscriptions: Subscription[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.grid = this.gameService.getGrid();
    this.words = this.gameService.getWords();

    this.subscriptions.push(
      this.gameService.getElapsedTime().subscribe(time => {
        this.elapsedTime = time;
      })
    );

    this.subscriptions.push(
      this.gameService.getFoundWords().subscribe(count => {
        this.foundWordsCount = count;
        if (count === this.words.length) {
          this.gameComplete = true;
          this.gameService.endGame();
          this.showCongratulations = true;
          // Move o foco para o título do modal assim que ele for renderizado,
          // garantindo que o NVDA anuncie a vitória automaticamente
          setTimeout(() => {
            document.getElementById('modal-title')?.focus();
          });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onMouseDown(row: number, col: number): void {
    this.isSelecting = true;
    this.selectedCells = [{ row, col }];
  }

  onMouseOver(row: number, col: number): void {
    if (this.isSelecting) {
      const lastCell = this.selectedCells[0];

      // Verifica se é uma seleção válida (mesma linha, coluna ou diagonal)
      const rowDiff = Math.abs(row - lastCell.row);
      const colDiff = Math.abs(col - lastCell.col);

      if (row === lastCell.row || col === lastCell.col || rowDiff === colDiff) {
        this.selectedCells = this.getPositionsBetween(lastCell, { row, col });
      }
    }
  }

  onMouseUp(): void {
    if (this.isSelecting) {
      this.isSelecting = false;
      const selectedText = this.selectedCells.map(p => this.grid[p.row][p.col]).join('');
      if (this.gameService.checkWord(this.selectedCells)) {
        // Palavra encontrada!
        this.announcement = `Palavra encontrada: ${selectedText}!`;
      } else {
        this.announcement = `Nenhuma palavra corresponde a "${selectedText}". Seleção desfeita.`;
        this.selectedCells = [];
      }
    }
  }

  private getPositionsBetween(start: Position, end: Position): Position[] {
    const positions: Position[] = [];
    const rowDir = Math.sign(end.row - start.row) || 0;
    const colDir = Math.sign(end.col - start.col) || 0;

    let currentRow = start.row;
    let currentCol = start.col;

    while (true) {
      positions.push({ row: currentRow, col: currentCol });

      if (currentRow === end.row && currentCol === end.col) break;

      currentRow += rowDir;
      currentCol += colDir;
    }

    return positions;
  }

  isCellSelected(row: number, col: number): boolean {
    return this.selectedCells.some(pos => pos.row === row && pos.col === col);
  }

  isWordFound(word: string): boolean {
    return this.words.find(w => w.word === word)?.found || false;
  }

  /** Verifica se a célula faz parte de uma palavra já encontrada, para informar o leitor de tela. */
  isCellInFoundWord(row: number, col: number): boolean {
    return this.words.some(w => w.found && w.positions.some(p => p.row === row && p.col === col));
  }

  /** Monta o texto que o NVDA anuncia ao focar em cada célula da grade. */
  getCellLabel(cell: string, row: number, col: number): string {
    let label = `Letra ${cell}, linha ${row + 1}, coluna ${col + 1}`;
    if (this.isCellSelected(row, col)) {
      label += ', selecionada';
    }
    if (this.isCellInFoundWord(row, col)) {
      label += ', parte de uma palavra já encontrada';
    }
    return label;
  }

  /**
   * Navegação e seleção por teclado, equivalente ao arrastar do mouse:
   * setas movem o foco pela grade; Enter/Espaço inicia a seleção numa letra
   * e a confirma na letra final; Escape cancela a seleção em andamento.
   */
  onCellKeydown(event: KeyboardEvent, row: number, col: number): void {
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    if (arrowKeys.includes(event.key)) {
      event.preventDefault();
      let newRow = row;
      let newCol = col;

      if (event.key === 'ArrowUp') newRow = Math.max(0, row - 1);
      if (event.key === 'ArrowDown') newRow = Math.min(this.grid.length - 1, row + 1);
      if (event.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
      if (event.key === 'ArrowRight') newCol = Math.min(this.grid[0].length - 1, col + 1);

      this.focusedRow = newRow;
      this.focusedCol = newCol;

      // Se já existe uma seleção em andamento, estende-a até a nova posição
      if (this.isSelecting) {
        this.onMouseOver(newRow, newCol);
      }

      // Move o foco real do navegador para a nova célula, após o Angular
      // atualizar o tabindex (roving tabindex)
      setTimeout(() => {
        document.getElementById(`cell-${newRow}-${newCol}`)?.focus();
      });
    } else if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      if (!this.isSelecting) {
        this.onMouseDown(row, col);
        this.announcement = `Seleção iniciada na letra ${this.grid[row][col]}, linha ${row + 1}, coluna ${col + 1}. Use as setas até a última letra e pressione Enter para confirmar.`;
      } else {
        this.onMouseUp();
      }
    } else if (event.key === 'Escape' && this.isSelecting) {
      this.isSelecting = false;
      this.selectedCells = [];
      this.announcement = 'Seleção cancelada.';
    }
  }

  closeModal(): void {
    this.showCongratulations = false;
  }

  resetGame(): void {
    this.gameService.resetGame();
    this.grid = this.gameService.getGrid();
    this.words = this.gameService.getWords();
    this.selectedCells = [];
    this.gameComplete = false;
    this.showCongratulations = false;
    this.focusedRow = 0;
    this.focusedCol = 0;
    this.announcement = 'Jogo reiniciado.';
  }
}