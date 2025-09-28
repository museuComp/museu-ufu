import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsComponent } from './news.component';
import { NewsFormComponent } from './news-form/news-form.component';
import { NewsDetailComponent } from './news-detail.component';
import { authGuard } from '../../core/auth/services/auth.service';

const routes: Routes = [
  {
    path: '',
    component: NewsComponent
  },
  {
    path: 'create',
    component: NewsFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    component: NewsFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'detail/:id',
    component: NewsDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { }
