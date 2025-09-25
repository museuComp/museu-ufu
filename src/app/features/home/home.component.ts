import { Component, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Interface para garantir a consistência e tipagem dos dados de cada slide.
interface Slide {
	img: string;
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
	slides: Slide[] = [
		{
			img: '',
			alt: 'Computadores e consoles de videogame antigos em uma mesa',
			title: 'A Geração dos 8-bits',
			subtitle: 'Reviva a era que popularizou os computadores pessoais e os jogos.'
		},
		{
			img: '',
			alt: 'Pilha de disquetes coloridos',
			title: 'A Evolução do Armazenamento',
			subtitle: 'Dos cartões perfurados aos disquetes e à nuvem: uma viagem pela memória digital.'
		},
		{
			img: '',
			alt: 'Mãos de uma pessoa a programar num portátil com o ecrã escuro',
			title: 'Pioneiros da Programação',
			subtitle: 'Conheça as linguagens e os programadores que construíram o futuro.'
		},
		{
			img: '',
			alt: 'Um portátil moderno aberto sobre uma mesa de madeira',
			title: 'O Futuro é Agora',
			subtitle: 'Explore as tecnologias atuais que foram sonhos no passado.'
		}
	];

	currentIndex = signal(0);
	private intervalId?: number;

	ngOnInit() {
		this.startAutoPlay();
	}

	ngOnDestroy() {
		this.stopAutoPlay();
	}

	startAutoPlay(): void {
		// Muda de slide a cada 5 segundos
		this.intervalId = window.setInterval(() => {
			this.nextSlide();
		}, 5000);
	}

	stopAutoPlay(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

	nextSlide(): void {
		this.currentIndex.update(current => (current + 1) % this.slides.length);
	}

	prevSlide(): void {
		this.currentIndex.update(current => (current - 1 + this.slides.length) % this.slides.length);
	}

	goToSlide(index: number): void {
		this.currentIndex.set(index);
	}
}