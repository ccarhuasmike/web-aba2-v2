import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AutorizacionesService {

    APITrxAho = environment.APITrxAho;
    constructor(private readonly http: HttpClient) {       
    }
    getCuentaAutorizaciones(uIdCliente:any, uIdCuenta:any, fini:any, ffin:any, pagina:any, tamanio:any) {
        const url = `${this.APITrxAho}/v1/transaccion/debito/cliente/${uIdCliente}/cuenta/${uIdCuenta}?fechaDesde=${fini}&fechaHasta=${ffin}&pagina=${pagina}&tamanioPagina=${tamanio}`;
        return this.http.get(url);
    }

    async getCuentaAutorizacion(idTransaccion:any) {
        const url = `${this.APITrxAho}/v1/transaccion/debito/${idTransaccion}`;
        return await this.http.get(url).toPromise();
    }

    postLiberarManualmenteAutorizacion(data: any) {
        const url = `${this.APITrxAho}/v1/liberacion/ajustes`;
        return this.http.post(url, data, {})
    }
}