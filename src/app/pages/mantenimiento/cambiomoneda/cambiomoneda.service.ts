import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Campania } from '../../../layout/models/campania';
import { DetallesCampania } from '../../../layout/models/detalleCampania';
import { environment } from "src/environments/environment";


@Injectable({
  providedIn: 'root'
})
export class CambioMonedaService {
  APICamMon = environment.APICamMon; 
  
  constructor(private readonly http: HttpClient) { }

  postRegistrarBanco(data: any) {
    const url = `${this.APICamMon}/v1/banco`;
    return this.http.post(url, data);
  }
  postActualizarCabeceraCampania(data: Campania) {
    const url = `${this.APICamMon}/v1/cambio/moneda/campana`;
    return this.http.put(url, data);
  }

  postRegistrarCabeceraCampania(data: Campania) {
    const url = `${this.APICamMon}/v1/cambio/moneda/campana`;
    return this.http.post(url, data);
  }
  deleteActualizarCabeceraCampania(id: number) {
    const params = new HttpParams()
      .set('id', id.toString());
    return this.http.delete(`${this.APICamMon}/v1/cambio/moneda/campana`, { params: params });
  }

  postRegistrarDetalleCampania(data: DetallesCampania) {
    const url = `${this.APICamMon}/v1/cambio/moneda/campana/dia`;
    return this.http.post(url, data);
  }
  postActualizarDetalleCampania(data: DetallesCampania) {
    const url = `${this.APICamMon}/v1/cambio/moneda/campana/dia`;
    return this.http.put(url, data);
  }
  postDeleteRegistrarDetalleCampania(id: number) {
    return this.http.delete(`${this.APICamMon}/v1/cambio/moneda/campana/dia/${id}`);
  }
  getDetalleCampaniaPorDia(data: DetallesCampania): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.APICamMon}/v1/cambio/moneda/campana/dia/id-codigo-modeda-campana/${data.idCambioMonedaCampana}/codigo-dia/${data.codigoDia}`).subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }

  async getListarDetalleCampania(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.APICamMon}/v1/cambio/moneda/campana/dia/id-codigo-modeda-campana/${id}`).subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }
  async getObtenerDatosCampaniaPorId(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.APICamMon}/v1/cambio/moneda/campana/id-cambio-moneda-campana/${id}`).subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }



  async getEstadoCampania(tipo: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.APICamMon}/v1/cambio/moneda/estado/tipo-estado/${tipo}`).subscribe({
        next: (data: any) => {
          return resolve(data);
        },
        error: (err) => reject(err),
      });
    });
  }

  getCampanias() {
    return this.http.get(`${this.APICamMon}/v1/cambio/moneda/campana/con-estado`);
  }

  getLogsCampanias(idCambioMonedaCampana: any) {
    return this.http.get(`${this.APICamMon}/v1/cambio/moneda/campana/log/id-Cambio-moneda-campana/${idCambioMonedaCampana}`);
  }
  getLogsCampaniasTemporable() {
    return this.http.get(`${environment.APIDevTemporale}/LOGS_CAMPANIA_CAMBIO_MONEDA`);
  }

  getLogsCampaniasDias(idCambioMonedaCamDia: any) {
    return this.http.get(`${this.APICamMon}/v1/cambio/moneda/campana/dia/log/id-cambio-moneda-cam-dia/${idCambioMonedaCamDia}`);
  }
}