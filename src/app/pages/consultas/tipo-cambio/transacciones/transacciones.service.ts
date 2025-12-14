import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root'
})
export class TransaccionesService {

    APICamMon = environment.APICamMon;

    constructor(private http: HttpClient) { }

    getReporteTransacciones(
        fechaEjecucionDesde: any,
        fechaEjecucionHasta: any,
        cuentaDestino: any,
        cuentaOrigen: any,
        idOperacionPartner: any,
        nroCambioMonedaOperacion: any,
        tipoOperacionOh: any,
        tipoDoc: any,
        numDoc: any,
        idCambioMonedaEstado: any
    ) {
        const params = new HttpParams()
            .set('fechaEjecucionDesde', fechaEjecucionDesde)
            .set('fechaEjecucionHasta', fechaEjecucionHasta)
            .set('cuentaDestino', cuentaDestino)
            .set('cuentaOrigen', cuentaOrigen)
            .set('idOperacionPartner', idOperacionPartner)
            .set('nroCambioMonedaOperacion', nroCambioMonedaOperacion)
            .set('tipoOperacionOh', tipoOperacionOh)
            .set('tipoDoc', tipoDoc)
            .set('numDoc', numDoc)
            .set('idCambioMonedaEstado', idCambioMonedaEstado);

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
}