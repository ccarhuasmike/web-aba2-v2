import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ParametroDebitoService {

    APICtaAho = environment.APICtaAho;

    constructor(private readonly http: HttpClient) { }

    postParametro(data: any) {
        const url = `${this.APICtaAho}/v1/debito-parametro/registrar`;
        return this.http.post(url, data, {});
    }

    putParametro(data: any) {
        const url = `${this.APICtaAho}/v1/debito-parametro/modificar`;
        return this.http.post(url, data, {});
    }

    deleteParametro(codParam: any) {
        const url = `${this.APICtaAho}/v1/debito-parametro/eliminar/${codParam}`;
        return this.http.put(url, {});
    }

    getParametros() {
        const url = `${this.APICtaAho}/v1/debito-parametro/listar`;
        return this.http.get(url, {});
    }

    getParametro(codParam: any) {
        const url = `${this.APICtaAho}/v1/debito-parametro/obtener/parametro/${codParam}`;
        return this.http.get(url, {});
    }

    getGrupoParametros() {
        const url = `${this.APICtaAho}/v1/debito-parametro/listar/tabla/distintos`;
        return this.http.get(url, {});
    }
}
