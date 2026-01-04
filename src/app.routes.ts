import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { LoginComponent } from '@/pages/auth/login/login.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'cuenta', loadChildren: () => import('./app/pages/cuentas/cuentas.routes') },
            { path: 'consultas', loadChildren: () => import('./app/pages/consultas/consultas.routes') },            
            { path: 'ajuste-masivo', loadChildren: () => import('./app/pages/ajustes-masivos/ajustes-masivos.routes') }, 
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'mantenimiento', loadChildren: () => import('./app/pages/mantenimiento/mantenimiento.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'login', component: LoginComponent },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
