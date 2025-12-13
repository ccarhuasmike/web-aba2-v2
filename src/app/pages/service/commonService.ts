import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import moment from 'moment';
import * as forge from 'node-forge';
import { REQUEST_PARAMETERS, RequestParameterKey } from '../../layout/Utils/constants/aba.constants';
import CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class CommonService {

    APIUrl = environment.APIUrl;
    APITrxAho = environment.APITrxAho;
    APICtaAho = environment.APICtaAho;
    APICliAho = environment.APICliAho;
    APICatalo = environment.APICatalo;
    APICliAgo = environment.APICliAgo;
    APICamMon = environment.APICamMon;
    APITarOhP = environment.APITarOhP;
    PrivateKeyEncodedBase64 = environment.PrivateKeyEncodedBase64;

    constructor(private readonly http: HttpClient) {
        // This a constructor
    }
    getMultipleCombosPromise(array: any): Promise<any> {
        let responses: any = [];
        array.forEach((element: any) => {
            const url = `${this.APICtaAho}/v1/debito-parametro/listar/tabla/nom-tabla/${element}`;
            const resp: any = this.http.get(url).toPromise();
            responses.push(resp);
        });
        return Promise.all(responses);
    }



    getMultipleCombosPromiseCuenta(array: any): Promise<any> {
        let responses: any = [];
        array.forEach((element: any) => {
            const url = `${this.APICtaAho}/v1/parametro/${element}`;
            const resp: any = this.http.get(url).toPromise();
            responses.push(resp);
        });
        return Promise.all(responses);
    }

    getMultipleCombosPromiseTrx(array: any): Promise<any> {
        let responses: any = [];
        array.forEach((element: any) => {
            const url = `${this.APITrxAho}/v1/parametros/${element}`;
            const resp: any = this.http.get(url).toPromise();
            responses.push(resp);
        });
        return Promise.all(responses);
    }

    getMultipleCombosPromiseCliente(array: any): Promise<any> {
        let responses: any = [];
        array.forEach((element: any) => {
            const url = `${this.APICliAho}/v1/parametro/${element}`;
            const resp: any = this.http.get(url).toPromise();
            responses.push(resp);
        });
        return Promise.all(responses);
    }

    getCombo(nomTabla: string) {
        const url = `${this.APITrxAho}/v1/trxahorros/obtenerParametros/0/${nomTabla}`;
        return this.http.get(url);
    }

    getBeneficiario(tipoDoc: string, nroDoc: string) {
        const url = `${this.APICtaAho}/v1/persona-benefiario/${tipoDoc}/${nroDoc}`;
        return this.http.get(url);
    }

    getClientePorCuentaPuc(tipoDoc: string, nroDoc: string) {
        const url = `${this.APICliAho}/v1/cliente/agora/persona?numeroDocumento=${nroDoc}&tipoDocumento=${tipoDoc}`;

        return this.http.get(url);
    }

    getCliente(tipoDoc: string, numDoc: string) {
        const url = `${this.APICliAho}/v1/cliente?numDoc=${numDoc}&tipoDoc=${tipoDoc}`;
        return this.http.get(url);
    }

    getCuenta(clienteUid: string) {
        const url = `${this.APICtaAho}/v1/cuenta/cliente/${clienteUid}`;
        return this.http.get(url)
    }

    getUbigeo(codDpt: string, codPrv: string): Observable<any> {
        const response1 = this.http.get(`${this.APICtaAho}/v1/parametro/obtener-departamentos`);
        const response2 = this.http.get(`${this.APICtaAho}/v1/parametro/obtener-provincias?codDpt=${codDpt}`);
        const response3 = this.http.get(`${this.APICtaAho}/v1/parametro/obtener-distritos?codDpt=${codDpt}&codPrv=${codPrv}`);
        return forkJoin([response1, response2, response3]);
    }

    getDepartamento() {
        const url = `${this.APICtaAho}/v1/parametro/obtener-departamentos`;
        return this.http.get(url);
    }

    getProvincia(codDpt: string) {
        const url = `${this.APICtaAho}/v1/parametro/obtener-provincias?codDpt=${codDpt}`;
        return this.http.get(url);
    }

    getDistrito(codDpt: string, codPrv: string) {
        const url = `${this.APICtaAho}/v1/parametro/obtener-distritos?codDpt=${codDpt}&codPrv=${codPrv}`;
        return this.http.get(url);
    }

    getCalculoItf(currency: string, amount: string) {
        const url = `${this.APICtaAho}/v1/cuenta/itf?moneda=${currency}&monto=${amount}`;
        return this.http.get(url);
    }

    postTransaccionAhorros(object: any) {
        const url = `${this.APITrxAho}/v1/trxahorros/transaccion`;
        return this.http.post(url, object, {});
    }

    getTiposPlan() {
        const url = `${this.APITrxAho}/v1/parametros/tipos/plan`;
        return this.http.get(url);
    }

    getTipoOrigenTransaccion() {
        const url = `${this.APICtaAho}/v1/parametro/tipo-origen-transaccion`;
        return this.http.get(url);
    }

    getEstadosTipoCambio() {
        const url = `${this.APICamMon}/v1/cambio/moneda/estado`;
        return this.http.get(url);
    }

    // Common functions
    extractIdOfObject(object: any) {
        for (const key in object) {
            if (object[key] !== null && typeof object[key] === 'object') {
                object[key] = object[key].id;
            }
        }

        return object;
    }

    getRowsPerPageOptions(rowPerPagination: any, totalRecords: any) {
        let options = [];
        const quotientValue = Number.parseInt(totalRecords) / Number.parseInt(rowPerPagination);
        const roundedValue = Math.ceil(quotientValue);
        for (let index = 0; index < roundedValue; index++) {
            options.push((index + 1) * rowPerPagination);
        }
        return options;
    }

    downloadFile(file: any, fileName: any) {
        if (file) {
            const a = document.createElement('a');
            a.href = file;
            a.download = fileName;
            const clickHandler = () => {
                setTimeout(() => {
                    URL.revokeObjectURL(file);
                    a.removeEventListener('click', clickHandler);
                }, 150);
            };
            a.addEventListener('click', clickHandler, false);
            a.click();
        }
    }

    dateAndTimeWithFormat(date: string = '', time: string = '', fullDate: string = '') {
        let format = '';

        if (date) {
            format = format + moment(date).format('DD/MM/YYYY');
        }

        if (time) {
            format = format + ' ' + time;
        }

        if (fullDate) {
            format = format + moment(fullDate).format('DD/MM/YYYY HH:mm:ss');
        }

        format = format.trim();

        return format;
    }

    dateFormatISO8601(date: string) {
        if (date) {
            return (new Date(date)).toISOString();
        }
        return '';
    }

    dateFormatHyphens(date: any) {
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    postSolucionTransaccionObservada(data: any) {
        const url = `${this.APITrxAho}/v1/observadas/procesar`;
        return this.http.post(url, data, {});
    }

    postConfirmarAutorizacion(data: any) {
        const url = `${this.APITrxAho}/v1/transaccion/debito/confirmar`;
        return this.http.post(url, data, {})
    }

    validaSizeFileMaximo(base64: string): boolean {
        let isValido = false;
        if (base64) {
            const sizeFile = new Blob([base64]).size;
            isValido = (sizeFile < 5000000) ? true : isValido;
        }
        return isValido;
    }

    dateFormatAAMMDD(aammdd: string): string {

        if (!aammdd) {
            return '';
        }

        const anio = aammdd.substring(0, 2);
        const mes = aammdd.substring(2, 4);
        const dia = aammdd.substring(4, 6);
        const fecha = dia + '/' + mes + '/20' + anio;
        return fecha;
    }

    getCardNumberFullEncrypted(token: string) {
        const url = `${this.APITarOhP}/v1/botonera/consultarTarjeta/encriptado/${token}`;
        return this.http.get(url);
    }

    async getIdTarjetaPorNumeroTarjeta(nrotarjeta: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.APITarOhP}/v1/botonera/consultarIdTarjeta/${nrotarjeta}`).subscribe({
                next: (data: any) => {
                    return resolve(data);
                },
                error: (err) => reject(err),
            });
        });
    }

    async getClientePorIdTarjeta(idTarjeta: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.APICtaAho}/v1/cuenta/cliente/cuenta/${idTarjeta}`).subscribe({
                next: (data: any) => {
                    return resolve(data);
                },
                error: (err) => reject(err),
            });
        });
    }

    decryptResponseCardNumber(body: any) {
        const privateKeyRSABase64 = this.PrivateKeyEncodedBase64;
        const privateKeyRSADecodeBase64 = atob(privateKeyRSABase64);

        const tokenEncrypted = body.data.tokenEncode;
        const dataEncrypted = body.data.dataEncode;
        let privateKeyData = '';

        const privateKeyToken = forge.pki.privateKeyFromPem(privateKeyRSADecodeBase64.trim());
        const decodeTextToken = forge.util.decode64(tokenEncrypted);
        const decryptedToken = privateKeyToken.decrypt(decodeTextToken);
        privateKeyData = decryptedToken;

        const key: CryptoJS.lib.WordArray = CryptoJS.enc.Utf8.parse(privateKeyData);
        const iv: CryptoJS.lib.WordArray = CryptoJS.enc.Utf8.parse('drowssapdrowssap');
        const decrypted2: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(dataEncrypted, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return JSON.parse(decrypted2.toString(CryptoJS.enc.Utf8));
    }

    getParametrosAhorros(params: RequestParameterKey[]) {
        const result = params.reduce((acc, key) => {
            acc[key] = REQUEST_PARAMETERS[key];
            return acc;
        }, {} as Partial<Record<RequestParameterKey, typeof REQUEST_PARAMETERS[RequestParameterKey]>>);

        return result;
    }

    getDeviceData(): any {
        // User-Agent Client Hints (moderno y recomendado)
        const uaData = (navigator as any).userAgentData;
        const devicePlatform = uaData?.platform || 'Unknown'; // reemplazo de navigator.platform        
        const userAgent = navigator.userAgent;
        const isMobile = uaData?.mobile ?? /Mobi|Android/i.test(userAgent);

        return {
            'x-application': 'web',
            'x-plataform': devicePlatform,   // 🔥 ya no usa navigator.platform
            'x-version': '',
            'x-device-id': '',
            'x-device-ip': '',
            'x-model': isMobile ? 'Mobile' : 'Desktop',
            Cookie: document.cookie
        };
    }
    getMultipleCombosPromiseCuentaTemporal() {
        return this.http.get(`${environment.APIDevTemporale}/listaEstadoCuenta`);
    }
    getServiceTemporal(servicio: string) {
        return this.http.get(`${environment.APIDevTemporale}/${servicio}`);
    }
    getServiceTemporalAsincrono(servicio: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(`${environment.APIDevTemporale}/${servicio}`).subscribe({
                next: (data: any) => {
                    return resolve(data);
                },
                error: (err) => reject(err),
            });
        });
    }


}
