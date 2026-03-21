import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

interface TopPage {
  title: string;
  category: string;
  views: number;
  trend: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  // KPIs (Indicadores Chave de Performance) - Dados Fictícios
  totalViews = 12450;
  uniqueVisitors = 8320;
  avgTimeOnSite = '2m 45s';
  bounceRate = 42.5;

  // Tabela de Notícias Mais Acessadas
  displayedColumns: string[] = ['title', 'category', 'views', 'trend'];
  topPages: TopPage[] = [
    { title: 'Nova Exposição de Arte Moderna', category: 'Exposições', views: 3420, trend: 'up' },
    { title: 'Palestra sobre Tecnologia e Futuro', category: 'Eventos', views: 2150, trend: 'up' },
    { title: 'Resultados da Pesquisa Anual', category: 'Pesquisa', views: 1840, trend: 'neutral' },
    { title: 'Inscrições Abertas para Cursos', category: 'Educação', views: 1200, trend: 'down' },
    { title: 'Atualização do Sistema Interno', category: 'Notícias', views: 950, trend: 'down' },
  ];

  // Gráfico Simulado (Barras CSS) - Visitas dos últimos 7 dias
  weeklyTraffic = [
    { day: 'Seg', visits: 1200, height: '40%' },
    { day: 'Ter', visits: 1800, height: '60%' },
    { day: 'Qua', visits: 2400, height: '80%' },
    { day: 'Qui', visits: 2100, height: '70%' },
    { day: 'Sex', visits: 1500, height: '50%' },
    { day: 'Sáb', visits: 3000, height: '100%' }, // Pico de acessos
    { day: 'Dom', visits: 2700, height: '90%' },
  ];

  constructor() {}

  ngOnInit(): void {
    // No futuro, você pode chamar um serviço aqui para buscar os dados reais
    // ex: this.analyticsService.getStats().subscribe(...)
  }
}