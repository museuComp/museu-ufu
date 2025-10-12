import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Question {
  question: string;
  options: string[];
  correct: number;
  userAnswer?: number;
}

@Component({
  selector: 'app-math-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './math-quiz.component.html',
  styleUrls: ['./math-quiz.component.scss']
})
export class MathQuizComponent implements OnInit {

  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  score: number = 0;
  quizCompleted: boolean = false;
  feedbackMessage: string = '';

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.questions = [
      { question: 'Quanto é 5 + 7?', options: ['10', '11', '12', '13'], correct: 2 },
      { question: 'Quanto é 9 × 3?', options: ['18', '27', '36', '21'], correct: 1 },
      { question: 'Quanto é 15 ÷ 5?', options: ['2', '3', '4', '5'], correct: 1 },
      { question: 'Quanto é 12 − 4?', options: ['6', '7', '8', '9'], correct: 2 }
    ];
  }

  selectAnswer(optionIndex: number): void {
    const current = this.questions[this.currentQuestionIndex];

    if (current.userAnswer !== undefined) return; // não permitir mudar a resposta
    current.userAnswer = optionIndex;

    if (optionIndex === current.correct) {
      this.score++;
      this.feedbackMessage = '✅ Resposta correta!';
    } else {
      this.feedbackMessage = '❌ Resposta incorreta!';
    }
  }

  nextQuestion(): void {
    this.feedbackMessage = '';
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.quizCompleted = true;
    }
  }

  restartQuiz(): void {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.quizCompleted = false;
    this.feedbackMessage = '';
    this.questions.forEach(q => q.userAnswer = undefined);
  }
}
