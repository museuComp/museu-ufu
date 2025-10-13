import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Estrutura de dados idêntica à do componente 'quiz'
interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

@Component({
  selector: 'app-history-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-quiz.component.html',
  styleUrls: ['./history-quiz.component.scss'], // Mantive a extensão .scss, mas o conteúdo será o mesmo do .css
})
export class HistoryQuizComponent implements OnInit {
  // Perguntas do 'history-quiz' adaptadas para a nova estrutura
  questions: Question[] = [
    {
      question: '1. Qual invenção é considerada um dos pilares da Revolução Industrial?',
      options: ['Motor a vapor', 'Telefone', 'Lâmpada elétrica', 'Computador'],
      correctAnswer: 0, // Motor a vapor
    },
    {
      question: '2. Quem foi a primeira pessoa a programar, creditada por escrever o primeiro algoritmo para uma máquina?',
      options: ['Ada Lovelace', 'Marie Curie', 'Grace Hopper', 'Katherine Johnson'],
      correctAnswer: 0, // Ada Lovelace
    },
    {
      question: '3. Qual evento marcou o início da "Corrida Espacial" entre os EUA e a União Soviética?',
      options: ['O lançamento do Sputnik 1', 'A chegada do homem à Lua', 'A criação da NASA', 'O voo de Yuri Gagarin'],
      correctAnswer: 0, // O lançamento do Sputnik 1
    },
    {
      question: '4. O ENIAC, um dos primeiros computadores eletrônicos, foi desenvolvido durante qual guerra?',
      options: ['Segunda Guerra Mundial', 'Guerra Fria', 'Guerra do Vietnã', 'Primeira Guerra Mundial'],
      correctAnswer: 0, // Segunda Guerra Mundial
    },
    {
      question: '5. A World Wide Web (WWW) foi inventada por qual cientista no CERN?',
      options: ['Tim Berners-Lee', 'Vint Cerf', 'Robert Kahn', 'Steve Wozniak'],
      correctAnswer: 0, // Tim Berners-Lee
    },
  ];

  // Variáveis de estado copiadas do componente 'quiz'
  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  score = 0;
  quizCompleted = false;
  showFeedback = false;
  isCorrect = false;

  constructor() {}

  ngOnInit(): void {}

  // Métodos de lógica copiados do componente 'quiz'
  selectAnswer(index: number): void {
    if (this.selectedAnswer !== null) return; // Impede múltiplas seleções

    this.selectedAnswer = index;
    this.showFeedback = true;
    this.isCorrect = index === this.questions[this.currentQuestionIndex].correctAnswer;

    if (this.isCorrect) {
      this.score++;
    }

    setTimeout(() => {
      this.nextQuestion();
    }, 1500); // Espera 1.5 segundos antes de ir para a próxima questão
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