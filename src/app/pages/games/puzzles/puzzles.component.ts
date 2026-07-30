import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Card {
  id: number;
  image: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

@Component({
  selector: 'app-puzzles',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './puzzles.component.html',
  styleUrls: ['./puzzles.component.css']
})
export class PuzzlesComponent implements OnInit {
  timeElapsed: string = '00:00';
  private timerInterval: any;
  private startTime: Date = new Date();
  cards: Card[] = [];
  private flippedCards: Card[] = [];
  private canFlip: boolean = true;
  gameWon: boolean = false;
  announcement: string = '';

  ngOnInit() {
    this.startNewGame();
    this.gameWon = false;
  }

  startNewGame() {
    // Resetar o timer
    this.gameWon = false;
    this.startTime = new Date();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.startTimer();

    // Inicializar as cartas
    const images: { image: string; name: string }[] = [
      { image: 'public/images/charles_babbage.png', name: 'Charles Babbage' },
      { image: 'public/images/ada_lovelace.png', name: 'Ada Lovelace' },
      { image: 'public/images/eniac.png', name: 'ENIAC' },
      { image: 'public/images/alan_turing.png', name: 'Alan Turing' },
      { image: 'public/images/transitor.png', name: 'Transistor' },
      { image: 'public/images/internet.png', name: 'Internet' },
      { image: 'public/images/steve_jobs.png', name: 'Steve Jobs' },
      { image: 'public/images/bill_gates.png', name: 'Bill Gates' },
      { image: 'public/images/quantum.png', name: 'Computação Quântica' }
    ];

    // Criar pares de cartas
    this.cards = [];
    let id = 1;
    images.forEach(({ image, name }) => {
      this.cards.push({ id: id++, image, name, isFlipped: false, isMatched: false });
      this.cards.push({ id: id++, image, name, isFlipped: false, isMatched: false });
    });

    // Embaralhar as cartas
    this.shuffleCards();
    this.announcement = 'Novo jogo iniciado. ' + this.cards.length + ' cartas embaralhadas.';
  }

  private shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  private startTimer() {
    this.timerInterval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - this.startTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      this.timeElapsed = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  flipCard(card: Card) {
    if (!this.canFlip || card.isFlipped || card.isMatched) {
      return;
    }

    card.isFlipped = true;
    this.flippedCards.push(card);
    this.announcement = `Carta virada: ${card.name}.`;

    if (this.flippedCards.length === 2) {
      this.canFlip = false;
      this.checkMatch();
    }
  }

  private checkMatch() {
    const [card1, card2] = this.flippedCards;

    if (card1.image === card2.image) {
      card1.isMatched = true;
      card2.isMatched = true;
      this.flippedCards = [];
      this.canFlip = true;
      this.announcement = `Par encontrado: ${card1.name}.`;

      // Verificar se o jogo acabou
      if (this.cards.every(card => card.isMatched)) {
        clearInterval(this.timerInterval);
        setTimeout(() => {
          this.gameWon = true;
          this.announcement = `Parabéns! Você completou o jogo da memória em ${this.timeElapsed}.`;
        }, 500);
      }
    } else {
      this.announcement = `${card1.name} e ${card2.name} não formam um par. Cartas serão fechadas novamente.`;
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.flippedCards = [];
        this.canFlip = true;
      }, 1000);
    }
  }

  /** Rótulo acessível de cada carta, usado no aria-label para leitores de tela. */
  getCardLabel(card: Card): string {
    if (card.isMatched) {
      return `Carta ${card.name}, par já encontrado.`;
    }
    if (card.isFlipped) {
      return `Carta ${card.name}, virada.`;
    }
    return `Carta fechada, posição ${this.cards.indexOf(card) + 1} de ${this.cards.length}. Pressione Enter para virar.`;
  }

  /** Permite virar a carta pelo teclado (Enter ou Espaço), equivalente ao clique do mouse. */
  onCardKeydown(event: KeyboardEvent, card: Card) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      this.flipCard(card);
    }
  }
}