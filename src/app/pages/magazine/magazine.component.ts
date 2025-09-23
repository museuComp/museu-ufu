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
    titulo: 'Revista Teste 1',//Depois retirar essas revistas de teste
    ano: 2025,
    paginas: [
      'public/magazine/revistaTeste2025/1.png',
      'public/magazine/revistaTeste2025/2.png',
      'public/magazine/revistaTeste2025/3.png',
      'public/magazine/revistaTeste2025/4.png',
      'public/magazine/revistaTeste2025/5.png',
      'public/magazine/revistaTeste2025/6.png',
      'public/magazine/revistaTeste2025/7.png',
      'public/magazine/revistaTeste2025/8.png',
      'public/magazine/revistaTeste2025/9.png',
      'public/magazine/revistaTeste2025/10.png',
    ],
    linkDownload: 'public/magazine/revistaTeste2025/revistaTeste.pdf',
  },
  {
    titulo: 'Revista Teste 2',
    ano: 2024,
    paginas: [
      'public/magazine/revistaTeste2024/1.png',
      'public/magazine/revistaTeste2024/2.png',
      'public/magazine/revistaTeste2024/3.png',
      'public/magazine/revistaTeste2024/4.png',
      'public/magazine/revistaTeste2024/5.png',
      'public/magazine/revistaTeste2024/6.png',
      'public/magazine/revistaTeste2024/7.png',
      'public/magazine/revistaTeste2024/8.png',
      'public/magazine/revistaTeste2024/9.png',
      'public/magazine/revistaTeste2024/10.png',

    ],
    linkDownload: 'public/magazine/trabalho1.pdf',
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