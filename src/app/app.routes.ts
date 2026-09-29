import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'users/add',
		loadComponent: () =>
			import('./users/user-create/user-create.component').then((module) => module.UserCreateComponent),
	},
	{
		path: 'users',
		loadComponent: () =>
			import('./users/user-list/user-list.component').then((module) => module.UserListComponent),
	},
	{
		path: 'users/edit/:id',
		loadComponent: () =>
			import('./users/user-edit/user-edit.component').then((module) => module.UserEditComponent),
	},
	{ path: '', pathMatch: 'full', redirectTo: 'users' },
	{ path: '**', redirectTo: 'users' },
];
