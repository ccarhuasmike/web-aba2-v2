import { Routes } from '@angular/router';
import { ParametroDebitoComponent } from './parametro/parametro-debito/parametro-debito.component';
import { ParametroTipoCambioComponent } from './parametro/parametro-tipo-cambio/parametro-tipo-cambio.component';
import { BancoComponent } from './banco/banco.component';
import { FeriadoComponent } from './feriado/feriado.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { CambioMonedaComponent } from './cambiomoneda/cambiomoneda.component';

export default [
    { path: 'parametro/debito', data: { breadcrumb: 'Button' }, component: ParametroDebitoComponent },
    { path: 'parametro/tipo-cambio', data: { breadcrumb: 'Button' }, component: ParametroTipoCambioComponent },
    { path: 'banco', data: { breadcrumb: 'Button' }, component: BancoComponent },
    { path: 'feriado', data: { breadcrumb: 'Button' }, component: FeriadoComponent },
    { path: 'proveedor', data: { breadcrumb: 'Button' }, component: ProveedorComponent },
    { path: 'cambiomoneda', data: { breadcrumb: 'Button' }, component: CambioMonedaComponent }, 
] as Routes;
