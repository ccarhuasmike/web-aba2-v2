import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OpeCampaniasService {

    APICamMon = environment.APICamMon;

    constructor(private readonly http: HttpClient) { }

    getCampanias() {
        return this.http.get(`${this.APICamMon}/v1/cambio/moneda/campana/con-estado`);
    }

    getResumenCambioMonedaOperacionCampana(
        fechaInicio: any,
        fechaFin: any,
        idCambioMonedaCampana: any
    ) {
        const params = new HttpParams()
            .set('fechaInicio', fechaInicio)
            .set('fechaFin', fechaFin)
            .set('idCambioMonedaCampana', idCambioMonedaCampana);

        return this.http.get(`${this.APICamMon}/v1/cambio/moneda/campana/operacion/res/buscar`, { params: params });
    }

    getDetalleCambioMonedaOperacionCampana(idCambioMonedaCamOpeRes: any) {
        return this.http.get(`${this.APICamMon}/v1/cambio/moneda/campana/operacion/det/id-cambio-moneda-ope-res/${idCambioMonedaCamOpeRes}`);
    }
}