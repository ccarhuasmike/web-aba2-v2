import { Routes } from '@angular/router';
import { CuentasComponent } from './cuentas.component';
import { CuentasDetailsComponent } from './cuentas-details/cuentas-details.component';
export default [
    { path: '', data: { breadcrumb: 'Table' }, component: CuentasComponent },
    { path: 'detalle', data: { breadcrumb: 'Table' }, component: CuentasDetailsComponent },    
] as Routes;
