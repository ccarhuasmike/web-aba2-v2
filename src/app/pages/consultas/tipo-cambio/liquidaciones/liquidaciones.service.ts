import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class LiquidacionesService {

    APICamMon = environment.APICamMon;

    constructor(private http: HttpClient) { }

    getResumenLiquidacion(
        fechaLiquidacionDesde: any,
        fechaLiquidacionHasta: any,
        nroLote: any
    ) {
        const params = new HttpParams()
            .set('fechaLiquidacionDesde', fechaLiquidacionDesde)
            .set('fechaLiquidacionHasta', fechaLiquidacionHasta)
            .set('nroLote', nroLote);

        return this.http.get(`${this.APICamMon}/v1/reportes/resumen-liquidacion`, { params: params });
    }

    getDetalleLiquidacion(
        fechaLiquidacionDesde: any,
        fechaLiquidacionHasta: any,
        nroLote: any
    ) {
        const params = new HttpParams()
            .set('fechaLiquidacionDesde', fechaLiquidacionDesde)
            .set('fechaLiquidacionHasta', fechaLiquidacionHasta)
            .set('nroLote', nroLote);

        return this.http.get(`${this.APICamMon}/v1/reportes/detalle-liquidacion`, { params: params });
    }

    postRegularizarLiquidacion(data: any) {
        return this.http.post(`${this.APICamMon}/v1/reportes/liquidaciones-regularizar`, data);
    }

    postPagoProveedor(data:any) {
        return this.http.post(`${this.APICamMon}/v1/cambio/moneda/pago-proveedor`, data);
    }
    
    getAsientosContables(idCambioMonedaLiqDiariaRes: any) {
        return this.http.get(`${this.APICamMon}/v1/cm/interfaz/gl/liq-diaria/${idCambioMonedaLiqDiariaRes}`);
    }
}