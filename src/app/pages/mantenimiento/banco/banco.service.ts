import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
@Injectable({
    providedIn:'root'
})
export class BancoService{
    APICamMon = environment.APICamMon;
    constructor(private readonly http:HttpClient){}

    postRegistrarBanco(data:any){
        const url = `${this.APICamMon}/v1/banco`;
        return this.http.post(url,data);
    }

    getObtenerBancos(){
        const url = `${this.APICamMon}/v1/banco`;
        return this.http.get(url);
    }
     putActualizarBanco(data:any){
        const url = `${this.APICamMon}/v1/banco`;
        return this.http.put(url,data);
     }
}