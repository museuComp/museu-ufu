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
  'public/magazine/revista2024-2/revista2024-2_page-0001.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0002.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0003.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0004.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0005.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0006.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0007.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0008.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0009.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0010.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0011.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0012.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0013.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0014.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0015.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0016.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0017.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0018.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0019.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0020.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0021.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0022.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0023.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0024.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0025.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0026.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0027.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0028.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0029.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0030.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0031.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0032.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0033.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0034.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0035.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0036.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0037.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0038.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0039.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0040.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0041.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0042.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0043.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0044.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0045.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0046.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0047.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0048.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0049.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0050.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0051.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0052.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0053.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0054.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0055.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0056.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0057.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0058.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0059.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0060.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0061.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0062.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0063.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0064.jpg',
  'public/magazine/revista2024-2/revista2024-2_page-0065.jpg',
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