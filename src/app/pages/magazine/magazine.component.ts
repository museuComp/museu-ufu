import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-magazine',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './magazine.component.html',
  styleUrl: './magazine.component.scss'
})
export class MagazineComponent {

  ngOnInit() {
  console.log('Revistas carregadas:', this.revistas);
}

  revistas = [
  {
    titulo: 'Revista 2024-2',
    ano: 2024,
    paginas: [
      'public/magazine/revista2024-2/1.jpg',
      'public/magazine/revista2024-2/2.jpg',
      'public/magazine/revista2024-2/3.jpg',
      'public/magazine/revista2024-2/4.jpg',
      'public/magazine/revista2024-2/5.jpg',
      'public/magazine/revista2024-2/6.jpg',
      'public/magazine/revista2024-2/7.jpg',
      'public/magazine/revista2024-2/8.jpg',
      'public/magazine/revista2024-2/9.jpg',
      'public/magazine/revista2024-2/10.jpg',
      'public/magazine/revista2024-2/11.jpg',
      'public/magazine/revista2024-2/12.jpg',
      'public/magazine/revista2024-2/13.jpg',
      'public/magazine/revista2024-2/14.jpg',
      'public/magazine/revista2024-2/15.jpg',
      'public/magazine/revista2024-2/16.jpg',
      'public/magazine/revista2024-2/17.jpg',
      'public/magazine/revista2024-2/18.jpg',
      'public/magazine/revista2024-2/19.jpg',
      'public/magazine/revista2024-2/20.jpg',
      'public/magazine/revista2024-2/21.jpg',
      'public/magazine/revista2024-2/22.jpg',
      'public/magazine/revista2024-2/23.jpg',
      'public/magazine/revista2024-2/24.jpg',
      'public/magazine/revista2024-2/25.jpg',
      'public/magazine/revista2024-2/26.jpg',
      'public/magazine/revista2024-2/27.jpg',
      'public/magazine/revista2024-2/28.jpg',
      'public/magazine/revista2024-2/29.jpg',
      'public/magazine/revista2024-2/30.jpg',
      'public/magazine/revista2024-2/31.jpg',
      'public/magazine/revista2024-2/32.jpg',
      'public/magazine/revista2024-2/33.jpg',
      'public/magazine/revista2024-2/34.jpg',
      'public/magazine/revista2024-2/35.jpg',
      'public/magazine/revista2024-2/36.jpg',
      'public/magazine/revista2024-2/37.jpg',
      'public/magazine/revista2024-2/38.jpg',
      'public/magazine/revista2024-2/39.jpg',
      'public/magazine/revista2024-2/40.jpg',
      'public/magazine/revista2024-2/41.jpg',
      'public/magazine/revista2024-2/42.jpg',
      'public/magazine/revista2024-2/43.jpg',
      'public/magazine/revista2024-2/44.jpg',
      'public/magazine/revista2024-2/45.jpg',
      'public/magazine/revista2024-2/46.jpg',
      'public/magazine/revista2024-2/47.jpg',
      'public/magazine/revista2024-2/48.jpg',
      'public/magazine/revista2024-2/49.jpg',
      'public/magazine/revista2024-2/50.jpg', 
      'public/magazine/revista2024-2/51.jpg',
      'public/magazine/revista2024-2/52.jpg',
      'public/magazine/revista2024-2/53.jpg',
      'public/magazine/revista2024-2/54.jpg',
      'public/magazine/revista2024-2/55.jpg',
      'public/magazine/revista2024-2/56.jpg',
      'public/magazine/revista2024-2/57.jpg',
      'public/magazine/revista2024-2/58.jpg',
      'public/magazine/revista2024-2/59.jpg',
      'public/magazine/revista2024-2/60.jpg',
      'public/magazine/revista2024-2/61.jpg',
      'public/magazine/revista2024-2/62.jpg',
      'public/magazine/revista2024-2/63.jpg',
      'public/magazine/revista2024-2/64.jpg',
      'public/magazine/revista2024-2/65.jpg',
    ],
    linkDownload: 'public/magazine/revista2024-2/revista2024-2.pdf',
  },
  {
    titulo: 'Revista 2025-1',
    ano: 2025,
    paginas: [
      'public/magazine/revista2025-1/1.jpg',
      'public/magazine/revista2025-1/2.jpg',
      'public/magazine/revista2025-1/3.jpg',
      'public/magazine/revista2025-1/4.jpg',
      'public/magazine/revista2025-1/5.jpg',
      'public/magazine/revista2025-1/6.jpg',
      'public/magazine/revista2025-1/7.jpg',
      'public/magazine/revista2025-1/8.jpg',
      'public/magazine/revista2025-1/9.jpg',
      'public/magazine/revista2025-1/10.jpg',
      'public/magazine/revista2025-1/11.jpg',
      'public/magazine/revista2025-1/12.jpg',
      'public/magazine/revista2025-1/13.jpg',
      'public/magazine/revista2025-1/14.jpg',
      'public/magazine/revista2025-1/15.jpg',
      'public/magazine/revista2025-1/16.jpg',
      'public/magazine/revista2025-1/17.jpg',
      'public/magazine/revista2025-1/18.jpg',
      'public/magazine/revista2025-1/19.jpg',
      'public/magazine/revista2025-1/20.jpg',
      'public/magazine/revista2025-1/21.jpg',
      'public/magazine/revista2025-1/22.jpg',
      'public/magazine/revista2025-1/23.jpg',
      'public/magazine/revista2025-1/24.jpg',
      'public/magazine/revista2025-1/25.jpg',
      'public/magazine/revista2025-1/26.jpg',
      'public/magazine/revista2025-1/27.jpg',
      'public/magazine/revista2025-1/28.jpg',

    ],
    linkDownload: 'public/magazine/revista2025-1/revista2025-1.pdf',
  },
];

revistaAtual = 0;
paginaAtual = 0;

paginaAnterior() {
  if (this.paginaAtual > 0) {
    this.paginaAtual--;
  }
}

proximaPagina() {
  if (this.paginaAtual < this.revistas[this.revistaAtual].paginas.length - 1) {
    this.paginaAtual++;
  }
}

selecionarRevista(index: number) {
  this.revistaAtual = index;
  this.paginaAtual = 0;
}


}