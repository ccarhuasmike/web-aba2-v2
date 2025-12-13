import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class CobroComisionService {

    APICtaAho = environment.APICtaAho;

    constructor(private readonly http: HttpClient) { }

    postAjusteSaldoAbono(object:any) {
        const url = `${this.APICtaAho}/v1/saldo/ajuste/abono`;
        return this.http.post(url, object, {});
    }

    postAjusteSaldoRetiro(object:any) {
        const url = `${this.APICtaAho}/v1/saldo/ajuste/retiro`;
        return this.http.post(url, object, {});
    }
}