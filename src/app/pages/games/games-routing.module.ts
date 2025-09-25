import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LogicChallengeComponent} from './logic-challenge/logic-challenge.component';
import {PuzzlesComponent} from './puzzles/puzzles.component';
import {QuizComponent} from './quiz/quiz.component';
import {TruthTableComponent} from './truth-table/truth-table.component';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./games.component').then(m => m.GamesComponent),
    children: [
      { path: 'logic-challenge', component: LogicChallengeComponent },
      { path: 'puzzles', component: PuzzlesComponent },
      { path: 'quiz', component: QuizComponent },
      {path: 'truth-table', component: TruthTableComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GamesRoutingModule { }
