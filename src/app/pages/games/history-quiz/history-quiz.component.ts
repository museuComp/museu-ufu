import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Question {
  question: string;
  options: string[];
  correct: number;
  userAnswer?: number;
}

@Component({
  selector: 'app-history-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-quiz.component.html',
  styleUrls: ['./history-quiz.component.scss']
})
export class HistoryQuizComponent implements OnInit {

  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  score: number = 0;
  quizCompleted: boolean = false;

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.questions = [
      {
        question: 'Quem é considerado o pai da computação?',
        options: ['Charles Babbage', 'Alan Turing', 'Bill Gates', 'Steve Jobs'],
        correct: 0
      },
      {
        question: 'Qual foi o primeiro computador eletrônico de grande escala?',
        options: ['Colossus', 'ENIAC', 'UNIVAC', 'Altair 8800'],
        correct: 1
      },
      {
        question: 'Quem fundou a Microsoft?',
        options: ['Steve Jobs', 'Mark Zuckerberg', 'Bill Gates e Paul Allen', 'Larry Page'],
        correct: 2
      },
      {
        question: 'O que significa a sigla RAM?',
        options: ['Random Access Memory', 'Read Access Memory', 'Run Access Memory', 'Rapid Access Memory'],
        correct: 0
      }
    ];
  }

  selectAnswer(optionIndex: number): void {
    const current = this.questions[this.currentQuestionIndex];
    if (current.userAnswer !== undefined) return;
    current.userAnswer = optionIndex;

    if (optionIndex === current.correct) {
      this.score++;
    }
  }

  nextQuestion(): void {
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
    this.questions.forEach(q => q.userAnswer = undefined);
  }
}
