import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreMagazineService, Magazine } from '../../../core/services/firestore-magazine.service';

@Component({
  selector: 'app-magazine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './magazine.component.html',
  styleUrl: './magazine.component.scss'
})
export class MagazineComponent implements OnInit {

  private firestoreMagazineService = inject(FirestoreMagazineService);

  revistas: Magazine[] = [];

  revistaAtual = 0;
  paginaAtual = 0;

  constructor() {}
  
  ngOnInit() {
    this.firestoreMagazineService.getAllMagazines().subscribe(magazines => {
      this.revistas = magazines;

      console.log(this.revistas);
    });
  }

  paginaAnterior() {
    if (this.paginaAtual > 0) {
      this.paginaAtual--;
    }
  }

  proximaPagina() {
    if (this.paginaAtual < this.revistas[this.revistaAtual].pages.length - 1) {
      this.paginaAtual++;
    }
  }

  selecionarRevista(index: number) {
    this.revistaAtual = index;
    this.paginaAtual = 0;
  }

}