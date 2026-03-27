import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';

declare var pannellum: any;

@Component({
  selector: 'app-virtual-tour',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './virtual-tour.component.html',
  styleUrl: './virtual-tour.component.scss'
})
export class VirtualTourComponent implements AfterViewInit {
  imagemSelecionada: string | null = null;

  indiceAtualTimeline = 0;

  linhaDoTempoArmazenamento = [
    {
      titulo: 'Disquete 8"',
      ano: '1971',
      descricao: 'Os primeiros disquetes comerciais criados pela IBM, estabelecendo a base do armazenamento portátil.',
      imagem: 'public/itens/disquete8.jpg' 
    },
    {
      titulo: 'Disquete 5.25" e 3.5"',
      ano: 'Anos 80 e 90',
      descricao: 'Formatos mais compactos e rígidos que se tornaram o padrão absoluto nos primeiros computadores pessoais.',
      imagem: 'public/itens/disquetes.jpg'
    },
    {
      titulo: 'CD-ROM',
      ano: '1982',
      descricao: 'O disco óptico revolucionou a capacidade de armazenamento, permitindo a era dos jogos multimídia e softwares pesados.',
      imagem: 'public/itens/cdrom.jpg'
    },
    {
      titulo: 'Pendrive (USB)',
      ano: '2000',
      descricao: 'A memória flash portátil que decretou o fim dos disquetes pela sua velocidade, tamanho diminuto e resistência.',
      imagem: 'public/itens/pendrive.jpg'
    },
    {
      titulo: 'Disco Rígido (HD SATA)',
      ano: 'Evolução contínua',
      descricao: 'Discos magnéticos de alta capacidade que dominaram os PCs por décadas devido ao baixo custo por Gigabyte.',
      imagem: 'public/itens/hd.jpg'
    },
    {
      titulo: 'SSD SATA',
      ano: 'Anos 2000',
      descricao: 'Unidades de estado sólido sem partes mecânicas móveis. Trouxeram um ganho massivo em velocidade de leitura e gravação.',
      imagem: 'public/itens/ssd.jpg'
    },
    {
      titulo: 'SSD NVMe M.2',
      ano: 'Atualidade',
      descricao: 'O padrão moderno. Conectado diretamente à placa-mãe, eliminou os cabos e oferece velocidades extremas.',
      imagem: 'public/itens/m2.jpg'
    }
  ];

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

