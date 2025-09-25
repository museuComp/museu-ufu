import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TableRow {
  inputs: number[];
  expectedOutput: number;
  userAnswer: string;
  isCorrect?: boolean;
}

interface Level {
  id: number;
  name: string;
  vars: string[];
  fn: (...args: number[]) => number;
}

@Component({
  selector: 'app-truth-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './truth-table.component.html',
  styleUrls: ['./truth-table.component.scss']
})
export class TruthTableComponent implements OnInit {

  // Estados do jogo
  gameStarted: boolean = false;
  levelCompleted: boolean = false;
  gameCompleted: boolean = false;
  current: number = 0;

  // Dados da tabela
  tableRows: TableRow[] = [];
  
  // Feedback
  feedbackMessage: string = '';
  feedbackClass: string = '';

  // Níveis do jogo
  levels: Level[] = [
    { id: 1, name: 'NOT A', vars: ['A'], fn: (a: number) => Number(!a) },
    { id: 2, name: 'A AND B', vars: ['A','B'], fn: (a: number, b: number) => a & b },
    { id: 3, name: 'A OR B', vars: ['A','B'], fn: (a: number, b: number) => a | b },
    { id: 4, name: 'A XOR B', vars: ['A','B'], fn: (a: number, b: number) => a ^ b },
    { id: 5, name: 'A NAND B', vars: ['A','B'], fn: (a: number, b: number) => Number(!(a & b)) },
    { id: 6, name: 'A NOR B', vars: ['A','B'], fn: (a: number, b: number) => Number(!(a | b)) },
    { id: 7, name: 'A XNOR B', vars: ['A','B'], fn: (a: number, b: number) => Number(!((a ^ b))) }
  ];

  // Curiosidades educacionais
  curiosities: string[] = [
    'A álgebra booleana foi criada em 1854 por George Boole, que nem imaginava que suas ideias seriam a base dos computadores modernos.',
    'Originalmente, a álgebra booleana servia apenas para estudar lógica e proposições, sem nenhuma aplicação prática prevista.',
    'Em 1937, Claude Shannon mostrou que a álgebra booleana podia ser aplicada a circuitos elétricos, usando 0 e 1 para representar desligado e ligado.',
    'Tudo que um computador faz — cálculos, imagens, vídeos — é, no fundo, uma sequência de operações booleanas: AND, OR, NOT e suas variações.',
    'Memórias, processadores, redes e sistemas operacionais dependem das regras da álgebra booleana para funcionar.',
    'Graças à álgebra booleana, os computadores passaram de máquinas mecânicas lentas para sistemas eletrônicos rápidos.',
    'A álgebra booleana uniu a matemática pura à engenharia elétrica, criando o alicerce do mundo digital.'
  ];

  constructor() {}

  ngOnInit(): void {
    this.resetGame();
  }

  // ================================
  // Controle do jogo
  // ================================

  iniciarJogo(): void {
    this.gameStarted = true;
    this.levelCompleted = false;
    this.gameCompleted = false;
    this.current = 0;
    this.loadLevel(this.current);
  }

  loadLevel(levelIndex: number): void {
    this.current = levelIndex;
    this.levelCompleted = false;
    this.buildTable();
    this.resetFeedback();
  }

  nextLevel(): void {
    if (this.current < this.levels.length - 1) {
      this.loadLevel(this.current + 1);
    }
  }

  completeGame(): void {
    this.levelCompleted = false;
    this.gameCompleted = true;
  }

  resetGame(): void {
    this.gameStarted = false;
    this.levelCompleted = false;
    this.gameCompleted = false;
    this.current = 0;
    this.tableRows = [];
    this.resetFeedback();
  }

  // ================================
  // Construção da tabela
  // ================================

  buildTable(): void {
    const level = this.levels[this.current];
    this.tableRows = [];

    // Gera todas as combinações possíveis de entrada
    const combinations = this.generateCombinations(level.vars.length);

    combinations.forEach(inputs => {
      const expectedOutput = level.fn(...inputs);
      this.tableRows.push({
        inputs: inputs,
        expectedOutput: expectedOutput,
        userAnswer: '',
        isCorrect: undefined
      });
    });
  }

  generateCombinations(numVars: number): number[][] {
    if (numVars === 1) {
      return [[0], [1]];
    }
    return [[0,0], [0,1], [1,0], [1,1]];
  }

  // ================================
  // Verificação e feedback
  // ================================

  canCheck(): boolean {
    return this.tableRows.every(row => row.userAnswer !== '');
  }

  checkAnswers(): void {
    if (!this.canCheck()) {
      this.showFeedback('Preencha todos os campos antes de verificar.', 'warning');
      return;
    }

    let allCorrect = true;
    let correctCount = 0;

    // Verifica cada linha
    this.tableRows.forEach(row => {
      const userValue = parseInt(row.userAnswer);
      const isCorrect = userValue === row.expectedOutput;
      row.isCorrect = isCorrect;
      
      if (isCorrect) {
        correctCount++;
      } else {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      this.showFeedback('Parabéns! Todas as respostas estão corretas!', 'success');
      setTimeout(() => {
        this.levelCompleted = true;
      }, 1000);
    } else {
      this.showFeedback(`${correctCount}/${this.tableRows.length} respostas corretas. Tente novamente!`, 'error');
    }
  }

  resetAnswers(): void {
    this.tableRows.forEach(row => {
      row.userAnswer = '';
      row.isCorrect = undefined;
    });
    this.resetFeedback();
  }

  showFeedback(message: string, type: string): void {
    this.feedbackMessage = message;
    this.feedbackClass = type;
  }

  resetFeedback(): void {
    this.feedbackMessage = 'Preencha a tabela verdade e clique em Verificar.';
    this.feedbackClass = 'info';
  }
}