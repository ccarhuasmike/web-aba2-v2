import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesAhorrosohService {

  APICtaAhoMig = environment.APICtaAhoMig;

  constructor(private http: HttpClient) { }

  getReporteSolicitudes(request:any) {
    let url = `${this.APICtaAhoMig}/v1/aba/solicitudes-ahorros/filtro-fecha`;
    return this.http.post(url, request)
  }

  putActualizarDatosSolicitud(body:any) {
    let url = `${this.APICtaAhoMig}/v1/aba/solicitudes-ahorros/actualizacion-datos`;
    return this.http.put(url, body);
  }
}
