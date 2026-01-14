import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { MCTITIPO } from '@/layout/Utils/constants/aba.constants';
import { TransaccionesObservadasService } from '@/pages/consultas/transacciones-observadas/transacciones-observadas.service';

export interface DataElements {
    COMMERCE_NAME?: string;
    TRANSACTION_LOCAL_DATE?: string;
    TRANSMISSION_DATETIME?: string;
    PIN_BLOCK?: string;
    TRACE_NUMBER?: string;
    OTHER_MOUNTS?: string;
    PRIVATE_USE_FIELDS?: string;
    NETWORK_DATA?: string;
    TERMINAL_ID?: string;
    PROCESSING_CODE?: string;
    BILLING_AMOUNT?: string;
    ADDITIONAL_POS?: string;
    DATA_PRIVATE?: string;
    TRANSACTION_CURRENCY_CODE?: string;
    ADDITIONAL_AMOUNTS?: string;
    MERCHANT_TYPE?: string;
    COMMERCE_ID?: string;
    POS_ENTRY_MODE?: string;
    CONVERSION_RATE?: string;
    ICC?: string;
    TRANSACTION_LOCAL_TIME?: string;
    CARD_EXPIRATION_DATE?: string;
    POS_CONDITION_CODE?: string;
    FORWARDING_IDCODE?: string;
    TRANSACTION_SPECIFIC_DATA?: string;
    TRANSACTION_AMOUNT?: string;
    CUSTOM_PAYMENT_SERVICE?: string;
    CARD_SEQUENCE_NUMBER?: string;
    RETRIEVAL_REFERENCE_NUMBER?: string;
    PAN?: string;
    ACQUIRING_IDCODE?: string;
    COUNTRY_CODE?: string;
    RESPONSE_CODE?: string;
    ORIGINAL_DATA_ELEMENTS?: string;
    AUTHORIZATION_CODE?: string;
}

