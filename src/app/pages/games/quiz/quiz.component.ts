import { Component, inject, OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '@app/services/navigation.service';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
})
export class QuizComponent implements OnInit {
  readonly nav = inject(NavigationService);
  questions: Question[] = [
    {
      question: '1. Quem é considerado o "pai da computação"?',
      options: ['Alan Turing', 'Steve Jobs', 'Bill Gates', 'Charles Babbage'],
      correctAnswer: 0 // Alan Turing 
    },
    {
      question: '2. O que é um algoritmo?',
      options: [
        'Uma sequência de passos para resolver um problema',
        'Um tipo de vírus de computador',
        'Um programa que limpa a memória RAM',
        'Um dispositivo de armazenamento de dados'
      ],
      correctAnswer: 0 // Uma sequência de passos para resolver um problema
    },
    {
      question: '3. Qual foi o primeiro computador eletrônico de uso geral?',
      options: ['ENIAC', 'UNIVAC', 'IBM 701', 'Z3'],
      correctAnswer: 0 // ENIAC
    },
    {
      question: '4. Em qual linguagem de programação o sistema operacional UNIX foi reescrito nos anos 70?',
      options: ['C', 'Assembly', 'Pascal', 'Java'],
      correctAnswer: 0 // C
    },
    {
      question: '5. Qual destes dispositivos é considerado apenas de entrada (input)?',
      options: ['Teclado', 'Impressora', 'Monitor', 'Pen drive'],
      correctAnswer: 0 // Teclado
    }
  ];

  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  score = 0;
  quizCompleted = false;
  showFeedback = false;
  isCorrect = false;

  constructor() { }

  ngOnInit(): void {
  }

  selectAnswer(index: number): void {
    this.selectedAnswer = index;
    this.showFeedback = true;
    this.isCorrect = index === this.questions[this.currentQuestionIndex].correctAnswer;
    
    if (this.isCorrect) {
      this.score++;
    }

    setTimeout(() => {
      this.nextQuestion();
    }, 1500);
  }

  nextQuestion(): void {
    this.showFeedback = false;
    this.selectedAnswer = null;
    
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.quizCompleted = true;
    }
  }

  resetQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.score = 0;
    this.quizCompleted = false;
    this.showFeedback = false;
  }
}
