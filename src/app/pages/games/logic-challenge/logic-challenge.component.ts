import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NavigationService } from '@app/services/navigation.service';

interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  year: number;
  imageUrl: string;
  isCorrect?: boolean;
}

@Component({
  selector: 'app-logic-challenge',
  standalone: true,
  imports: [CommonModule, RouterModule,DragDropModule],
  templateUrl: './logic-challenge.component.html',
  styleUrl: './logic-challenge.component.css'
})
export class LogicChallengeComponent implements OnInit {
  readonly nav = inject(NavigationService);
  events: TimelineEvent[] = [
    {
      id: 1,
      title: 'ENIAC',
      description: 'Primeiro computador eletrônico de grande escala',
      year: 1946,
      imageUrl: 'public/images/eniac_logic.png'
    },
    {
      id: 2,
      title: 'Intel 4004',
      description: 'Primeiro microprocessador comercial',
      year: 1971,
      imageUrl: 'public/images/intel.png'
    },
    {
      id: 3,
      title: 'Altair 8800',
      description: 'Primeiro computador pessoal comercial',
      year: 1975,
      imageUrl: 'public/images/altair.png'
    },
    {
      id: 4,
      title: 'World Wide Web',
      description: 'Criação da World Wide Web por Tim Berners-Lee',
      year: 1989,
      imageUrl: 'public/images/www.png'
    },
    {
      id: 5,
      title: 'iPhone',
      description: 'Lançamento do primeiro iPhone',
      year: 2007,
      imageUrl: 'public/images/iphone.png'
    }
  ];

  score: number = 0;
  gameStarted: boolean = false;
  gameCompleted: boolean = false;
  attempts: number = 0;
  isMobile: boolean = false;
  announcement: string = '';

  constructor() {
    this.shuffleEvents();
    this.checkScreenSize();
  }

  ngOnInit(): void {}

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  shuffleEvents(): void {
    this.events = [...this.events].sort(() => Math.random() - 0.5);
  }

  startGame(): void {
    this.gameStarted = true;
    this.gameCompleted = false;
    this.score = 0;
    this.attempts = 0;
    this.shuffleEvents();
    this.events.forEach(event => event.isCorrect = undefined);
    this.announcement = 'Novo desafio iniciado. Organize os ' + this.events.length +
      ' eventos em ordem cronológica usando os botões mover para cima e mover para baixo, ou arraste com o mouse.';
  }

  moveEvent(index: number, direction: 'up' | 'down'): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < this.events.length) {
      const event = this.events[index];
      this.events.splice(index, 1);
      this.events.splice(newIndex, 0, event);
      this.announcement = `${event.title} movido para a posição ${newIndex + 1} de ${this.events.length}.`;
    }
  }

  drop(event: CdkDragDrop<TimelineEvent[]>): void {
    moveItemInArray(this.events, event.previousIndex, event.currentIndex);
    const moved = this.events[event.currentIndex];
    this.announcement = `${moved.title} movido para a posição ${event.currentIndex + 1} de ${this.events.length}.`;
  }

  checkOrder(): void {
    this.attempts++;
    let correctPositions = 0;
    const totalEvents = this.events.length;

    // Cria uma cópia ordenada corretamente
    const sortedEvents = [...this.events].sort((a, b) => a.year - b.year);

    // Verifica se cada evento está na posição correta
    for (let i = 0; i < totalEvents; i++) {
      const isCorrect = this.events[i].id === sortedEvents[i].id;
      this.events[i].isCorrect = isCorrect;
      if (isCorrect) {
        correctPositions++;
      }
    }

    // Calcula a pontuação como uma porcentagem
    this.score = Math.round((correctPositions / totalEvents) * 100);

    // Verifica se todos os eventos estão na ordem correta
    const isFullyCorrect = correctPositions === totalEvents;
    if (isFullyCorrect) {
      this.gameCompleted = true;
      this.announcement = `Parabéns! Todos os ${totalEvents} eventos estão na ordem correta. Pontuação: ${this.score}.`;
    } else {
      this.announcement = `${correctPositions} de ${totalEvents} eventos na posição correta. Pontuação: ${this.score}. Continue ajustando a ordem.`;
    }
  }
}