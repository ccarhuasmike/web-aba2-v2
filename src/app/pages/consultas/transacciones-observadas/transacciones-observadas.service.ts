import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TransaccionesObservadasService {

    APITrxAho = environment.APITrxAho;
    APICtaAho = environment.APICtaAho;

    constructor(private readonly http: HttpClient) { }

    getCuentaAutorizaciones(uIdCliente:any, uIdCuenta:any, fini:any, ffin:any, pagina:any, tamanio:any) {
        const url = `${this.APITrxAho}/v1/transaccion/debito/cliente/${uIdCliente}/cuenta/${uIdCuenta}?fechaDesde=${fini}&fechaHasta=${ffin}&pagina=${pagina}&tamanioPagina=${tamanio}`;
        return this.http.get(url);
    }

    getCuentaPorTokenTarjeta(token:any) {
        const url = `${this.APICtaAho}/v1/cuenta/cliente/cuenta/${token}`;
        return this.http.get(url);
    }

    getTransaccionesObservadas(fecha:any, fechaDesde:any, fechaHasta:any, estado:any, pagina:any, tamanio:any) {
        const url = `${this.APITrxAho}/v1/observadas?date=${fecha}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&estado=${estado}&pagina=${pagina}&tamanio=${tamanio}`;
        return this.http.get(url);
    }

    getMultipleTransaccionesObservadasPromise(array:any, fecha:any, fechaDesde:any, fechaHasta:any, estado:any, tamanio:any): Promise<any> {
        let responses:any[] = [];
        array.forEach((element:any) => {
            const url = `${this.APITrxAho}/v1/observadas?date=${fecha}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&estado=${estado}&pagina=${element}&tamanio=${tamanio}`
            const resp: any = this.http.get(url).toPromise();
            responses.push(resp);
        });
        return Promise.all(responses);
    }

    postSolucionPasePerdida(data: any) {
        const url = `${this.APITrxAho}/v1/observadas/pase/perdida`;
        return this.http.post(url, data, {});
    }

    postSolucionPaseDesestimar(data: any) {
        const url = `${this.APITrxAho}/v1/observadas/desestimar`;
        return this.http.post(url, data, {});
    }

    postSolucionContraCargo(data: any) {
        const url = `${this.APITrxAho}/v1/observadas/contra/cargo`;
        return this.http.post(url, data, {});
    }

    postSolucionAjusteAbonoManual(data: any) {
        const url = `${this.APITrxAho}/v1/observadas/ajuste/abono/manual`;
        return this.http.post(url, data, {});
    }

    postSolucionConfirmarMovimiento(data: any) {
        const url = `${this.APITrxAho}/v1/observadas/confirmar/movimiento`;
        return this.http.post(url, data, {});
    }

    postSolucionAjusteCargoManual(data: any) {
        const url = `${this.APITrxAho}/v1/observadas/ajuste/cargo/manual`;
        return this.http.post(url, data, {});
    }
}