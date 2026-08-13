import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationService } from '@app/services/navigation.service';

interface Puzzle {
  question: string;
  // imageUrl: string;
  options: string[];
  answer: number;
}

@Component({
  selector: 'app-linux',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './linux-puzzle.component.html',
  styleUrl: './linux-puzzle.component.css',
})
export class LinuxPuzzleComponent implements OnInit {
  readonly nav = inject(NavigationService);
  puzzles: Puzzle[] = [
    {
      question: 'Descubra onde está Tux.',
      options: ['pwd', 'mkdir tux', 'where tux', 'ls'],
      answer: 0,
      // imageUrl: [],
    },
    {
      question: 'Liste os caminhos que Tux pode seguir.',
      options: ['ways', 'cd tux', 'rm tux', 'ls'],
      answer: 3,
      // imageUrl: [],
    },
    {
      question: 'Acesse o diretório que leva Tux ao GNU',
      options: [
        'cat bairro_do_GNU',
        'mkdir tux',
        'access bairro_do_GNU',
        'cd bairro_do_GNU',
      ],
      answer: 3,
      // imageUrl: [],
    },
    {
      question:
        'O caminho do GNU está quebrado. Crie um diretório "rua_do_GNU" e o acesse para resolver o problema',
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
      question: 'A casa do GNU está em reforma. Mova-o para a rua_do_GNU',
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
  descriptionMessage: string = '';
  terminalString: string = `tux@tux-desktop:~$`;

  ngOnInit(): void {}

  @HostListener('document:keydown', ['$event'])
  handleGlobalKey(event: KeyboardEvent) {
    if (event.altKey && event.key === 't') {
      this.gameStarted = true;
    }
    if (event.key === 'Enter') {
      this.submitAnswer();
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
      this.descriptionMessage = '';
      this.errorMessage = '';
      this.cliUserInput.reset(); // limpa o terminal para o próximo comando
      this.nextPuzzle();
    } else {
      this.descriptionMessage = '';
      this.errorMessage = 'Comando incorreto. Tente novamente!';
      this.cliUserInput.reset();
    }
  }

  nextPuzzle(): void {
    if (this.currentPuzzle < this.puzzles.length - 1) {
      this.currentPuzzle++;
    } else {
      this.gameFinished = true;
    }
  }

  showDescription(option): void {
    this.errorMessage = '';
    const command = option.split(' ');
    switch (command[0]) {
      case 'pwd':
        this.descriptionMessage =
          'Mostra o caminho por inteiro do diretório em que nos encontramos em dado momento';
        break;
      case 'mkdir':
        this.descriptionMessage = 'Cria um diretório';
        break;
      case 'ls':
        this.descriptionMessage = 'Lista todos os arquivos do diretório';
        break;
      case 'cd':
        this.descriptionMessage = 'Acessa uma determinada pasta (diretório)';
        break;
      case 'mv':
        this.descriptionMessage = 'Move ou renomeia arquivos ou diretórios';
        break;
      case 'cat':
        this.descriptionMessage = ' Abre um arquivo';
        break;
      case 'rm':
        this.descriptionMessage = 'Remove um arquivo/diretório';
        break;
      default:
        this.descriptionMessage = 'Comando desconhecido';
    }
  }

  // progress bar characters
  tuxImage: string = 'public/images/Tux.png';
  gnuImage: string = 'public/images/gnu.png';

  progressPercentage(): number {
    if (!this.puzzles || this.puzzles.length === 0) return 0;
    return (this.currentPuzzle / this.puzzles.length) * 100;
  }
}
