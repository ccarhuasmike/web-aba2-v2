import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalcularCuentaAhorroService {

  APICtaAho = environment.APICtaAho;

  constructor(private readonly http: HttpClient) { }

  async postAjusteSimulacion(object:any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(`${this.APICtaAho}/v1/interes/silumacion`, object)
        .subscribe({
          next: (data: any) => {
            return resolve(data);
          },
          error: (err) => reject(err),
        });
    });
  }

  getTasas(fechaInicio:any, fechaFin:any, cuenta:any) {
    const params = new HttpParams()
      .set('fecha-inicio', fechaInicio)
      .set('fecha-fin', fechaFin)
      .set('numCuenta', cuenta);

    const url = `${this.APICtaAho}/v1/saldo/tarifario`;
    return this.http.get(url, { params: params });
  }

  postAjusteSaldoInteres(object:any) {
    const url = `${this.APICtaAho}/v1/ajustes/customer`;
    return this.http.post(url, object, {});
  }

  postAjusteSaldoAbono(object:any) {
    const url = `${this.APICtaAho}/v1/saldo/ajuste/abono`;
    return this.http.post(url, object, {});
  }

  postAjusteSaldoRetiro(object:any) {
    const url = `${this.APICtaAho}/v1/saldo/ajuste/retiro`;
    return this.http.post(url, object, {});
  }
}
