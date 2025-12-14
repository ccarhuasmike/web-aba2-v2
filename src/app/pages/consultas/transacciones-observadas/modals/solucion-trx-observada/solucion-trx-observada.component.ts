import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import moment from 'moment';

import { DatetzPipe } from '@/layout/Utils/pipes/datetz.pipe';
import { CommonService } from '@/pages/service/commonService';
import { TransaccionesObservadasService } from '@/pages/consultas/transacciones-observadas/transacciones-observadas.service';
import { ActualizacionSolucionComponent } from './actualizacion-solucion-trx-observada/actualizacion-solucion-trx-observada.component';
import { CALENDAR_DETAIL } from '@/layout/Utils/constants/aba.constants';

@Component({
    selector: 'app-solucion-trx-observada',
    templateUrl: './solucion-trx-observada.component.html',
    styleUrls: ['./solucion-trx-observada.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        AutoCompleteModule,
        ButtonModule,
   
        CommonModule,
        DividerModule,
        ReactiveFormsModule,
        TableModule,
        TagModule
    ],
    providers: [MessageService, DatePipe, DialogService, DatetzPipe]
})
export class SolucionTrxObservadaComponent implements OnInit {

    dataTrxObservada: any;
    token: any;
    uidCliente: any;
    uidCuenta: any;
    datosCuenta: any = {};
    tipoSoluciones: any[] = [];
    tipoRedes: any[] = [];
    filteredElementTipoSolucion: any[] = [];
    formSolucionTransaccion: FormGroup;

    es = CALENDAR_DETAIL;
    finiAutorizaciones = '';
    ffinAutorizaciones = '';
    datosAutorizaciones: any[] = [];
    selected: any;
    first = 0;
    rows = 15;

    constructor(
        public datepipe: DatePipe,
        private readonly dateTzPipe: DatetzPipe,
        private readonly dialogService: DialogService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly messageService: MessageService,
        private readonly commonService: CommonService,
        private readonly transaccionesObservadasService: TransaccionesObservadasService
    ) {
        this.dataTrxObservada = config.data?.datosTrxObservadas;
        this.token = this.dataTrxObservada?.data?.entrada?.MCD4TARE;

        this.formSolucionTransaccion = new FormGroup({
            tipoSolucion: new FormControl(null, [this.requireMatch, Validators.required]),
            autorizacion: new FormControl(null),
            fechaRangoAutorizaciones: new FormControl(null)
        });
    }

    ngOnInit(): void {
        this.getCombos();
    }

    getCombos(): void {
        this.commonService.getMultipleCombosPromise([
            'TIPO_SOLUCION_TRX_OBS'
        ]).then(resp => {
            this.tipoSoluciones = resp[0]['data'].filter((item: any) => item.valCadCorto !== '01' && item.valCadCorto !== '07');
        }).catch(() => { /* handled elsewhere */ });

        this.commonService.getTipoOrigenTransaccion().subscribe((resp: any) => {
            if (resp?.codigo === 0) {
                this.tipoRedes = resp.data.listaOrigenTransaccion.map((item: any) => ({
                    id: item['codigo'],
                    descripcion: item['descripcion']
                }));
            }
        });
    }

    filterElementTipoSolucion(event: any, data: any[]): void {
        this.filteredElementTipoSolucion = [];
        const query = event.query?.toLowerCase() ?? '';
        for (const element of data) {
            if (element.valCadLargo.toLowerCase().includes(query)) {
                this.filteredElementTipoSolucion.push(element);
            }
        }
    }

