import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class HistorialBloqueosService {
    
    APIBloMas = environment.APIBloMas;

    constructor(private readonly http: HttpClient) { }

    getLote(pagina:any, tamanoPagina:any, fechaInicio:any, fechaFin:any, idLote:any) {
        let params = new HttpParams();
        params = params.append('pagina', pagina);
        params = params.append('tamanoPagina', tamanoPagina);
        params = (fechaInicio) ? params.append('fechaInicio', fechaInicio) : params;
        params = (fechaFin) ? params.append('fechaFin', fechaFin) : params;
        params = (idLote) ? params.append('id', idLote) : params;
        const url = `${this.APIBloMas}/v1/bloqueo/cabecera`;
        return this.http.get(url, { params: params });
    }

    getDetalleLote(pagina:any, tamanio:any, idCabecera:any) {
        let params = new HttpParams();
        params = params.append('pagina', pagina);
        params = params.append('tamanoPagina', tamanio);
        params = params.append('idCabecera', idCabecera);
        const url = `${this.APIBloMas}/v1/bloqueo/detalle`;
        return this.http.get(url, { params: params })
    }
}