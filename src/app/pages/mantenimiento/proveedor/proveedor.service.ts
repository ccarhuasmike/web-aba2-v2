import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ProveedorService {

    APICamMon = environment.APICamMon;
    constructor(private readonly http: HttpClient) { }

    postRegistrarProveedor(data: any) {
        const url = `${this.APICamMon}/v1/partner`;
        return this.http.post(url, data);
    }

    putActualizarPartner(data:any) {
        const url = `${this.APICamMon}/v1/partner`;
        return this.http.put(url, data);
    }

    getObtenerProveedor(numDoc = null, tipoDoc = null) {
        let params = new HttpParams()
        params = numDoc ? params.append('numDoc', numDoc) : params;
        params = tipoDoc ? params.append('tipoDoc', tipoDoc) : params;

        const url = `${this.APICamMon}/v1/partner`;
        return this.http.get(url, { params: params });
    }

    getBancoCuentaProveedor(idPartner:any) {
        const url = `${this.APICamMon}/v1/banco-cuenta-partner/idPartner/${idPartner}`;
        return this.http.get(url);
    }

    postRegistrarBancoCuentaPartner(data:any) {
        const url = `${this.APICamMon}/v1/banco-cuenta-partner`;
        return this.http.post(url, data);
    }

    putActualizarBancoCuentaPartner(data:any) {
        const url = `${this.APICamMon}/v1/banco-cuenta-partner`;
        return this.http.put(url, data);
    }

    deleteBancoCuentaPartner(id:any) {
        const url = `${this.APICamMon}/v1/banco-cuenta-partner/${id}`;
        return this.http.delete(url);
    }
}