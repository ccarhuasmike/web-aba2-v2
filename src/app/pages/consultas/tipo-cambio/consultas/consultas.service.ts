import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ConsultasService {

    APICamMon = environment.APICamMon;

    constructor(private http: HttpClient) { }

    getConsultas(
        fechaConsultaDesde: any,
        fechaConsultaHasta: any,
        idConsultaPartner: any,
        nroCambioMonedaOperacion: any,
        tipoDocumento: any,
        numDocumento: any
    ) {
        const params = new HttpParams()
            .set('fechaConsultaDesde', fechaConsultaDesde)
            .set('fechaConsultaHasta', fechaConsultaHasta)
            .set('idConsultaPartner', idConsultaPartner)
            .set('nroCambioMonedaOperacion', nroCambioMonedaOperacion)
            .set('tipoDoc', tipoDocumento)
            .set('numDoc', numDocumento);

        return this.http.get(`${this.APICamMon}/v1/reportes/consultas-cambio-moneda`, { params: params });
    }
}