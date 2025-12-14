import { CommonService } from '@/pages/service/commonService';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenizacionService {

  APICliAho = environment.APICliAho;
  APICarDig = environment.APICarDig;
  ClientIdTarOh = environment.ClientIdTarOh;

  constructor(
    private http: HttpClient,
    private commonService: CommonService
  ) { }

  getTokenizacionPorDigitalCardId(digitalCardId:any) {
    return this.http.get(`${this.APICliAho}/v1/tokenizacion/${digitalCardId}/detalle`);
  }

  getNotificacionPorDigitalCardId(token:any, digitalCardId:any) {
    const deviceData = this.commonService.getDeviceData();

    const headers = new HttpHeaders({
      ...deviceData,
      'x-api-key': this.ClientIdTarOh,
      'Codigo-Canal': 'ABA2',
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('digitalCardId', digitalCardId);

    return this.http.get(`${this.APICarDig}/v1/notificacion/digitalCardId`, { headers, params: params });
  }

  getOtpPorCorrelationId(token:any, correlationId:any) {
    const deviceData = this.commonService.getDeviceData();

    const headers = new HttpHeaders({
      ...deviceData,
      'x-api-key': this.ClientIdTarOh,
      'Codigo-Canal': 'ABA2',
      'Authorization': `Bearer ${token}`
    });


    const params = new HttpParams()
      .set('correlationId', correlationId);

    return this.http.get(`${this.APICarDig}/v1/otp`, { headers, params: params });
  }
}
