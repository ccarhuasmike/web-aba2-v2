import { Routes } from '@angular/router';
import { AutorizacionesComponent } from './autorizaciones/autorizaciones.component';
import { ROLES } from '@/layout/Utils/constants/aba.constants';
import { SolicitudesAhorrosohComponent } from './solicitudes-ahorrosoh/solicitudes-ahorrosoh.component';
import { TokenizacionComponent } from './tokenizacion/tokenizacion.component';
import { TransaccionesObservadasComponent } from './transacciones-observadas/transacciones-observadas.component';
import { ConsultasComponent } from './tipo-cambio/consultas/consultas.component';
import { LiquidacionesComponent } from './tipo-cambio/liquidaciones/liquidaciones.component';
import { LogTransaccionesComponent } from './tipo-cambio/log-transacciones/log-transaccoiones.component';
import { OpeCampaniasComponent } from './tipo-cambio/ope-campanias/ope-campanias.component';
import { PreLiquidacionComponent } from './tipo-cambio/pre-liquidacion/pre-liquidacion.component';
import { TransaccionesComponent } from './tipo-cambio/transacciones/transacciones.component';
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

    ,
    {
        path: 'tipo-cambio/transacciones',
        //canActivate: [RoleGuard],
        data: { roles: [ROLES.RECLAMOS,ROLES.ADMINISTRADOR, ROLES.OPERACION_PASIVA, ROLES.TESORERIA, ROLES.PLAFT] },
        component: TransaccionesComponent
    },
    {
        path: 'tipo-cambio/log-transacciones',
        //canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMINISTRADOR, ROLES.OPERACION_PASIVA] },
        component: LogTransaccionesComponent
    },
    {
        path: 'tipo-cambio/pre-liquidacion',
        //canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMINISTRADOR, ROLES.OPERACION_PASIVA] },
        component: PreLiquidacionComponent
    },
    {
        path: 'tipo-cambio/consultas',
        //canActivate: [RoleGuard],
        data: { roles: [ROLES.RECLAMOS,ROLES.ADMINISTRADOR, ROLES.OPERACION_PASIVA] },
        component: ConsultasComponent
    },
    {
        path: 'tipo-cambio/liquidaciones',
        //canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMINISTRADOR, ROLES.OPERACION_PASIVA] },
        component: LiquidacionesComponent
    },
    {
        path: 'tipo-cambio/ope-campanias',
        //canActivate: [RoleGuard],
        data: { roles: [ROLES.ADMINISTRADOR, ROLES.OPERACION_PASIVA] },
        component: OpeCampaniasComponent
    },
] as Routes;