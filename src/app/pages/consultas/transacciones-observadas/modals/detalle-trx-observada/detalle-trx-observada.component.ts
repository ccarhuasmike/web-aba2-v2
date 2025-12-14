import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { CommonService } from '@/pages/service/commonService';
import { TransaccionesObservadasService } from '@/pages/consultas/transacciones-observadas/transacciones-observadas.service';
import { MERGE_DOCUMENT_TYPES_ABA_PUC } from '@/layout/Utils/constants/aba.constants';

@Component({
    selector: 'app-detalle-trx-observada',
    templateUrl: './detalle-trx-observada.component.html',
    styleUrls: ['./detalle-trx-observada.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, ButtonModule, DividerModule, TagModule],
    providers: [MessageService]
})
export class DetalleTrxObservadaComponent implements OnInit {

    dataTrxObservada: any;
    token: any;

    datosCliente: any = {};
    datosCuenta: any = {};

    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly messageService: MessageService,
        private readonly commonService: CommonService,
        private readonly transaccionesObservadasService: TransaccionesObservadasService
    ) {
        this.dataTrxObservada = config.data?.dataTrxObservada;
        this.token = this.dataTrxObservada?.data?.entrada?.MCD4TARE;
    }

    ngOnInit(): void {
        if (this.token) {
            this.getCuentaPorTokenTarjeta();
        }
    }

    private getCuentaPorTokenTarjeta(): void {
        this.transaccionesObservadasService.getCuentaPorTokenTarjeta(this.token)
            .subscribe(async (resp:any) => {
                if (resp['codigo'] === 0) {
                    this.datosCuenta = resp['data'];
                    this.getDatosCliente();
                    this.getClientePuc();
                } else if (resp['codigo'] === -1) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error getCuenta',
                        detail: resp['mensaje'] || 'Error inesperado'
                    });
                }
            }, () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error getCuenta',
                    detail: 'Error en el servicio de obtener cuenta'
                });
            });
    }

    private getDatosCliente(): void {
        this.commonService.getCliente(this.datosCuenta.tipoDocIdent, this.datosCuenta.numeroDocIdent)
            .subscribe(
                (resp:any) => {
                    if (resp['codigo'] === 0) {
                        this.datosCliente['nombresApellidos'] = resp['data']['nombresApellidos'];
                        this.datosCliente['tipoDocu'] = resp['data']['desCodTipoDoc'];
                        this.datosCliente['numDocu'] = resp['data']['numDocIdentidad'];
                    } else if (resp['codigo'] === -1) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error getCliente',
                            detail: resp['mensaje']
                        });
                    } else if (resp['codigo'] === 1) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error getCliente',
                            detail: 'El cliente que se intenta buscar no existe'
                        });
                    }
                }, () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error getCliente',
                        detail: 'Error en el servicio de obtener datos del cliente'
                    });
                }
            );
    }

    private getClientePuc(): void {
        const tipoDocumento = this.datosCuenta.tipoDocIdent;
        const numeroDocumento = this.datosCuenta.numeroDocIdent;
        const elementTemp = MERGE_DOCUMENT_TYPES_ABA_PUC.find((e: any) => e.aba === tipoDocumento);
        const tipoDocumentoPuc = elementTemp?.puc;

        if (!tipoDocumentoPuc) {
            return;
        }

        this.commonService.getClientePorCuentaPuc(tipoDocumentoPuc, numeroDocumento).subscribe((res:any) => {
            if (res['codigo'] === 0) {
                this.datosCliente.correoElectronico = res['data'].correoElectronico;
                this.datosCliente.telefono = res['data'].telefono;
                this.datosCliente.direccion = res['data'].direccion;
            } else if (res['codigo'] === -1) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error getClientePuc',
                    detail: res['mensaje'] || 'Error inesperado'
                });
            }
        }, () => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error getClientePuc',
                detail: 'Error en el servicio de obtener datos del cliente'
            });
        });
    }
}
