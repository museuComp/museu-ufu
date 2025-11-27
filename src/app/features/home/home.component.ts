import { Component, signal, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChildren, QueryList, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

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
	imports: [CommonModule],
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit, OnDestroy {
	// Dados dos slides com imagens mais temáticas e de alta qualidade.
	@ViewChildren('videoPlayer') videoPlayers!: QueryList<ElementRef<HTMLVideoElement>>;
	slides: Slide[] = [
		{
			type: 'image',
			src: 'public/carrossel/Workshop.png',
			alt: 'Pilha de disquetes coloridos',
			title: 'Nosso Workshop',
			subtitle: 'Venha participar no de uma esperiência inesquecível.'
		},
		{
			type: 'video',
			src: 'public/carrossel/carrossel_teste.mp4',
			alt: '',
			title: 'A História da Computação',
			subtitle: 'Saiba como tudo começou e evoluiu ao longo dos anos.'
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

	currentIndex = signal(0);
	isPaused = signal(false);
	private intervalId?: number;

	constructor() {
		effect(() => {
			const idx = this.currentIndex();
			const isPaused = this.isPaused(); // Rastreia o estado de pausa

			if (this.videoPlayers) {
				this.videoPlayers.forEach(playerRef => {
					const videoElement = playerRef.nativeElement;
					const slideIndex = parseInt(videoElement.getAttribute('data-index') || '-1', 10);

					if (slideIndex === idx) {
						// Se for o slide atual, a reprodução depende do estado de pausa
						if (isPaused) {
							videoElement.pause();
						} else {
							videoElement.play().catch(err => {
								console.warn("A reprodução automática do vídeo foi bloqueada.", err);
							});
						}
					} else {
						// Outros slides de vídeo devem estar sempre pausados
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
