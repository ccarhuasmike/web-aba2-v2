import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
environment
@Injectable({
    providedIn: 'root'
})
export class LogTransaccionesService {

    APICamMon = environment.APICamMon;

    constructor(private http: HttpClient) { }

    getCambioMonedaLog(
        fechaConfirmacionDesde: any,
        fechaConfirmacionHasta: any,
        nroCambioMonedaOperacion: any,
        tipoDoc: any,
        numDoc: any
    ) {
        const params = new HttpParams()
            .set('fechaConfirmacionDesde', fechaConfirmacionDesde)
            .set('fechaConfirmacionHasta', fechaConfirmacionHasta)
            .set('nroCambioMonedaOperacion', nroCambioMonedaOperacion)
            .set('tipoDoc', tipoDoc)
            .set('numDoc', numDoc);

        return this.http.get(`${this.APICamMon}/v1/reportes/cambio-moneda-log`, { params: params });
    }
}