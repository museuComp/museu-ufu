import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

interface Puzzle {
  question: string;
  // imageUrl: string;
  options: string[];
  answer: number;
}

@Component({
  selector: 'app-linux',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './linux-puzzle.component.html',
  styleUrl: './linux-puzzle.component.css',
})
export class LinuxPuzzleComponent implements OnInit {
  puzzles: Puzzle[] = [
    {
      question: '1.Descubra onde está Tux.',
      options: ['pwd', 'mkdir tux', 'where tux', 'ls'],
      answer: 0,
      // imageUrl: [],
    },
    {
      question: '2.Descubra os caminhos que Tux pode seguir.',
      options: ['ways', 'cd tux', 'where tux', 'ls'],
      answer: 3,
      // imageUrl: [],
    },
    {
      question: '3.Acesse o diretório que leva Tux ao GNU',
      options: [
        'goto bairro_do_GNU',
        'mkdir tux',
        'access bairro_do_GNU',
        'cd bairro_do_GNU',
      ],
      answer: 3,
      // imageUrl: [],
    },
    {
      question:
        '4.O caminho do GNU está quebrado. Crie um diretório "rua_do_GNU" e o acesse para resolver o problema',
      options: [
        'pwd',
        'mkdir rua_do_GNU && cd rua_do_GNU',
        'create rua_do_GNU && cd rua_do_GNU',
        'make rua_do_GNU && access rua_do_GNU',
      ],
      answer: 1,
      // imageUrl: [],
    },
    {
      question: '5.A casa do GNU está em reforma. Mova-o para a rua_do_GNU',
      options: [
        'bring casa_do_GNU/GNU rua_do_GNU',
        'mkdir tux',
        'mv casa_do_GNU/GNU rua_do_GNU',
        'take casa_do_GNU rua_do_GNU',
      ],
      answer: 2,
      // imageUrl: [],
    },
  ];

  cliUserInput = new FormControl('', [Validators.required]);
  gameStarted: boolean = false;
  gameFinished: boolean = false;
  currentPuzzle: number = 0;
  errorMessage: string = '';

  ngOnInit(): void {}

  @HostListener('document:keydown', ['$event'])
  handleGlobalKey(event: KeyboardEvent) {
    if (event.altKey && event.key === 't') {
      this.gameStarted = true;
    }
  }

  startGame() {
    this.gameStarted = true;
  }

  submitAnswer(): void {
    // if null just return
    if (!this.cliUserInput.value) return;

    const userInput = this.cliUserInput.value.trim();
    const correctOptionIndex = this.puzzles[this.currentPuzzle].answer;
    const correctAnswer =
      this.puzzles[this.currentPuzzle].options[correctOptionIndex];

    if (userInput === correctAnswer) {
      this.errorMessage = '';
      this.cliUserInput.reset(); // limpa o terminal para o próximo comando
      this.nextPuzzle();
    } else {
      this.errorMessage =
        'Comando não encontrado ou incorreto. Tente novamente!';
    }
  }

  nextPuzzle(): void {
    if (this.currentPuzzle < this.puzzles.length - 1) {
      this.currentPuzzle++;
    } else {
      this.gameFinished = true;
    }
  }
}
