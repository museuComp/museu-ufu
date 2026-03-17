import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Puzzle {
  question: string;
  // image: string;
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
  currentPuzzle: number = 0;

  puzzles: Puzzle[] = [
    {
      question: '1.Descubra onde está Tux',
      // image: [],
      options: ['$pwd', '$mkdir tux', '$where tux', '$ls'],
      correctAnswer: 0,
    },
  ];

  ngOnInit(): void {}

  startNewGame() {}
}
