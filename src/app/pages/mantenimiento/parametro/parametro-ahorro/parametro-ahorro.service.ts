import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParametroAhorroService {

    APIUtilAho = environment.APIUtilAho;

    constructor(private http: HttpClient) { }

    postParametro(data: any) {
        const url = `${this.APIUtilAho}/v1/parametro`;
        return this.http.post(url, data, {});
    }

    putParametro(data: any) {
        const url = `${this.APIUtilAho}/v1/parametro`;
        return this.http.put(url, data, {});
    }

    deleteParametro(codParam: any) {        
        const url = `${this.APIUtilAho}/v1/parametro/codigo-parametro/${codParam}`;
        return this.http.delete(url);
    }

    getParametros() {
        const url = `${this.APIUtilAho}/v1/parametro`;
        return this.http.get(url, {});
    }

    getParametro(codParam: any) {
        const url = `${this.APIUtilAho}/v1/parametro/codigo-parametro/${codParam}`;
        return this.http.get(url, {});
    }

    getGrupoParametros() {
        const url = `${this.APIUtilAho}/v1/parametro/obtener-codigos-tabla-distintos`;
        return this.http.get(url, {});
    }
}