@Component({
    selector: 'app-actualizacion-solucion-trx-observada',
    templateUrl: './actualizacion-solucion-trx-observada.component.html',
    styleUrls: ['./actualizacion-solucion-trx-observada.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, ButtonModule, DividerModule],
    providers: [MessageService]
})
export class ActualizacionSolucionComponent {

    dataElements!: DataElements;
    uidCliente: any;
    uidCuenta: any;
    dataTrxObservada: any;
    dataAutorizacion: any;
    tipoSolucion: any;
    autorizacion: any;
    mctitipoList: any;
    commerceName: any;
    pasos: string[] = [];

    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly messageService: MessageService,
        private readonly transaccionesObservadasService: TransaccionesObservadasService
    ) {
        const data = config.data || {};
        this.uidCliente = data.uidCliente;
        this.uidCuenta = data.uidCuenta;
        this.dataTrxObservada = data.dataTrxObservada;
        this.dataAutorizacion = data.dataAutorizacion;
        this.tipoSolucion = data.tipoSolucion;
        this.autorizacion = data.dataAutorizacion;

        this.initializeDataElements();
    }    

    private initializeDataElements(): void {
        this.dataElements = {
            COMMERCE_NAME: undefined,
            TRANSACTION_LOCAL_DATE: undefined,
            TRANSMISSION_DATETIME: undefined,
            PIN_BLOCK: undefined,
            TRACE_NUMBER: undefined,
            OTHER_MOUNTS: undefined,
            PRIVATE_USE_FIELDS: undefined,
            NETWORK_DATA: undefined,
            TERMINAL_ID: undefined,
            PROCESSING_CODE: undefined,
            BILLING_AMOUNT: undefined,
            ADDITIONAL_POS: undefined,
            DATA_PRIVATE: undefined,
            TRANSACTION_CURRENCY_CODE: undefined,
            ADDITIONAL_AMOUNTS: undefined,
            MERCHANT_TYPE: undefined,
            COMMERCE_ID: undefined,
            POS_ENTRY_MODE: undefined,
            CONVERSION_RATE: undefined,
            ICC: undefined,
            TRANSACTION_LOCAL_TIME: undefined,
            CARD_EXPIRATION_DATE: undefined,
            POS_CONDITION_CODE: undefined,
            FORWARDING_IDCODE: undefined,
            TRANSACTION_SPECIFIC_DATA: undefined,
            TRANSACTION_AMOUNT: undefined,
            CUSTOM_PAYMENT_SERVICE: undefined,
            CARD_SEQUENCE_NUMBER: undefined,
            RETRIEVAL_REFERENCE_NUMBER: undefined,
            PAN: undefined,
            ACQUIRING_IDCODE: undefined,
            COUNTRY_CODE: undefined,
            RESPONSE_CODE: undefined,
            ORIGINAL_DATA_ELEMENTS: undefined,
            AUTHORIZATION_CODE: undefined
        };

        this.mctitipoList = MCTITIPO.find(e => e.codigo == this.dataTrxObservada.data.entrada.MCTITIPO);

        if (this.tipoSolucion.valCadCorto == '01') {
            this.pasos = [
                'Se aplicará una anulación a la transacción original',
                `Se creará una transacción de ${this.mctitipoList.descripcion} por el monto de ${this.dataTrxObservada.data.entrada.MCTIIMPOConvert}`,
                'Se confirmará la transacción creada'
            ];
            this.dataElements = this.dataTrxObservada.data.procesador.transaccion.transaccionRequest.dataElements;
        } else if (this.tipoSolucion.valCadCorto == '06') {
            this.pasos = [
                'Se confirmará la transacción'
            ];
        } else if (this.tipoSolucion.valCadCorto == '04') {
            const codAutorizacion = this.dataTrxObservada.data.entrada.MCTIAUTO?.trim()
                || this.dataTrxObservada.data.entrada.MCTIAREN?.trim().slice(-6)
                || '';

            this.commerceName = `VISA ${this.dataTrxObservada.data.entrada.MCTIMOADDesc} - ${codAutorizacion} - ${this.dataTrxObservada.data.entrada.MCTIFTRAConvert?.replaceAll("/", "")} - ${this.dataTrxObservada.data.entrada.MCTINEST.trim()}`;

            this.pasos = [
                `Se registrará un ajuste de abono en la cuenta por el monto de ${this.dataTrxObservada.data.entrada.MCTIIMPOConvert}. Código comercio: 100000000000014 - Nombre comercio: ${this.commerceName}`
            ];
        } else if (this.tipoSolucion.valCadCorto == '07') {
            this.pasos = [
                `Se creará una transacción de cargo ${this.mctitipoList.descripcion} por el monto de ${this.dataTrxObservada.data.entrada.MCTIIMPOConvert}`,
                'Se confirmará la transacción creada'
            ];

            this.dataElements.PAN = this.dataTrxObservada.data.entrada.MCD4TARE.trim();
            this.dataElements.PROCESSING_CODE = this.dataTrxObservada.data.entrada.MCTITIPO.trim() + '0000';
            this.dataElements.MERCHANT_TYPE = this.dataTrxObservada.data.entrada.MCTIMCC.trim();
            this.dataElements.COUNTRY_CODE = this.dataTrxObservada.data.entrada.MCTIMOAD.trim();
            this.dataElements.POS_ENTRY_MODE = '05';
            this.dataElements.TERMINAL_ID = '99999999';
            this.dataElements.COMMERCE_ID = this.dataTrxObservada.data.entrada.MCTICEST.trim();
        }

        this.pasos.push('Se procederá a cerrar la transacción observada');
    }

    guardarSolucionTransaccionObservada(): void {
        const usuario = JSON.parse(localStorage.getItem('userABA')!);
        const tipoSolucion = this.tipoSolucion.valCadCorto.toString();

        let object: any = {
            idTrxObservada: this.dataTrxObservada.id,
            estado: this.dataTrxObservada.estado,
            codigoComercio: this.dataTrxObservada.data.entrada.MCTICEST.trim(),
            token: this.dataTrxObservada.data.entrada.MCD4TARE.trim(),
            montoNuevo: Number(this.dataTrxObservada.data.entrada.MCTIIMPOConvert),
            idTrxOriginal: this.dataTrxObservada.data.procesador?.transaccion?.idTransaccion ?? '',
            codigoAutorizacionTrxOriginal: this.dataTrxObservada.data.procesador?.transaccion?.codigoAutorizacion ?? '',
            fechaAutorizacionTrxOriginal: this.dataTrxObservada.data.procesador?.transaccion?.fechaAutorizacion ?? '',
            origen: this.dataTrxObservada.data.procesador?.transaccion?.descOrigen ?? '',
            request: this.dataTrxObservada.data.procesador?.transaccion?.descRequerimiento ?? '',
            tipoSolucion: tipoSolucion,
            tipoAnulacion: 'TOTAL',
            usuario: usuario.email
        };

        if (tipoSolucion == '04') {
            const request = {
                messageType: 1100,
                commerceTerminalId: 10001,
                commerceTransactionNumber: 1,
                dataElements: this.dataElements
            };

            object = {
                ...object,
                uidCliente: this.uidCliente,
                uidCuenta: this.uidCuenta,
                commerceName: this.commerceName,
                codigoComercio: '100000000000014',
                request: JSON.stringify(request)
            };
        }

        if (tipoSolucion == '06') {
            object = {
                ...object,
                idTrxOriginal: this.dataAutorizacion.idTransaccion,
                authorizationCode: this.dataAutorizacion.codigoAutorizacion,
                externalReference: this.dataAutorizacion.uIdreferenciaExterna,
                origen: this.dataAutorizacion.descOrigen,
                request: this.dataAutorizacion.descRequerimiento,
                dataElements: this.dataAutorizacion.transaccionRequest.dataElements,
                mctitipo: this.dataTrxObservada.data.entrada.MCTITIPO.trim()
            };
        }

        if (tipoSolucion == '02') {
            this.transaccionesObservadasService.postSolucionPasePerdida(object).subscribe((resp: any) => {
                this.handleResponse(resp, 'Error guardarSolucionTransaccionObservada');
            }, () => this.dialogRef.close());
        } else if (tipoSolucion == '05') {
            this.transaccionesObservadasService.postSolucionPaseDesestimar(object).subscribe((resp: any) => {
                this.handleResponse(resp, 'Error guardarSolucionTransaccionObservada');
            }, () => this.dialogRef.close());
        } else if (tipoSolucion == '03') {
            this.transaccionesObservadasService.postSolucionContraCargo(object).subscribe((resp: any) => {
                this.handleResponse(resp, 'Error guardarSolucionTransaccionObservada');
            }, () => this.dialogRef.close());
        } else if (tipoSolucion == '04') {
            this.transaccionesObservadasService.postSolucionAjusteAbonoManual(object).subscribe((resp: any) => {
                this.handleResponse(resp, 'Error guardarSolucionTransaccionObservada');
            }, () => this.dialogRef.close());
        } else if (tipoSolucion == '06') {
            this.transaccionesObservadasService.postSolucionConfirmarMovimiento(object).subscribe((resp: any) => {
                this.handleResponse(resp, 'Error guardarSolucionTransaccionObservada');
            }, () => this.dialogRef.close());
        }
    }

    private handleResponse(resp: any, errorSummary: string): void {
        if (resp['codigo'] === 0) {
            this.messageService.add({
                severity: 'success',
                summary: 'Operación exitosa',
                detail: 'Se dio solución a la transacción observada'
            });

            this.dialogRef.close({
                event: 'close', data: resp
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: errorSummary,
                detail: resp['mensaje'] || 'Error inesperado'
            });
            this.dialogRef.close();
        }
    }
}
