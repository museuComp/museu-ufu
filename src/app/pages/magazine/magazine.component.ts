import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { magazines } from './magazine.mock';

@Component({
  selector: 'app-magazine',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './magazine.component.html',
  styleUrl: './magazine.component.scss'
})
export class MagazineComponent {

  revistas = magazines;
  
  ngOnInit() {
  console.log('Revistas carregadas:', this.revistas);
}

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