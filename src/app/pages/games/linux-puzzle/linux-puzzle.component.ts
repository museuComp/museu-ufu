import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Puzzle {
  question: string;
  // imageUrl: string;
  options: string[];
  correctAnswer: number;
}

@Component({
  selector: 'app-linux',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './linux-puzzle.component.html',
  styleUrl: './linux-puzzle.component.css',
})
export class LinuxPuzzleComponent implements OnInit {
  puzzles: Puzzle[] = [
    {
      question: '1.Descubra onde está Tux.',
      options: ['$pwd', '$mkdir tux', '$where tux', '$ls'],
      correctAnswer: 0,
      // imageUrl: [],
    },
    {
      question: '2.Descubra os caminhos que Tux pode seguir.',
      options: ['$ways', '$cd tux', '$where tux', '$ls'],
      correctAnswer: 3,
      // imageUrl: [],
    },
    {
      question: '3.Acesse o diretório que leva Tux ao GNU',
      options: [
        '$goto bairro_do_GNU',
        '$mkdir tux',
        '$access bairro_do_GNU',
        '$cd bairro_do_GNU',
      ],
      correctAnswer: 3,
      // imageUrl: [],
    },
    {
      question:
        '4.O caminho ddo GNU está quebrado. Crie um diretório "rua_do_GNU" e o acesse para resolver o problema',
      options: [
        '$pwd',
        '$mkdir rua_do_GNU\n$cd rua_do_GNU',
        '$create rua_do_GNU\n$cd rua_do_GNU',
        '$make rua_do_GNU\n$access rua_do_GNU',
      ],
      correctAnswer: 1,
      // imageUrl: [],
    },
    {
      question: '5.A casa do GNU está em reforma. Mova-o para a rua_do_GNU',
      options: [
        '$bring casa_do_GNU/GNU rua_do_GNU',
        '$mkdir tux',
        '$mv casa_do_GNU/GNU rua_do_GNU',
        '$take casa_do_GNU rua_do_GNU',
      ],
      correctAnswer: 2,
      // imageUrl: [],
    },
  ];

  gameStarted: boolean = false;
  currentPuzzle: number = 0;

  ngOnInit(): void {}

  startGame() {
    this.gameStarted = true;
  }
}
