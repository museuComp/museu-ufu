import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Interface usada para padronizar os dados de cada jogo exibido na página.
type GameCard = {
  title: string;
  description: string;
  route: string;
  iconClass: string;
  image: string;
  imageAlt: string;
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
  image: 'public/images/games/quiz.png',
  imageAlt: 'Imagem de referência do jogo Quiz',
},
    {
      title: 'Jogo da Memória',
      description: 'Complete o jogo da memória com imagens da história da computação.',
      route: './puzzles',
      iconClass: 'fas fa-puzzle-piece',
      image: 'public/images/games/memory-game.png',
      imageAlt: 'Imagem de referência do jogo Jogo da Memória',
    },
    {
      title: 'Desafio Lógico',
      description: 'Resolva desafios e enigmas relacionados ao acervo do museu!',
      route: './logic-challenge',
      iconClass: 'fas fa-brain',
      image: 'public/images/games/logic-challenge.png',
      imageAlt: 'Imagem de referência do jogo Desafio Lógico',
    },
    {
      title: 'Caça Palavras',
      description: 'Jogue um caça-palavras temático sobre a história da computação.',
      route: './word-search',
      iconClass: 'fas fa-dumbbell',
      image: 'public/images/games/word-search.png',
      imageAlt: 'Imagem de referência do jogo Caça Palavras', 
    },
    {
      title: 'Tabela Verdade',
      description: 'Teste seus conhecimentos em lógica booleana completando as tabelas de cada expressão.',
      route: './truth-table',
      iconClass: 'fas fa-desktop',
      image: 'public/images/games/truth-table.png',
      imageAlt: 'Imagem de referência do jogo Tabela Verdade',
    },
    {
      title: 'Quiz de Matemática',
      description: 'Resolva perguntas de matemática e teste suas habilidades.',
      route: './math-quiz',
      iconClass: 'fas fa-calculator',
      image: 'public/images/games/math-quiz.png',
      imageAlt: 'Imagem de referência do jogo Quiz de Matemática',
    },
    {
      title: 'Quiz de História',
      description: 'Teste seus conhecimentos sobre a história da computação!',
      route: './history-quiz',
      iconClass: 'fas fa-book',
      image: 'public/images/games/history-quiz.png',
      imageAlt: 'Imagem de referência do jogo Quiz de História',
    },
    {
      title: 'Computing Dungeons',
      description: 'Explore as masmorras e aprenda sobre a história da computação!',
      route: './computing-dungeons',
      iconClass: 'fas fa-dungeon',
      image: 'public/images/games/computing-dungeons.png',
      imageAlt: 'Imagem de referência do jogo Computing Dungeons',
    },
    {
      title: 'MuseuDle',
      description: 'Adivinhe o artefato do dia sobre a história da computação!',
      route: './museudle',
      iconClass: 'fas fa-lightbulb',
      image: 'public/images/games/museudle.png',
      imageAlt: 'Imagem de referência do jogo MuseuDle',
    },
    {
      title: 'Puzzle de Linux',
      description: 'Aprenda comandos básicos do sistema operacional Linux!',
      route: './linux-puzzle',
      iconClass: 'fas fa-terminal',
      image: 'public/images/games/linux-puzzle.png',
      imageAlt: 'Imagem de referência do jogo Puzzle de Linux',
    },
  ];
}