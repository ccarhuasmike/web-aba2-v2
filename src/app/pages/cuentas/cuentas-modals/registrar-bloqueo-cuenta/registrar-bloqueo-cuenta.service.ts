import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root'
})
export class RegistrarBloqueoCuentaService {

    APICtaAho = environment.APICtaAho;

    constructor(private readonly http: HttpClient) {
        //this is a constructor
    }

    postBloqueoCuenta(object:any) {
        const url = `${this.APICtaAho}/v1/bloqueo/cuenta`;
        return this.http.post(url, object);
    }

    getEstadosMotivosBloqueoCuenta() {
        const url = `${this.APICtaAho}/v1/bloqueo/razon`;
        return this.http.get(url);
    }
}
