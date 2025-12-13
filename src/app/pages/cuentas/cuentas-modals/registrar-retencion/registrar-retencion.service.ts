import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RegistrarRetencionService {

    APICtaAho = environment.APICtaAho;

    constructor(private readonly http: HttpClient) { }

    postRegistrarRetencion(object:any) {
        const url = `${this.APICtaAho}/v1/saldo/retencion`;
        return this.http.post(url, object);
    }
}
