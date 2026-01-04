
import { Routes } from '@angular/router';
import { ROLES } from "@/layout/Utils/constants/aba.constants";
import { EjecucionBloqueosComponent } from './bloqueo/ejecucion-bloqueos/ejecucion-bloqueos.component';
import { HistorialBloqueosComponent } from './bloqueo/historial-bloqueos/historial-bloqueos.component';
import { EjecucionSolicitudesComponent } from './solicitudes-ahorrosoh/ejecucion-solicitudes/ejecucion-solicitudes.component';
import { HistorialSolicitudesComponent } from './solicitudes-ahorrosoh/historial-solicitudes/historial-solicitudes.component';
export default [
    { path: 'ejecucion-bloqueos', data: { breadcrumb: 'Button', roles: [ROLES.ADMINISTRADOR, ROLES.FRAUDE] }, component: EjecucionBloqueosComponent },
    { path: 'historial-bloqueos', data: { breadcrumb: 'Button' ,roles: [ROLES.ADMINISTRADOR, ROLES.FRAUDE] }, component: HistorialBloqueosComponent },
    { path: 'ejecucion-solicitudesoh', data: { breadcrumb: 'Button',roles: [ROLES.ADMINISTRADOR, ROLES.VENTAS, ROLES.JEFE_VENTAS]  }, component: EjecucionSolicitudesComponent },
    { path: 'historial-solicitudesoh', data: { breadcrumb: 'Button',roles: [ROLES.ADMINISTRADOR, ROLES.VENTAS, ROLES.JEFE_VENTAS]  }, component: HistorialSolicitudesComponent }
] as Routes;