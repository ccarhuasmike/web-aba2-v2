import { ACCOUNT_TYPES, FILE_TYPE, ROLES } from '@/layout/Utils/constants/aba.constants';
import { CuentasDetailsService } from '@/pages/cuentas/cuentas-details/cuentas-details.service';
import { CommonService } from '@/pages/service/commonService';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { DisableContentByRoleDirective } from '@/layout/Utils/directives/disable-content-by-role.directive';

@Component({
    selector: 'app-detalle-autorizacion',
    templateUrl: './detalle-autorizacion.component.html',
    styleUrls: ['./detalle-autorizacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [DisableContentByRoleDirective, TooltipModule, DividerModule, TabsModule, InputGroupAddonModule, InputGroupModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService, ConfirmationService],
})
export class DetalleAutorizacionComponent implements OnInit {

    datosRequest: any;
    datosCliente: any;
    datosCuenta: any;
    datosAutorizaciones: any;
    datosAjuste: any;
    disableTabAjuste: boolean = true;
    tipoMonedas: any[] = [];
    tipoPais: any[] = [];
    tipoCuenta: any;
    roles: any = ROLES;

    constructor(
        private readonly cuentasDetailsService: CuentasDetailsService,
        private readonly commonService: CommonService,
        private readonly toastr: MessageService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
    ) {
        const dataCopy = structuredClone(this.config.data);
        this.datosAutorizaciones = dataCopy.datosAutorizaciones;
        this.datosCliente = dataCopy.datosCliente;
        this.datosCuenta = dataCopy.datosCuenta;

        if (this.datosAutorizaciones?.descRequerimiento)
            this.datosRequest = JSON.parse(this.datosAutorizaciones.descRequerimiento);
        

        const numeroCuenta = this.datosCuenta.numeroCuenta;
        const bin = numeroCuenta.slice(0, 2);
        this.tipoCuenta = ACCOUNT_TYPES.find((type: any) => type.bin === bin);
    }

    ngOnInit(): void {
        this.getCombos();
        this.formatAttributes();
        this.getDatosAjuste();
    }

    getCombos() {
        this.commonService.getMultipleCombosPromise([
            'TIPO_MONEDA_TRAMA',
            'PAIS_ISO',
            'TIPO_DOCUMENTO',
            'BANCO_TIN_INTEROP'
        ]).then(resp => {
            this.tipoMonedas = resp[0]['data'];

            this.tipoPais = resp[1]['data'];

            const tipoDocumentos = resp[2]['data'].map((item: any) => {
                return {
                    id: item['valNumEntero'],
                    descripcion: item['desElemento']
                }
            });

            const bancos = resp[3]['data'].map((item: any) => {
                return {
                    id: item['valCadCorto'],
                    descripcion: item['desElemento']
                }
            });

            if (this.datosAutorizaciones?.transaccionRequest.dataElements) {
                const moneda = this.tipoMonedas.find((e: any) => String(e.valNumEntero) == this.datosAutorizaciones.transaccionRequest.dataElements.transactionCurrencyCode);

                const pais = this.tipoPais.find((e: any) => String(e.valNumEntero) == this.datosAutorizaciones.transaccionRequest.dataElements.countryCode)

                if (moneda) {
                    this.datosAutorizaciones.transaccionRequest.dataElements.currency = moneda.valCadLargo;
                }
                if (pais) {
                    this.datosAutorizaciones.transaccionRequest.dataElements.country = pais.desElemento;
                }
            }

            if (this.datosRequest?.originAccountData) {
                const documentType = tipoDocumentos.find((e: any) => String(e.id) == this.datosRequest.originAccountData.identDocType);
                if (documentType) {
                    this.datosRequest.originAccountData.documentType = documentType.descripcion;
                }

                const entityCode = bancos.find((e: any) => e.id == this.datosRequest.originAccountData.entityCode);
                if (entityCode) {
                    this.datosRequest.originAccountData.entityCode = entityCode.descripcion;
                }
            }

            if (this.datosRequest?.destinationAccountData) {
                const documentType = tipoDocumentos.find((e: any) => String(e.id) == this.datosRequest.destinationAccountData.identDocType);
                if (documentType) {
                    this.datosRequest.destinationAccountData.documentType = documentType.descripcion;
                }

                const entityCode = bancos.find((e: any) => e.id == this.datosRequest.destinationAccountData.entityCode);
                if (entityCode) {
                    this.datosRequest.destinationAccountData.entityCode = entityCode.descripcion;
                }
            }
        })
    }

    getDatosAjuste() {
        this.cuentasDetailsService.getDatosAjuste(this.datosAutorizaciones.idTransaccion)
            .subscribe((resp: any) => {

                if (resp['codigo'] == 0) {
                    this.datosAjuste = resp['data'];
                    this.disableTabAjuste = false;

                } else if (resp['codigo'] == -1) {
                    this.toastr.add({ severity: 'error', summary: 'Error getDatosAjuste', detail: resp['mensaje'] });
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Error getDatosAjuste', detail: 'Error en el servicio de obtener datos del ajuste' });
            });
    }

    visibilidadTarjeta() {
        if (this.datosAutorizaciones.tarjeta.numTarjetaVisible) {
            this.datosAutorizaciones.tarjeta.numTarjetaVisible = false;
        } else if (this.datosAutorizaciones.tarjeta.desenmascarado) {
            this.datosAutorizaciones.tarjeta.numTarjetaVisible = true;
        } else {
            const token = this.datosAutorizaciones.tarjeta.token
            this.commonService.getCardNumberFullEncrypted(token).subscribe((resp: any) => {
                if (resp['codigo'] == 0) {
                    const body = resp;
                    const datosTarjetaDecrypted = this.commonService.decryptResponseCardNumber(body);
                    this.datosAutorizaciones.tarjeta.numTarjetaVisible = true;
                    const desenmascarado = datosTarjetaDecrypted.tarjeta.slice(3);
                    this.datosAutorizaciones.tarjeta['desenmascarado'] = desenmascarado;
                } else {
                    this.toastr.add({ severity: 'error', summary: 'Error visibilidadTarjeta', detail: resp['mensaje'] });
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Error visibilidadTarjeta', detail: 'Error en el servicio de obtener tarjeta encriptada' });
            })
        }
    }

    downloadArchivo(base64File: any, fileName: any): void {
        const type = base64File.substring(base64File.indexOf('/') + 1, base64File.indexOf(';base64'));

        if (type !== FILE_TYPE.PDF && type !== FILE_TYPE.JPEG && type !== FILE_TYPE.PNG) {
            this.commonService.downloadFile(base64File, fileName);
            return;
        }
        const file = base64File;
        this.commonService.downloadFile(file, fileName);
    }

    formatAttributes(): void {
        const dataElements = this.datosAutorizaciones?.transaccionRequest?.dataElements;

        if (!dataElements?.transactionAmount) {
            return;
        }

        const transactionAmount = Number(dataElements.transactionAmount) / 100;
        dataElements.transactionAmountFormatted = transactionAmount;
    }
}
