import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";


@Injectable({
    providedIn: 'root'
})
export class FeriadoService {

    APICamMon = environment.APICamMon;

    constructor(private readonly http: HttpClient) { }

    getFeriados(fechaDesde:any, fechaHasta:any, indRepetir:any) {
        const url = `${this.APICamMon}/v1/calendario`;
        let params = new HttpParams();
        if (fechaDesde) {
            params = params.append('fechaDesde', fechaDesde);
        }
        if (fechaHasta) {
            params = params.append('fechaHasta', fechaHasta);
        }
        if (!(indRepetir === null || indRepetir === "" || indRepetir === undefined)) {
            params = params.append('indRepetir', indRepetir.toString());
        }
        return this.http.get(url, { params: params });
    }

    postRegistrarFeriado(data:any){
        const url = `${this.APICamMon}/v1/calendario`;
        return this.http.post(url,data);
    }

    putActualizarFeriado(data:any){
        const url = `${this.APICamMon}/v1/calendario`;
        return this.http.put(url,data);
     }
     
     deleteFeriado(id:any){
        const url = `${this.APICamMon}/v1/calendario/${id}`;
        return this.http.delete(url);
     }
}