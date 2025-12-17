import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        providePrimeNG({
            translation: {
                startsWith: 'Empieza con',
                contains: 'Contiene',
                notContains: 'No contiene',
                endsWith: 'Termina con',
                equals: 'Igual',
                notEquals: 'No igual',
                noFilter: 'Sin filtro',
                lt: 'Menor que',
                lte: 'Menor o igual que',
                gt: 'Mayor que',
                gte: 'Mayor o igual que',
                dateIs: 'La fecha es',
                dateIsNot: 'La fecha no es',
                dateBefore: 'Antes de',
                dateAfter: 'Después de',
                clear: 'Limpiar',
                apply: 'Aplicar',
                matchAll: 'Coincidir todo',
                matchAny: 'Coincidir cualquiera',
                addRule: 'Agregar regla',
                removeRule: 'Eliminar regla',
                accept: 'Aceptar',
                reject: 'Cancelar',
                choose: 'Elegir',
                upload: 'Subir',
                cancel: 'Cancelar',

                // 📅 DatePicker
                dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
                dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
                dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
                monthNames: [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ],
                monthNamesShort: [
                    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
                    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
                ],
                today: 'Hoy',
                weekHeader: 'Sem'
            },
            theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } }
        })
    ]
};
