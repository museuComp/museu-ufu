import { Component, signal, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, effect, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { provideTranslocoScope, TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { NavigationService } from '@app/services/navigation.service';
import { AboutRoutingModule } from "@app/pages/about/about-routing.module";

declare var pannellum: any;

interface SlideMedia {
	type: 'image' | 'video';
	src: string;
}
interface SlideText {
	alt: string;
	title: string;
	subtitle: string;
}
interface Slide extends SlideMedia,SlideText {}

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule, NgOptimizedImage, TranslocoDirective, AboutRoutingModule], // Adicionado NgOptimizedImage
	providers: [provideTranslocoScope('home')],
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChildren('videoPlayer') videoPlayers!: QueryList<ElementRef<HTMLVideoElement>>;

	private readonly transloco = inject(TranslocoService);
	readonly nav = inject(NavigationService);
	
  	readonly slidesThumb: SlideMedia[] = [
		{type: 'image', src: 'public/carrossel/insta.png'},
		{type: 'image', src: 'public/carrossel/cartao_perfurado.jpg'},
		{type: 'image', src: 'public/carrossel/JogoSonic.jpg'}
	];
	slides: Slide[] = [];

	readonly itemsThumb = [
		'public/itens/ps1_thumb.jpg',
		'public/itens/calculadora_antiga_thumb.jpg',
		'public/itens/ossos_de_naipier_thumb.jpg'
	];
	itensDestaque = [];

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
		this.translateData();
		this.startAutoPlay();
	}

	translateData(): void {
		this.transloco.selectTranslation('home').subscribe(() => {
			const s = this.transloco.translateObject<SlideText[]>('home.slides');
			this.slides = s.map((slide, i) => {
				return {
					...slide,
					src: this.slidesThumb[i].src,
					type: this.slidesThumb[i].type
				}
			});

			const items = this.transloco.translateObject('home.items');
			this.itensDestaque = items.map((item, i) => {
				return {
					...item,
					imageThumb: this.itemsThumb[i]
				}
			});

			setTimeout(() => this.initPannellum(), 0);
		});
	}

	initPannellum(): void {
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