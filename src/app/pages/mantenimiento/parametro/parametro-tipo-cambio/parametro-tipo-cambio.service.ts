import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ParametroTipoCambioService {
    APICamMon = environment.APICamMon;
    constructor(private readonly http: HttpClient){}

    postParametro(data: any) {
        const url = `${this.APICamMon}/v1/parametro`;
        return this.http.post(url, data, {});
    }

    putParametro(data: any) {
        const url = `${this.APICamMon}/v1/parametro`;
        return this.http.put(url, data, {});
    }

    deleteParametro(codParam: any) {
        const url = `${this.APICamMon}/v1/parametro/${codParam}`;
        return this.http.delete(url, {});
    }

    getParametros() {
        const url = `${this.APICamMon}/v1/parametro`;
        return this.http.get(url, {});
    }

    getParametro(codParam: any) {
        const url = `${this.APICamMon}/v1/parametro/codParam/${codParam}`;
        return this.http.get(url, {});
    }

    getGrupoParametros() {
        const url = `${this.APICamMon}/v1/parametro/listar/tabla/distintos`;
        return this.http.get(url);
    }
    
    getGrupoParametrosNomTabla(nomTabla:any){
        const url = `${this.APICamMon}/v1/parametro/nomTabla/${nomTabla}`;
        return this.http.get(url);
    }
}