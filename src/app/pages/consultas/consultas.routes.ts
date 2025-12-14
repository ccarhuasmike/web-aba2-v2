import { Routes } from '@angular/router';
import { AutorizacionesComponent } from './autorizaciones/autorizaciones.component';
import { ROLES } from '@/layout/Utils/constants/aba.constants';
import { SolicitudesAhorrosohComponent } from './solicitudes-ahorrosoh/solicitudes-ahorrosoh.component';
import { TokenizacionComponent } from './tokenizacion/tokenizacion.component';
import { TransaccionesObservadasComponent } from './transacciones-observadas/transacciones-observadas.component';
export default [

    {
        path: 'autorizaciones',
        // canActivate: [RoleGuard],
        data: { roles: [ROLES.RECLAMOS, ROLES.ATENCION_CLIENTE_N4, ROLES.ATENCION_CLIENTE_N2, ROLES.ATENCION_CLIENTE_N3, ROLES.ATENCION_CLIENTE_N1, ROLES.ADMINISTRADOR, ROLES.OPERACION_PASIVA, ROLES.OPERACION_CONTABLE, ROLES.FRAUDE, ROLES.PLAFT, ROLES.ATENCION_CLIENTE, ROLES.ATENCION_CLIENTE_TD, ROLES.CONSULTA] },
        component: AutorizacionesComponent
    }
    ,
    {
        path: 'solicitudes-ahorros-oh',
        //canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMINISTRADOR, ROLES.VENTAS, ROLES.JEFE_VENTAS] },
        component: SolicitudesAhorrosohComponent
    },
       {
        path: 'tokenizacion',
        //canActivate: [RoleGuard],
        data: { roles: [ROLES.RECLAMOS,ROLES.ADMINISTRADOR, ROLES.OPERACION_CONTABLE, ROLES.FRAUDE] },
        component: TokenizacionComponent
    },
    {
        path: 'transacciones-observadas',
        //canActivate: [RoleGuard],
        data: { roles: [ROLES.RECLAMOS,ROLES.ATENCION_CLIENTE_N4,ROLES.ATENCION_CLIENTE_N3,ROLES.ADMINISTRADOR, ROLES.OPERACION_PASIVA, ROLES.PLAFT, ROLES.ATENCION_CLIENTE_TD, ROLES.CONSULTA] },
        component: TransaccionesObservadasComponent
    }

    // { path: 'parametro/debito', data: { breadcrumb: 'Button' }, component: ParametroDebitoComponent },
    // { path: 'parametro/tipo-cambio', data: { breadcrumb: 'Button' }, component: ParametroTipoCambioComponent },
    // { path: 'banco', data: { breadcrumb: 'Button' }, component: BancoComponent },
    // { path: 'feriado', data: { breadcrumb: 'Button' }, component: FeriadoComponent },
    // { path: 'proveedor', data: { breadcrumb: 'Button' }, component: ProveedorComponent },
    // { path: 'cambiomoneda', data: { breadcrumb: 'Button' }, component: CambioMonedaComponent }, 
] as Routes;