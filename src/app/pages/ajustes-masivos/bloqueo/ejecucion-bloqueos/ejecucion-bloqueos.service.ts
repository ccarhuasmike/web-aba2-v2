import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class EjecucionBloqueosService {

    APICtaAho = environment.APICtaAho;
    APIBloMas = environment.APIBloMas;

    constructor(private readonly http: HttpClient) { }

    validateUUIDCliente(uuidCliente:any) {
        if (uuidCliente == null || uuidCliente == undefined) { return true; }
        return false;
    }

    validateUUIDCuenta(uuidCuenta:any) {
        if (uuidCuenta == null || uuidCuenta == undefined) { return true; }
        return false;
    }

    validateCodigoBloqueo(codigoBloqueo: string, codigosBloqueo: any[]) {
        if (
            codigoBloqueo == null ||
            codigoBloqueo == undefined ||
            !codigosBloqueo.some(e => e.codigo === codigoBloqueo)
        ) { return true; }

        return false;
    }

    validateMotivoBloqueo(motivoBloqueo: string, motivosBloqueo: any[]) {
        if (
            motivoBloqueo == null ||
            motivoBloqueo == undefined ||
            !motivosBloqueo.some(e => e.codigo === motivoBloqueo)
        ) { return true; }

        return false;
    }

    validateRelacionBloqueoTarjeta(motivoBloqueo: string, codigoBloqueo: string, motivosBloqueo: any[]) {
        const filtered = motivosBloqueo.filter(e =>
            e.codigo === motivoBloqueo &&
            e.codigoEstadoTarjeta === codigoBloqueo
        );

        if (filtered.length == 0) { return true; }

        return false;
    }

    validateRelacionBloqueoCuenta(motivoBloqueo: string, codigoBloqueo: string, codigoMotivosBloqueo: any[]) {
        const filtered = codigoMotivosBloqueo.filter(e =>
            e.id.codigoEstadoCuenta === codigoBloqueo &&
            e.id.codigoRazonCuenta === motivoBloqueo
        );

        if (filtered.length == 0) { return true; }

        return false;
    }

    validateDescripcion(mensaje: string) {
        if (mensaje && mensaje.length > 255) {
            return true;
        }

        return false;
    }

    getMotivosBloqueoCuenta() {
        const url = `${this.APICtaAho}/v1/parametro/motivo-bloqueo-cuenta`;
        return this.http.get(url);
    }

    getMotivosBloqueoTarjeta() {
        const url = `${this.APICtaAho}/v1/parametro/motivo-bloqueo-tarjeta`;
        return this.http.get(url);
    }

    getCodigosBloqueoCuenta() {
        const url = `${this.APICtaAho}/v1/parametro/estado-cuenta`;
        return this.http.get(url);
    }

    getCodigosBloqueoTarjeta() {
        const url = `${this.APICtaAho}/v1/parametro/estado-tarjeta`;
        return this.http.get(url);
    }

    getEstadosMotivosBloqueoCuenta() {
        const url = `${this.APICtaAho}/v1/bloqueo/razon`;
        return this.http.get(url);
    }

    postSendBloquesCSV(file: File, userEmail:any) {
        const formData = new FormData();
        formData.append('file', file);
        let params = new HttpParams();
        params = params.append('usuario', userEmail);
        const url = `${this.APIBloMas}/v1/bloqueo/procesar-archivo`;
        return this.http.post(url, formData, { params: params });
    }
}