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

  itensMuseu = [
    {
      titulo: 'Gravador Panasonic',
      descricao: 'Gravador de voz portátil a minicassete, equipamento clássico usado para entrevistas e anotações de áudio antes dos gravadores digitais.',
      imagem: 'public/itens/gravador_thumb.jpg'
    },
    {
      titulo: 'Máquina de escrever',
      descricao: 'Máquina de escrever, o equipamento mecânico padrão para a produção de documentos de texto antes da popularização dos computadores.',
      imagem: 'public/itens/maquina_escrever_thumb.jpg'
    },
    {
      titulo: 'Caixa de disquetes',
      descricao: 'Disquetes flexíveis de 5,25 polegadas, uma das mídias físicas mais populares para armazenamento e transferência de dados nos primórdios da computação pessoal.',
      imagem: 'public/itens/caixa_disquetes_thumb.jpg'
    },
    {
      titulo: 'Periféricos antigos',
      descricao: 'Conjunto de caixas de som e periféricos, componentes essenciais de multimídia e conectividade dos antigos computadores de mesa.',
      imagem: 'public/itens/perifericos_antigos_thumb.jpg'
    },
    {
      titulo: 'Calculadora Facit',
      descricao: 'Calculadora mecânica histórica, utilizada em escritórios para realizar operações matemáticas antes da invenção das calculadoras eletrônicas.',
      imagem: 'public/itens/calculadora_antiga_thumb.jpg'
    },
    {
      titulo: 'Impressora HP',
      descricao: 'Modelo antigo de impressora a laser, equipamento que revolucionou a velocidade e a qualidade da impressão de documentos em escritórios.',
      imagem: 'public/itens/modelo_antigo_impressora_thumb.jpg'
    },
    {
      titulo: 'Ossos de Napier',
      descricao: 'Instrumento histórico conhecido como "Ossos de Napier", criado no século XVII e considerado um dos primeiros dispositivos manuais para facilitar cálculos matemáticos.',
      imagem: 'public/itens/ossos_de_naipier_thumb.jpg'
    },
    {
      titulo: 'Placa de vídeo',
      descricao: 'Placa de vídeo de gerações passadas, componente de hardware responsável por processar gráficos e jogos nos computadores.',
      imagem: 'public/itens/placa_video_thumb.jpg'
    },
    {
      titulo: 'DVD Player portátil',
      descricao: 'Reprodutor portátil de DVDs, um dispositivo clássico de entretenimento de vídeo pessoal antes do surgimento dos tablets e do streaming.',
      imagem: 'public/itens/video_player_thumb.jpg'
    },
    {
      titulo: 'Equipamento de Rede IBM',
      descricao: 'Dispositivo clássico de infraestrutura utilizado para conectar redes de computadores nas empresas.',
      imagem: 'public/itens/equipamento_rede_thumb.jpg'
    },
    {
      titulo: 'Módulos de Comunicação',
      descricao: 'Componentes essenciais que formavam a base da comunicação de dados em redes corporativas antigas.',
      imagem: 'public/itens/modulos_rede_thumb.jpg'
    },
    {
      titulo: 'Discos Rígidos Antigos',
      descricao: 'Peças fundamentais para o armazenamento de dados locais nas gerações passadas de computadores.',
      imagem: 'public/itens/colecao_HD_thumb.jpg'
    },
    {
      titulo: 'Console PS One',
      descricao: 'Videogame histórico que popularizou os jogos em mídia de CD e marcou o entretenimento digital.',
      imagem: 'public/itens/ps1_thumb.jpg'
    },
    {
      titulo: 'Interior de PC Clássico',
      descricao: 'Visão interna de um computador de mesa antigo, evidenciando o padrão de hardware de gerações passadas.',
      imagem: 'public/itens/sistema_antigo_thumb.jpg'
    },
    {
      titulo: 'Console Supergame CCE',
      descricao: 'Sistema de videogame retrô que levou os primeiros jogos de cartucho para muitas casas no Brasil.',
      imagem: 'public/itens/supergame_thumb.jpg'
    },
    {
      titulo: 'Teclado Clássico IBM',
      descricao: 'Periférico robusto e tradicional que marcou a digitação nos antigos computadores de mesa.',
      imagem: 'public/itens/teclado_ibm_thumb.jpg'
    },
    {
      titulo: 'Video Computer System',
      descricao: 'Console histórico que representa o início da popularização e a era de ouro dos videogames caseiros.',
      imagem: 'public/itens/video_computer_system_thumb.jpg'
    },
    {
      titulo: 'Câmera e Webcam Clássicas',
      descricao: 'Primeiros dispositivos utilizados para captura de imagem e comunicação visual nos primórdios da internet.',
      imagem: 'public/itens/web_cam_thumb.jpg'
    },
    {
      titulo: 'Gabinete de PC Clássico',
      descricao: 'Estrutura de cor bege tradicional que abrigava os componentes de hardware dos computadores de mesa em décadas passadas.',
      imagem: 'public/itens/gabinete_antigo2_thumb.jpg'
    },
    {
      titulo: 'Módulos de Rede e Conectividade',
      descricao: 'Dispositivos de comutação e transmissão essenciais para estabelecer a comunicação nas primeiras infraestruturas de rede corporativa.',
      imagem: 'public/itens/modulos_rede_conectividade_thumb.jpg'
    },
    {
      titulo: 'Retroprojetor',
      descricao: 'Equipamento óptico clássico amplamente utilizado em salas de aula e apresentações para projetar transparências antes da era digital.',
      imagem: 'public/itens/retroprojetor_thumb.jpg'
    },
    {
      titulo: 'Painel de Switches e Hubs',
      descricao: 'Conjunto de equipamentos de distribuição de rede responsáveis por interligar múltiplos computadores nos antigos ambientes de trabalho.',
      imagem: 'public/itens/switches_hubs_thumb.jpg'
    },
    {
      titulo: 'Coleção de Celulares Clássicos',
      descricao: 'Acervo de aparelhos que ilustra as fases iniciais e a evolução do design na história da comunicação móvel.',
      imagem: 'public/itens/colecao_celulares_thumb.jpg'
    },
    {
      titulo: 'Coleção de Embalagens de iPad',
      descricao: 'Caixas das primeiras gerações do tablet da Apple, dispositivo que ajudou a definir o mercado moderno de computação móvel.',
      imagem: 'public/itens/colecao_ipad_thumb.jpg'
    },
    {
      titulo: 'Servidor Torre IBM',
      descricao: 'Robusto computador corporativo utilizado para o processamento intenso e o armazenamento centralizado de dados em empresas.',
      imagem: 'public/itens/servidor_torre_ibm_thumb.jpg'
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