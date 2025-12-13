import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DetalleBotoneraService {
    APICtaAho = environment.APICtaAho;
    constructor(private readonly http: HttpClient) {
        // This a constructor
    }

    getConfiguracion(uIdCliente:any, uIdCuenta:any, token:any) {
        const url = `${this.APICtaAho}/v1/tarjeta/cliente/${uIdCliente}/cuenta/${uIdCuenta}/tarjetas/${token}/configuracion`;
        return this.http.get(url);
    }

    getHistorial(uIdCliente:any, uIdCuenta:any, token:any) {
        const url = `${this.APICtaAho}/v1/tarjeta/cliente/${uIdCliente}/cuenta/${uIdCuenta}/tarjetas/${token}/historial-botonera`;
        return this.http.get(url);
    }
}
