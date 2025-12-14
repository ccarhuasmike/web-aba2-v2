import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class PreLiquidacionService {

    APICamMon = environment.APICamMon;

    constructor(private http: HttpClient) { }

    getResumenLiquidacion(
        idPartner: any
    ) {
        const params = new HttpParams()
            .set('idPartner', idPartner);

        return this.http.get(`${this.APICamMon}/v1/reportes/resumen-pre-liquidacion`, { params: params });
    }

    getDetalleLiquidacion(
        idPreLiquidacion: any
    ) {
        const params = new HttpParams()
            .set('idPreLiquidacion', idPreLiquidacion);

        return this.http.get(`${this.APICamMon}/v1/reportes/detalle-pre-liquidacion`, { params: params });
    }
}