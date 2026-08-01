import { IMenu } from '../types/menu.type';
import { Role } from '@app/features/login/models/credentials.model';

export const LIST_MENU_STUDENT: IMenu[] = [
	{
		label: 'Página inicial',
		icon: 'fa-home',
		url: '/home',
	},
	{
		label: 'Jogos',
		icon: 'fa-user',
		url: '/games',
	},
];

export const LIST_MENU_PUBLIC: IMenu[] = [
	{
		label: 'Página inicial',
		icon: 'fa-home',
		url: '/home',
	},
	{
		label: 'Jogos',
		icon: 'fa-chart-bar',
		url: '/games',
	},
];

export const LIST_MENU_BY_ROLE = new Map<Role, IMenu[]>([
	[Role.STUDENT, LIST_MENU_STUDENT],
	[Role.PUBLIC, LIST_MENU_PUBLIC],
]);
