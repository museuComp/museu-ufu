import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Interface usada para padronizar os dados de cada jogo exibido na página.
type GameCard = {
  title: string;
  description: string;
  route: string;
  iconClass: string;
};

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css'],
})
export class GamesComponent {
  // Lista centralizada dos jogos exibidos na página
  games: GameCard[] = [
    {
      title: 'Quiz',
      description: 'Teste seus conhecimentos sobre o museu com perguntas divertidas!',
      route: './quiz',
      iconClass: 'fas fa-question-circle',
    },
    {
      title: 'Jogo da Memória',
      description: 'Complete o jogo da memória com imagens da história da computação.',
      route: './puzzles',
      iconClass: 'fas fa-puzzle-piece',
    },
    {
      title: 'Desafio Lógico',
      description: 'Resolva desafios e enigmas relacionados ao acervo do museu!',
      route: './logic-challenge',
      iconClass: 'fas fa-brain',
    },
    {
      title: 'Caça Palavras',
      description: 'Jogue um caça-palavras temático sobre a história da computação.',
      route: './word-search',
      iconClass: 'fas fa-dumbbell',
    },
    {
      title: 'Tabela Verdade',
      description: 'Teste seus conhecimentos em lógica booleana completando as tabelas de cada expressão.',
      route: './truth-table',
      iconClass: 'fas fa-desktop',
    },
    {
      title: 'Quiz de Matemática',
      description: 'Resolva perguntas de matemática e teste suas habilidades.',
      route: './math-quiz',
      iconClass: 'fas fa-calculator',
    },
    {
      title: 'Quiz de História',
      description: 'Teste seus conhecimentos sobre a história da computação!',
      route: './history-quiz',
      iconClass: 'fas fa-book',
    },
    {
      title: 'Computing Dungeons',
      description: 'Explore as masmorras e aprenda sobre a história da computação!',
      route: './computing-dungeons',
      iconClass: 'fas fa-dungeon',
    },
    {
      title: 'MuseuDle',
      description: 'Adivinhe o artefato do dia sobre a história da computação!',
      route: './museudle',
      iconClass: 'fas fa-lightbulb',
    },
    {
      title: 'Puzzle de Linux',
      description: 'Aprenda comandos básicos do sistema operacional Linux!',
      route: './linux-puzzle',
      iconClass: 'fas fa-terminal',
    },
  ];
}