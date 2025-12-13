import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import jsPDF, { jsPDFOptions } from 'jspdf';
import 'jspdf-autotable';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CuentasDetailsService {
    APICtaAho = environment.APICtaAho;
    APICliAho = environment.APICliAho;
    APITrxAho = environment.APITrxAho;

    constructor(private readonly http: HttpClient) {}

    postCuentaMovimientos(data: any) {
        return this.http.post(`${this.APITrxAho}/v1/transaccion/debito/movimientos/ext/Plan`, data);
    }

    postSaldosMes(data: any) {
        return this.http.post(`${this.APITrxAho}/v1/transaccion/debito/movimientos/ext`, data);
    }

    getCuentaAutorizaciones(uIdCliente: any, uIdCuenta: any, fini: any, ffin: any, pagina: any, tamanio: any) {
        return this.http.get(
            `${this.APITrxAho}/v1/transaccion/debito/cliente/${uIdCliente}/cuenta/${uIdCuenta}?fechaDesde=${fini}&fechaHasta=${ffin}&pagina=${pagina}&tamanioPagina=${tamanio}`
        );
    }

    getCuentaBloqueos(uIdCuenta: any) {
        return this.http.get(`${this.APICtaAho}/v1/bloqueo/cuenta/${uIdCuenta}`);
    }

    getCuentaRetenciones(uIdCuenta: any) {
        return this.http.get(`${this.APICtaAho}/v1/retencion/cuenta/${uIdCuenta}`);
    }

    getTarjetaBloqueos(idTarjeta: any, uIdCliente: any, uIdCuenta: any, token: any) {
        return this.http.get(
            `${this.APICtaAho}/v1/bloqueo/tarjeta/${idTarjeta}/cliente/${uIdCliente}/cuenta/${uIdCuenta}/token/${token}`
        );
    }

    getCuentaPagosPorBloqueo(uIdCuenta: any, idBloqueo: any) {
        return this.http.get(
            `${this.APICtaAho}/v1/beneficiario/pagos/uidcuenta/${uIdCuenta}/idbloqueo/${idBloqueo}`
        );
    }

    getTarjetas(clienteUid: any, cuentaUid: any) {
        return this.http.get(
            `${this.APICtaAho}/v1/cuenta/cliente/${clienteUid}/cuenta/${cuentaUid}/tarjetas`
        );
    }

    getPagoRetencion(uIdCuenta: any, idRetencion: any) {
        return this.http.get(
            `${this.APICtaAho}/v1/beneficiario/pagos/uidcuenta/${uIdCuenta}/idretencion/${idRetencion}`
        );
    }

    getDatosAjuste(idTransaccion: any) {
        return this.http.get(`${this.APICtaAho}/v1/ajuste/transaccion/${idTransaccion}`);
    }

    getObtenerSaldos(cuenta: any, uIdCliente: string, uIdCuenta: string): Observable<any> {
        const r1 = this.http.get(`${this.APICtaAho}/v1/saldo/uidCliente/${uIdCliente}/uidCuenta/${uIdCuenta}`);
        const r2 = this.http.get(`${this.APICtaAho}/v1/cuenta/intereses/${cuenta.idCuenta}/saldoDisponible/0/saldoRetenido/0`);
        const r3 = this.http.get(`${this.APITrxAho}/v1/transaccion/debito/estado-cuenta/cliente/${uIdCliente}/cuenta/${uIdCuenta}`);
        return forkJoin([r1, r2, r3]);
    }

    getInteresTarifario(object: any) {
        return this.http.post(`${this.APICtaAho}/v1/interes/tarifario`, object);
    }

    getDatosCabeceraMovimiento(idTransaccion: any, numeroCuenta: any) {
        return this.http.get(
            `${this.APICtaAho}/v1/ajuste/customer/cabecera/idtransaccion/${idTransaccion}/numerocuenta/${numeroCuenta}`
        );
    }

    getDatosDetalleMovimiento(idCabecera: any) {
        return this.http.get(`${this.APICtaAho}/v1/ajuste/customer/detalle/idCabecera/${idCabecera}`);
    }

    async postAjusteAbonoInteres(object: any): Promise<any> {
        return this.http.post(`${this.APICtaAho}/v1/interes/ajuste/abono`, object).toPromise();
    }

    async postAjusteRetiroInteres(object: any): Promise<any> {
        return this.http.post(`${this.APICtaAho}/v1/interes/ajuste/cargo`, object).toPromise();
    }

    async postAjusteAbonoCapital(object: any): Promise<any> {
        return this.http.post(`${this.APICtaAho}/v1/saldo/ajuste/abono`, object).toPromise();
    }

    async postAjusteRetiroCapital(object: any): Promise<any> {
        return this.http.post(`${this.APICtaAho}/v1/saldo/ajuste/retiro`, object).toPromise();
    }

    async postDetalleAjusteSaldo(object: any): Promise<any> {
        return this.http.post(`${this.APICtaAho}/v1/ajuste/customer/detalle/actualizar`, object).toPromise();
    }

    templateConstanciaBloqueoCuentaPdf(data: any) {
        const doc = new jsPDF(this.pdfConfig());
        const img = new Image();
        img.src = 'assets/images/backgrounds/constanciaBloqueoCuenta.jpg';

        doc.addImage(img, 'jpg', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
        doc.setTextColor(2, 50, 95);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`Nro : ${data.idBloqueo}`, 250, 85);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);

        doc.text(data.tipoDocumento, 140, 140);
        doc.text(data.numeroDocumento, 380, 140);

        doc.text(data.nombreCliente, 140, 160);
        doc.text(data.apellidoCliente, 380, 160);

        doc.text(data.producto, 140, 232);
        doc.text(data.numeroCuenta, 380, 232);

        doc.text('Bloqueo de Cuenta', 140, 305);
        doc.text(this.capitalizeWords(data.motivoBloqueo), 380, 305);

        doc.text(data.fechaBloqueo, 140, 325);

        doc.save(`Constancia de bloqueo de cuenta ${data.producto}_${data.idBloqueo}.pdf`);
    }

    templateConstanciaBloqueoTarjetaPdf(data: any) {
        const doc = new jsPDF(this.pdfConfig());
        const img = new Image();
        img.src = 'assets/images/backgrounds/constanciaBloqueoTarjeta.jpg';

        doc.addImage(img, 'jpg', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
        doc.setTextColor(2, 50, 95);

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`Nro : ${data.idExternoBloqueo}`, 250, 85);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');

        doc.text(data.tipoDocumento, 140, 140);
        doc.text(data.numeroDocumento, 380, 140);

        doc.text(data.nombreCliente, 140, 160);
        doc.text(data.apellidoCliente, 380, 160);

        doc.text(data.producto, 140, 232);
        doc.text(data.numeroTarjeta, 380, 232);

        doc.text('Bloqueo de Tarjeta', 140, 305);
        doc.text(data.origen, 380, 305);

        doc.text(this.capitalizeWords(data.motivoBloqueo), 140, 325);
        doc.text(data.fechaBloqueo, 380, 325);

        doc.save(`Constancia de bloqueo de tarjeta ${data.producto}_${data.idExternoBloqueo}.pdf`);
    }

    private pdfConfig(): jsPDFOptions {
        return {
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
            putOnlyUsedFonts: true
        };
    }

    private capitalizeWords(value: string): string {
        if (!value) return '';
        return value
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
