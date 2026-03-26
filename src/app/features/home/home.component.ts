import { Component, signal, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ViewChildren, QueryList, ElementRef, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

declare var pannellum: any;

// Interface para garantir a consistência e tipagem dos dados de cada slide.
interface Slide {
	type: 'image' | 'video';
	src: string;
	alt: string;
	title: string;
	subtitle: string;
}

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule, NgOptimizedImage], // Adicionado NgOptimizedImage
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChildren('videoPlayer') videoPlayers!: QueryList<ElementRef<HTMLVideoElement>>;
	
  slides: Slide[] = [
		{
			type: 'image',
			src: 'public/carrossel/insta.png',
			alt: 'Instagram do Museu da Computação',
			title: 'Instagram do Museu da Computação',
			subtitle: 'Veja as novidades, eventos e curiosidades do museu em nosso Instagram!'
		},
		{
			type: 'image',
			src: 'public/carrossel/cartao_perfurado.jpg',
			alt: 'Cartão perfurado antigo usado em computadores',
			title: 'Cartão Perfurado',
			subtitle: 'Como se programava os primeiros computadores?'
		},
		{
			type: 'image',
			src: 'public/carrossel/JogoSonic.jpg',
			alt: 'Capa do jogo do Sonic para Super Nintendo',
			title: 'Jogo do Sonic do Super Nintendo',
			subtitle: 'Relembre os clássicos dos videogames!'
		}
	];

  // 3 Itens aleatórios/interessantes do acervo para a Home
  itensDestaque = [
    {
      titulo: 'Console PS One',
      descricao: 'Videogame histórico que popularizou os jogos em mídia de CD e marcou o entretenimento digital.',
      imagemThumb: 'public/itens/ps1_thumb.jpg'
    },
    {
      titulo: 'Calculadora Facit',
      descricao: 'Calculadora mecânica utilizada em escritórios para realizar operações matemáticas antes da invenção das calculadoras eletrônicas.',
      imagemThumb: 'public/itens/calculadora_antiga_thumb.jpg'
    },
    {
      titulo: 'Ossos de Napier',
      descricao: 'Instrumento histórico criado no século XVII e considerado um dos primeiros dispositivos manuais para facilitar cálculos.',
      imagemThumb: 'public/itens/ossos_de_naipier_thumb.jpg'
    }
  ];

  	
  	bannerDestaque = {
    src: 'public/banner/banner-principal.png', // Coloque o caminho correto da imagem do seu banner aqui
    alt: 'Apoie o Museu Virtual da FACOM',
    
  	};

	currentIndex = signal(0);
	isPaused = signal(false);
	private intervalId?: number;

	constructor() {
		effect(() => {
			const idx = this.currentIndex();
			const isPaused = this.isPaused();

			if (this.videoPlayers) {
				this.videoPlayers.forEach(playerRef => {
					const videoElement = playerRef.nativeElement;
					const slideIndex = parseInt(videoElement.getAttribute('data-index') || '-1', 10);

					if (slideIndex === idx) {
						if (isPaused) {
							videoElement.pause();
						} else {
							videoElement.play().catch(err => {
								console.warn("A reprodução automática do vídeo foi bloqueada.", err);
							});
						}
					} else {
						videoElement.pause();
						videoElement.currentTime = 0;
					}
				});
			}
		});
	}

	ngOnInit() {
		this.startAutoPlay();
	}

  ngAfterViewInit(): void {
    // Inicializa o 360 na home page. ID 'panorama-home' para não dar conflito.
    if (typeof pannellum !== 'undefined') {
      pannellum.viewer('panorama-home', {
        type: 'equirectangular',
        panorama: 'public/visita-virtual/sala360.jpg',
        autoLoad: true, // Mudado para TRUE: carrega a imagem automaticamente sem o botão
        showZoomCtrl: true,
        compass: false,
        pitch: 0,
        yaw: 0,
        hfov: 110
      });
    }
  }

	ngOnDestroy() {
		this.stopAutoPlay();
	}

	startAutoPlay(): void {
		this.stopAutoPlay();
		if (this.isPaused()) return;

		this.intervalId = window.setInterval(() => {
			this.currentIndex.update(current => (current + 1) % this.slides.length);
		}, 8000);
	}

	stopAutoPlay(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

	togglePause(): void {
		this.isPaused.update(paused => !paused);
		if (this.isPaused()) {
			this.stopAutoPlay();
		} else {
			this.startAutoPlay();
		}
	}

	nextSlide(): void {
		this.stopAutoPlay();
		this.currentIndex.update(current => (current + 1) % this.slides.length);
		this.startAutoPlay();
	}

	prevSlide(): void {
		this.stopAutoPlay();
		this.currentIndex.update(current => (current - 1 + this.slides.length) % this.slides.length);
		this.startAutoPlay();
	}

	goToSlide(index: number): void {
		this.stopAutoPlay();
		this.currentIndex.set(index);
		this.startAutoPlay();
	}
}