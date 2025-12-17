import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root'
})
export class TransaccionesService {

    APICamMon = environment.APICamMon;

    constructor(private readonly http: HttpClient) { }

    getReporteTransacciones(paramsFiltro: ReporteTransaccionesParams
    ) {
        const params = new HttpParams()
            .set('fechaEjecucionDesde', paramsFiltro.fechaEjecucionDesde)
            .set('fechaEjecucionHasta', paramsFiltro.fechaEjecucionHasta)
            .set('cuentaDestino', paramsFiltro.cuentaDestino)
            .set('cuentaOrigen', paramsFiltro.cuentaOrigen)
            .set('idOperacionPartner', paramsFiltro.idOperacionPartner)
            .set('nroCambioMonedaOperacion', paramsFiltro.nroCambioMonedaOperacion)
            .set('tipoOperacionOh', paramsFiltro.tipoOperacionOh)
            .set('tipoDoc', paramsFiltro.tipoDoc)
            .set('numDoc', paramsFiltro.numDoc)
            .set('idCambioMonedaEstado', paramsFiltro.idCambioMonedaEstado);

        return this.http.get(`${this.APICamMon}/v1/reportes/transacciones-cambio-moneda`, { params: params });
    }

    getReporteLogTransacciones(
        nroCambioMonedaOperacion: any
    ) {
        const params = new HttpParams()
            .set('nroCambioMonedaOperacion', nroCambioMonedaOperacion)

        return this.http.get(`${this.APICamMon}/v1/reportes/cambio-moneda-log/nro-operacion`, { params: params });
    }

    postRegularizarTransaccion(data: any) {
        return this.http.post(`${this.APICamMon}/v1/reportes/transacciones-regularizar`, data);
    }
}export interface ReporteTransaccionesParams {
  fechaEjecucionDesde?: any;
  fechaEjecucionHasta?: any;
  cuentaDestino?: any;
  cuentaOrigen?: any;
  idOperacionPartner?: any;
  nroCambioMonedaOperacion?: any;
  tipoOperacionOh?: any;
  tipoDoc?: any;
  numDoc?: any;
  idCambioMonedaEstado?: any;
}