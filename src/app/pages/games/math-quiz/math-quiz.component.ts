import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Estrutura de dados idêntica à do Quiz modelo
interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

@Component({
  selector: 'app-math-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './math-quiz.component.html',
  styleUrls: ['./math-quiz.component.scss'],
})
export class MathQuizComponent implements OnInit {
  // Perguntas de matemática
  questions: Question[] = [
    {
      question: '1. Quanto é 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
    },
    {
      question: '2. Quanto é 5 * 8?',
      options: ['35', '40', '45', '50'],
      correctAnswer: 1,
    },
    {
      question: '3. Quanto é 10 - 3?',
      options: ['6', '7', '8', '9'],
      correctAnswer: 1,
    },
    {
      question: '4. Quanto é 12 / 4?',
      options: ['2', '3', '4', '6'],
      correctAnswer: 1,
    },
    {
      question: '5. Qual o próximo número na sequência: 2, 4, 6, 8, ...?',
      options: ['9', '10', '11', '12'],
      correctAnswer: 1,
    },
  ];

  // Variáveis de estado idênticas às do Quiz modelo
  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  score = 0;
  quizCompleted = false;
  showFeedback = false;
  isCorrect = false;

  constructor() {}

  ngOnInit(): void {}

  // Lógica de métodos idêntica à do Quiz modelo
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