  itensMuseu = [
    {
      titulo: 'Gravador Panasonic',
      descricao: 'Gravador de voz portátil a minicassete, equipamento clássico usado para entrevistas e anotações de áudio antes dos gravadores digitais.',
      imagem: 'public/itens/gravador.jpg'
    },
    {
      titulo: 'Máquina de escrever',
      descricao: 'Máquina de escrever, o equipamento mecânico padrão para a produção de documentos de texto antes da popularização dos computadores.',
      imagem: 'public/itens/maquina_escrever.jpg'
    },
    {
      titulo: 'Caixa de disquetes',
      descricao: 'Disquetes flexíveis de 5,25 polegadas, uma das mídias físicas mais populares para armazenamento e transferência de dados nos primórdios da computação pessoal.',
      imagem: 'public/itens/caixa_disquetes.jpg'
    },
    {
      titulo: 'Periféricos antigos',
      descricao: 'Conjunto de caixas de som e periféricos, componentes essenciais de multimídia e conectividade dos antigos computadores de mesa.',
      imagem: 'public/itens/perifericos_antigos.jpg'
    },
    {
      titulo: 'Calculadora Facit',
      descricao: 'Calculadora mecânica histórica, utilizada em escritórios para realizar operações matemáticas antes da invenção das calculadoras eletrônicas.',
      imagem: 'public/itens/calculadora_antiga.jpg'
    },
    {
      titulo: 'Impressora HP',
      descricao: 'Modelo antigo de impressora a laser, equipamento que revolucionou a velocidade e a qualidade da impressão de documentos em escritórios.',
      imagem: 'public/itens/modelo_antigo_impressora.jpg'
    },
    {
      titulo: 'Ossos de Napier',
      descricao: 'Instrumento histórico conhecido como "Ossos de Napier", criado no século XVII e considerado um dos primeiros dispositivos manuais para facilitar cálculos matemáticos.',
      imagem: 'public/itens/ossos_de_naipier.jpg'
    },
    {
      titulo: 'Placa de vídeo',
      descricao: 'Placa de vídeo de gerações passadas, componente de hardware responsável por processar gráficos e jogos nos computadores.',
      imagem: 'public/itens/placa_video.jpg'
    },
    {
      titulo: 'DVD Player portátil',
      descricao: 'Reprodutor portátil de DVDs, um dispositivo clássico de entretenimento de vídeo pessoal antes do surgimento dos tablets e do streaming.',
      imagem: 'public/itens/video_player.jpg'
    },
    {
      titulo: 'Equipamento de Rede IBM',
      descricao: 'Dispositivo clássico de infraestrutura utilizado para conectar redes de computadores nas empresas.',
      imagem: 'public/itens/equipamento_rede.jpg'
    },
    {
      titulo: 'Módulos de Comunicação',
      descricao: 'Componentes essenciais que formavam a base da comunicação de dados em redes corporativas antigas.',
      imagem: 'public/itens/modulos_rede.jpg'
    },
    {
      titulo: 'Discos Rígidos Antigos',
      descricao: 'Peças fundamentais para o armazenamento de dados locais nas gerações passadas de computadores.',
      imagem: 'public/itens/colecao_HD.jpg'
    },
    {
      titulo: 'Console PS One',
      descricao: 'Videogame histórico que popularizou os jogos em mídia de CD e marcou o entretenimento digital.',
      imagem: 'public/itens/ps1.jpg'
    },
    {
      titulo: 'Interior de PC Clássico',
      descricao: 'Visão interna de um computador de mesa antigo, evidenciando o padrão de hardware de gerações passadas.',
      imagem: 'public/itens/sistema_antigo.jpg'
    },
    {
      titulo: 'Console Supergame CCE',
      descricao: 'Sistema de videogame retrô que levou os primeiros jogos de cartucho para muitas casas no Brasil.',
      imagem: 'public/itens/supergame.jpg'
    },
    {
      titulo: 'Teclado Clássico IBM',
      descricao: 'Periférico robusto e tradicional que marcou a digitação nos antigos computadores de mesa.',
      imagem: 'public/itens/teclado_ibm.jpg'
    },
    {
      titulo: 'Video Computer System',
      descricao: 'Console histórico que representa o início da popularização e a era de ouro dos videogames caseiros.',
      imagem: 'public/itens/video_computer_system.jpg'
    },
    {
      titulo: 'Câmera e Webcam Clássicas',
      descricao: 'Primeiros dispositivos utilizados para captura de imagem e comunicação visual nos primórdios da internet.',
      imagem: 'public/itens/web_cam.jpg'
    },
    {
      titulo: 'Gabinete de PC Clássico',
      descricao: 'Estrutura de cor bege tradicional que abrigava os componentes de hardware dos computadores de mesa em décadas passadas.',
      imagem: 'public/itens/gabinete_antigo2.jpg'
    },
    {
      titulo: 'Módulos de Rede e Conectividade',
      descricao: 'Dispositivos de comutação e transmissão essenciais para estabelecer a comunicação nas primeiras infraestruturas de rede corporativa.',
      imagem: 'public/itens/modulos_rede_conectividade.jpg'
    },
    {
      titulo: 'Retroprojetor',
      descricao: 'Equipamento óptico clássico amplamente utilizado em salas de aula e apresentações para projetar transparências antes da era digital.',
      imagem: 'public/itens/retroprojetor.jpg'
    },
    {
      titulo: 'Painel de Switches e Hubs',
      descricao: 'Conjunto de equipamentos de distribuição de rede responsáveis por interligar múltiplos computadores nos antigos ambientes de trabalho.',
      imagem: 'public/itens/switches_hubs.jpg'
    },
    {
      titulo: 'Coleção de Celulares Clássicos',
      descricao: 'Acervo de aparelhos que ilustra as fases iniciais e a evolução do design na história da comunicação móvel.',
      imagem: 'public/itens/colecao_celulares.jpg'
    },
    {
      titulo: 'Coleção de Embalagens de iPad',
      descricao: 'Caixas das primeiras gerações do tablet da Apple, dispositivo que ajudou a definir o mercado moderno de computação móvel.',
      imagem: 'public/itens/colecao_ipad.jpg'
    },
    {
      titulo: 'Servidor Torre IBM',
      descricao: 'Robusto computador corporativo utilizado para o processamento intenso e o armazenamento centralizado de dados em empresas.',
      imagem: 'public/itens/servidor_torre_ibm.jpg'
    }
  ];
  
  abrirImagem(imagemUrl: string): void {
    this.imagemSelecionada = imagemUrl;
  }

  fecharImagem(): void {
    this.imagemSelecionada = null;
  }

  ngAfterViewInit(): void {
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
}
