import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { provideTranslocoScope, TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Observable, Subscription } from 'rxjs';

declare var pannellum: any;

@Component({
  selector: 'app-virtual-tour',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  providers: [provideTranslocoScope('institutional')],
  templateUrl: './virtual-tour.component.html',
  styleUrl: './virtual-tour.component.scss'
})
export class VirtualTourComponent implements OnInit, OnDestroy {
  private readonly transloco = inject(TranslocoService);

  imagemSelecionada: string | null = null;
  lang$: Subscription;

  indiceAtualTimeline = 0;

  readonly imagensTimeline = [
    'public/itens/disquete8.jpg',
    'public/itens/disquetes.jpg',
    'public/itens/cdrom.jpg',
    'public/itens/pendrive.jpg',
    'public/itens/hd.jpg',
    'public/itens/ssd.jpg',
    'public/itens/m2.jpg'
  ];

  readonly imagensItensMuseu = [
    'public/itens/gravador_thumb.jpg',
    'public/itens/maquina_escrever_thumb.jpg',
    'public/itens/caixa_disquetes_thumb.jpg',
    'public/itens/perifericos_antigos_thumb.jpg',
    'public/itens/calculadora_antiga_thumb.jpg',
    'public/itens/modelo_antigo_impressora_thumb.jpg',
    'public/itens/ossos_de_naipier_thumb.jpg',
    'public/itens/placa_video_thumb.jpg',
    'public/itens/video_player_thumb.jpg',
    'public/itens/equipamento_rede_thumb.jpg',
    'public/itens/modulos_rede_thumb.jpg',
    'public/itens/colecao_HD_thumb.jpg',
    'public/itens/ps1_thumb.jpg',
    'public/itens/sistema_antigo_thumb.jpg',
    'public/itens/supergame_thumb.jpg',
    'public/itens/teclado_ibm_thumb.jpg',
    'public/itens/video_computer_system_thumb.jpg',
    'public/itens/web_cam_thumb.jpg',
    'public/itens/gabinete_antigo2_thumb.jpg',
    'public/itens/modulos_rede_conectividade_thumb.jpg',
    'public/itens/retroprojetor_thumb.jpg',
    'public/itens/switches_hubs_thumb.jpg',
    'public/itens/colecao_celulares_thumb.jpg',
    'public/itens/colecao_ipad_thumb.jpg',
    'public/itens/servidor_torre_ibm_thumb.jpg'
  ];

  linhaDoTempoArmazenamento = [];
  itensMuseu = []

  ngOnInit() {
    this.lang$ = this.transloco.langChanges$.subscribe(() => {
      this.loadTranslatedItems();
    });

    this.initPannellum();
  }

  private loadTranslatedItems(): void {
    this.transloco.load('institutional/' + this.transloco.getActiveLang()).subscribe(() => {

    const timeline = this.transloco.translateObject<any[]>('institutional.storage.timeline');
    this.linhaDoTempoArmazenamento = timeline.map((item, i) => ({
      titulo: item.title,
      ano: item.year,
      descricao: item.description,
      imagem: this.imagensTimeline[i]
    }));

    const items = this.transloco.translateObject<any[]>('institutional.museumItems');
    this.itensMuseu = items.map((item, i) => ({
      titulo: item.title,
      descricao: item.description,
      imagem: this.imagensItensMuseu[i]
    }));
  });
  }
  private initPannellum(): void {
    pannellum.viewer('panorama', {
      type: 'equirectangular',
      panorama: 'public/visita-virtual/sala360.jpg',
      autoLoad: true,
      showZoomCtrl: true,
      compass: false,
      pitch: 0,
      yaw: 0,
      hfov: 110
    });
}
  proximoItemTimeline(): void {
    if (this.indiceAtualTimeline < this.linhaDoTempoArmazenamento.length - 1) {
      this.indiceAtualTimeline++;
    }
  }

  itemAnteriorTimeline(): void {
    if (this.indiceAtualTimeline > 0) {
      this.indiceAtualTimeline--;
    }
  }

  irParaItemTimeline(index: number): void {
    this.indiceAtualTimeline = index;
  }

  abrirImagem(imagemUrl: string): void {
    this.imagemSelecionada = imagemUrl;
  }

  fecharImagem(): void {
    this.imagemSelecionada = null;
  }

  ngOnDestroy(): void {
    this.lang$.unsubscribe();
  }
}