    openDialogActualizacionSolucion(): void {
        const formValue = this.formSolucionTransaccion.value;

        if (!formValue.tipoSolucion) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Valor requerido',
                detail: 'Debe seleccionar el tipo de solución'
            });
            return;
        }

        const dialogRef = this.dialogService.open(ActualizacionSolucionComponent, {
            header: `Detalle de Solución ${formValue.tipoSolucion.desElemento ?? ''}`,
            width: '60vw',
            data: {
                uidCliente: this.uidCliente,
                uidCuenta: this.uidCuenta,
                dataTrxObservada: this.dataTrxObservada,
                dataAutorizacion: formValue.autorizacion,
                tipoSolucion: formValue.tipoSolucion
            },
            styleClass: 'header-modal',
            breakpoints: {
                '960px': '80vw',
                '640px': '95vw'
            }
        });
        if (dialogRef) {
            dialogRef.onClose.subscribe((resp: any) => {
                if (resp?.data && resp.data['codigo'] === 0) {
                    this.dialogRef.close(resp);
                }
            });
        }

    }

    changeModelTipoSolucion(event: any): void {
        this.uidCliente = null;
        this.uidCuenta = null;
        this.datosCuenta = {};
        this.datosAutorizaciones = [];
        this.formSolucionTransaccion.get('autorizacion')?.patchValue(null);
        this.formSolucionTransaccion.get('autorizacion')?.clearValidators();

        const tipoSolucion = event?.valCadCorto;
        if (event && (tipoSolucion === '04' || tipoSolucion === '06')) {
            this.getCuentaPorTokenTarjeta(tipoSolucion);

            if (tipoSolucion === '06') {
                this.formSolucionTransaccion.get('autorizacion')?.setValidators(Validators.required);
            }
        }

        this.formSolucionTransaccion.get('autorizacion')?.updateValueAndValidity();
    }

    requireMatch(control: FormControl): ValidationErrors | null {
        const selection: any = control.value;
        if (selection && typeof selection === 'string') {
            return { requireMatch: true };
        }
        return null;
    }

    getCuentaPorTokenTarjeta(tipoSolucion: string): void {
        if (!this.token) {
            return;
        }

        this.transaccionesObservadasService.getCuentaPorTokenTarjeta(this.token)
            .subscribe(async (resp: any) => {
                if (resp['codigo'] === 0) {
                    this.datosCuenta = resp['data'];
                    await this.getCliente();
                    await this.getCuenta();

                    const fechaTransaccion = this.dataTrxObservada.data.entrada.MCTIFTRAConvert;
                    const [day, month, year] = fechaTransaccion.split('/').map(Number);
                    const fechaTransaccionConvert = new Date(year, month - 1, day);
                    this.finiAutorizaciones = this.datepipe.transform(fechaTransaccionConvert, 'yyyy-MM-dd') ?? '';
                    this.ffinAutorizaciones = this.datepipe.transform(fechaTransaccionConvert, 'yyyy-MM-dd') ?? '';
                    this.formSolucionTransaccion.get('fechaRangoAutorizaciones')?.patchValue([fechaTransaccionConvert, fechaTransaccionConvert]);

                    if (tipoSolucion === '06') {
                        await this.getAutorizaciones();
                    }
                } else if (resp['codigo'] === -1) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error getCuenta',
                        detail: resp['mensaje'] || 'Error obtener cuenta'
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

    getCliente(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.commonService.getCliente(this.datosCuenta.tipoDocIdent, this.datosCuenta.numeroDocIdent)
                .subscribe(
                    (resp: any) => {
                        if (resp['codigo'] === 0) {
                            this.uidCliente = resp['data'].uIdCliente;
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
                        resolve(true);
                    }, () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error getCliente',
                            detail: 'Error en el servicio de obtener datos del cliente'
                        });
                        reject();
                    }
                );
        });
    }

    getCuenta(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.commonService.getCuenta(this.uidCliente)
                .subscribe((resp: any) => {
                    if (resp['codigo'] === 0) {
                        const cuenta = resp['data'].content.find((row: any) => row.numeroCuenta === this.datosCuenta.numeroCuenta);

                        if (!cuenta) {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error getCuenta',
                                detail: 'La cuenta que se intenta buscar no existe'
                            });
                            resolve(true);
                        }

                        this.uidCuenta = cuenta?.uIdCuenta;
                    } else if (resp['codigo'] === -1) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error getCuenta',
                            detail: resp['mensaje']
                        });
                    } else if (resp['codigo'] === 1) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error getCuenta',
                            detail: 'La cuenta que se intenta buscar no existe'
                        });
                    }
                    resolve(true);
                }, () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error getCuenta',
                        detail: 'Error en el servicio de obtener datos de la cuenta'
                    });
                    reject();
                });
        });
    }

    changeModelFechaRangoAutorizaciones(event: any): void {
        if (!event || event.length < 2) {
            return;
        }

        this.finiAutorizaciones = '';
        this.ffinAutorizaciones = '';

        if (event[0] !== null && event[1] !== null) {
            this.finiAutorizaciones = moment(event[0]).format('YYYY-MM-DD');
            this.ffinAutorizaciones = moment(event[1]).format('YYYY-MM-DD');

            const ffinAutorizaciones = new Date(this.ffinAutorizaciones);
            ffinAutorizaciones.setMonth(ffinAutorizaciones.getMonth() - 2);
            const finiAutorizacionesAux = new Date(this.finiAutorizaciones);

            if (finiAutorizacionesAux < ffinAutorizaciones) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Validación de fechas',
                    detail: 'El intervalo máximo de búsqueda es de 2 meses'
                });
                return;
            }

            this.getAutorizaciones();
        }
    }

    getAutorizaciones(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.datosAutorizaciones = [];

            let ffin = new Date(this.ffinAutorizaciones);
            ffin.setDate(ffin.getDate() + 1);
            ffin.setMinutes(ffin.getMinutes() - 1);

            const uidCliente = this.uidCliente;
            const uidCuenta = this.uidCuenta;
            const fechaInicio = this.commonService.dateFormatISO8601(this.finiAutorizaciones);
            const fechaFin = ffin.toISOString();
            const tamanio = 999999000;
            const pagina = 0;

            this.transaccionesObservadasService.getCuentaAutorizaciones(
                uidCliente,
                uidCuenta,
                fechaInicio,
                fechaFin,
                pagina,
                tamanio
            ).subscribe((resp: any) => {
                if (resp['codigo'] === 0) {
                    this.datosAutorizaciones = resp['data'].content.map((dato: any) => {
                        dato['fechaTransaccion'] = this.dateTzPipe.transform(dato.fechaTransaccion, 'DD/MM/YYYY HH:mm:ss');
                        dato['fechaConfirmacion'] = this.datepipe.transform(dato.fechaConfirmacion, 'dd/MM/yyyy');

                        if (dato.transaccionRequest.dataElements) {
                            dato['referencia'] = (dato.transaccionRequest.dataElements.retrievalReferenceNumber) ? dato.transaccionRequest.dataElements.retrievalReferenceNumber : dato.uIdreferenciaExterna;
                        } else {
                            dato['referencia'] = dato.uIdreferenciaExterna;
                        }

                        if (dato.estadoAutorizacion === 'REJECTED') {
                            dato['codigoRechazo'] = dato.codigoEstadoOrigen ? dato.codigoEstadoOrigen : dato.codEstadoTransaccion;
                            dato.transaccionResponse['ftcCode'] = `${dato.transaccionRequest.messageType}${dato.transaccionRequest.operationCode}${dato.transaccionRequest.groupingCode}${dato.transaccionRequest.entryCode}`;
                        }

                        dato['estadoReversado'] = !dato.reversado ? 'NO' : 'SI';

                        const red = this.tipoRedes.find((x: any) => x.id === dato.descOrigen);
                        dato.descOrigenInt = red ? red.descripcion : '';

                        return dato;
                    }).filter((dato: any) =>
                        dato.estadoConfirmacion === 'PENDING' &&
                        dato.descOrigen === '02'
                    );

                } else if (resp['codigo'] === -1) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error getAutorizaciones',
                        detail: resp['mensaje'] || 'Error inesperado'
                    });
                }
                resolve(true);
            }, () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error getAutorizaciones',
                    detail: 'Error en el servicio de obtener autorizaciones de la cuenta'
                });
                reject();
            });
        });
    }

    onRowSelect(event: any): void {
        this.formSolucionTransaccion.get('autorizacion')?.patchValue(event.data);
    }

    onRowUnselect(): void {
        this.formSolucionTransaccion.get('autorizacion')?.patchValue(null);
    }
}
