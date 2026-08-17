import { IMenu } from '../types/menu.type';
import { Role } from '@app/features/login/models/credentials.model';

export const LIST_MENU_STUDENT: IMenu[] = [
	{
		label: 'breadcrumb.home',
		url: 'home',
		icon: 'fas fa-home',
	},
	{
		label: 'breadcrumb.news',
		url: 'news',
		icon: 'fas fa-newspaper',
	},
	{
		label: 'breadcrumb.tour',
		url: 'tour',
		icon: 'fas fa-street-view'
	},
	{
		label: 'breadcrumb.norms',
		url: 'norms',
		icon: 'fas fa-gavel'
	},
	{
		label: 'breadcrumb.games',
		url: 'games',
		icon: 'fas fa-gamepad'
	},
	{
		label: 'breadcrumb.magazine',
		url: 'magazine',
		icon: 'fas fa-file-text'
	},
	{
		label: 'breadcrumb.videos',
		url: 'videos',
		icon: 'fas fa-video'
	},
	{
		label: 'breadcrumb.donations',
		url: 'donations',
		icon: 'fas fa-usd'
	},
	{
		label: 'breadcrumb.collection',
		url: 'https://tainacan.facom.ufu.br',
		icon: 'fas fa-university ',
		external: true,
	},
	{
		label: 'breadcrumb.about',
		url: 'about',
		icon: 'fas fa-info-circle'
	},
];

export const LIST_MENU_PUBLIC: IMenu[] = [
	{
		label: 'breadcrumb.home',
		url: 'home',
		icon: 'fas fa-home',
	},
	{
		label: 'breadcrumb.news',
		url: 'news',
		icon: 'fas fa-newspaper',
	},
	{
		label: 'breadcrumb.tour',
		url: 'tour',
		icon: 'fas fa-street-view'
	},
	{
		label: 'breadcrumb.norms',
		url: 'norms',
		icon: 'fas fa-gavel'
	},
	{
		label: 'breadcrumb.games.title',
		url: 'games',
		icon: 'fas fa-gamepad'
	},
	{
		label: 'breadcrumb.magazine',
		url: 'magazine',
		icon: 'fas fa-file-text'
	},
	{
		label: 'breadcrumb.videos',
		url: 'videos',
		icon: 'fas fa-video'
	},
	{
		label: 'breadcrumb.donations',
		url: 'donations',
		icon: 'fas fa-usd'
	},
	{
		label: 'breadcrumb.collection',
		url: 'https://tainacan.facom.ufu.br',
		icon: 'fas fa-university ',
		external: true,
	},
	{
		label: 'breadcrumb.about',
		url: 'about',
		icon: 'fas fa-info-circle'
	},
];

export const LIST_MENU_BY_ROLE = new Map<Role, IMenu[]>([
	[Role.STUDENT, LIST_MENU_STUDENT],
	[Role.PUBLIC, LIST_MENU_PUBLIC],
]);

