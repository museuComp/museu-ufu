import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
	let spectator: Spectator<FooterComponent>;
	const createComponent = createComponentFactory({
		component: FooterComponent,
		shallow: true,
	});

	beforeEach(() => {
		spectator = createComponent();
	});

	it('should create the component', () => {
		expect(spectator.component).toBeTruthy();
	});

	it('should display the correct license text', () => {
		const licenseText = spectator.query('.info .text-down-01');
		expect(licenseText).toHaveText('©2023 - 2024 | Todos os direitos reservados | Universidade Federal de Uberlândia');
	});

	it('should have social network links', () => {
		const socialLinks = spectator.queryAll('.social-network .br-button');
		expect(socialLinks.length).toBe(4);
	});

	
});
