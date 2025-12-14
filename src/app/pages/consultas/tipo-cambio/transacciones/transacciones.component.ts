import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import moment from 'moment';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem, MessageService } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DisableContentByRoleDirective } from '@/layout/Utils/directives/disable-content-by-role.directive';
import { CALENDAR_DETAIL, ROLES } from '@/layout/Utils/constants/aba.constants';
import { CommonService } from '@/pages/service/commonService';
import { ExcelService } from '@/pages/service/excel.service';
import { ParametroTipoCambioService } from '@/pages/mantenimiento/parametro/parametro-tipo-cambio/parametro-tipo-cambio.service';
import { TransaccionesService } from './transacciones.service';
import { RegularizarTransaccionComponent } from './modals/regularizar-transaccion.component';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    selector: 'app-trasacciones',
    templateUrl: './transacciones.component.html',
    styleUrls: ['./transacciones.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        AccordionModule,
        AutoCompleteModule,
        ButtonModule,
        DatePickerModule,
        CommonModule,
        DisableContentByRoleDirective,
        InputTextModule,
        MenuModule,
        ReactiveFormsModule,
        RippleModule,
        TableModule,
        TabsModule,
        ToastModule,
        TooltipModule
    ],
    providers: [MessageService, DialogService, DatePipe, CurrencyPipe]
})
export class TransaccionesComponent implements OnInit, OnDestroy {

    es = CALENDAR_DETAIL;
    panelOpenState: string[] = ['0'];
    formBusqueda!: FormGroup;
    nroCaracter = 0;

    loadingDatosTipoCambioTrx = false;
    loadingDatosTrxLogs = false;
    rows = 15;
    tiposOperacion: any[] = [{ codigo: 'V', descripcion: 'VENTA' }, { codigo: 'C', descripcion: 'COMPRA' }];
    filteredElement: any[] = [];

    cols: any[] = [
        { header: '', width: '50px' },
        { header: '', width: '40px' },
        { header: 'NRO. OPERACIÓN CAMBIO', width: '180px' },
        { header: 'NRO. OPERACIÓN PROVEEDOR', width: '190px' },
        { header: 'NRO. CUENTA ORIGEN', width: '170px' },
        { header: 'MONEDA ORIGEN', width: '130px' },
        { header: 'MONTO CARGADO PROVEEDOR ORIGEN', width: '250px' },
        { header: 'MONTO CARGADO FOH ORIGEN', width: '200px' },
        { header: 'NUM. OPERACIÓN CUENTA ORIGEN', width: '230px' },
        { header: 'NUM. CUENTA DESTINO', width: '150px' },
        { header: 'MONEDA DESTINO', width: '140px' },
        { header: 'MONTO ABONADO PROVEEDOR DESTINO', width: '250px' },
        { header: 'MONTO ABONADO FOH DESTINO', width: '200px' },
        { header: 'NUM. OPERACIÓN CUENTA DESTINO', width: '230px' },
        { header: 'SPREAD COMPRA OH', width: '140px' },
        { header: 'SPREAD VENTA OH', width: '130px' },
        { header: 'ESTADO', width: '250px' },
        { header: 'TIPO DOCUMENTO', width: '140px' },
        { header: 'NÚMERO DOCUMENTO', width: '160px' },
        { header: 'TIPO OPERACIÓN', width: '140px' },
        { header: 'FECHA CONFIRMACIÓN CLIENTE', width: '210px' },
        { header: 'FECHA EJECUCIÓN', width: '160px' },
        { header: 'FECHA LIQUIDACIÓN', width: '160px' },
        { header: 'TIPO CAMBIO FOH', width: '140px' },
        { header: 'TIPO CAMBIO PROVEEDOR', width: '170px' },
        { header: 'TIPO CAMBIO TRANSACCIÓN', width: '180px' },
        { header: 'TIPO CAMBIO OBSERVADO PROVEEDOR', width: '250px' },
        { header: 'ID CONSULTA PROVEEDOR', width: '170px' },
        { header: 'NUM. LOTE LIQUIDADO', width: '160px' },
        { header: 'CANAL', width: '100px' },
    ];

    colsLog: any[] = [
        { header: 'TIPO DOCUMENTO' },
        { header: 'NÚMERO DOCUMENTO' },
        { header: 'NUM. OPERACIÓN CAMBIO' },
        { header: 'ID. OPERACIÓN' },
        { header: 'NOMBRE OPERACIÓN EJECUTADA' },
        { header: 'NRO. OPERACIÓN CUENTA ORIGEN' },
        { header: 'NRO. OPERACIÓN CUENTA DESTINO' },
        { header: 'USUARIO REGISTRO' },
        { header: 'FECHA REGISTRO' }
    ];

    datosTipoCambioTrx: any[] = [];
    datosTrxLogs: any[] = [];

    tipoDocumentos: any[] = [];
    tipoMonedas: any[] = [];
    estadosTipoCambio: any[] = [];
    listadoCanales: any[] = [];
    filteredElementTipoDocumentos: any[] = [];

    heightTableTrx = '100px';

    roles: any = ROLES;
    private dialogRef?: DynamicDialogRef | null;

    constructor(
        private readonly dialogService: DialogService,
        private readonly datepipe: DatePipe,
        private readonly currencyPipe: CurrencyPipe,
        private readonly commonService: CommonService,
        private readonly excelService: ExcelService,
        private readonly transaccionesService: TransaccionesService,
        private readonly parametroTipoCambioService: ParametroTipoCambioService,
        private readonly messageService: MessageService
    ) {
        this.createForm();
    }
    
    menuAcciones: MenuItem[] = [];
    buildMenu(rowData: any) {
        const actions = [];

        if (rowData.codigoEstado === '01') {
            actions.push({
                label: 'Regularizar Trx',
                icon: 'pi pi-pencil',
                command: () => this.openDialogRegularizarTrx(rowData)
            });
        }

        this.menuAcciones = actions;
    }

    onNumDocumentoInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const soloNumeros = input.value.replace(/[^0-9]/g, '');

  this.formBusqueda.get('numDocumento')?.setValue(soloNumeros, {
    emitEvent: false
  });
}

    ngOnInit(): void {
        this.getCombos();
        this.getEstadosTipoCambio();
        this.getCanales();
    }

    ngOnDestroy(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

    createForm(): void {
        this.formBusqueda = new FormGroup({
            fechaRangoTrx: new FormControl([]),
            tipoDocumento: new FormControl(''),
            numDocumento: new FormControl(''),
            numCuentaOrigen: new FormControl(''),
            numCuentaDestino: new FormControl(''),
            tipoOperacion: new FormControl(''),
            numOperacion: new FormControl(''),
            numOperacionProveedor: new FormControl(''),
            estadoTipoCambio: new FormControl('')
        });
    }

    clearBusquedaFiltros(): void {
        this.nroCaracter = 0;
        this.createForm();
    }

    onPaginado(event: any): void {
        const records = this.datosTipoCambioTrx.slice(event.first, event.first + this.rows);

        if (records.length > 1) {
            const height = records.length * 30;
            this.heightTableTrx = `${height}px`;
        } else {
            this.heightTableTrx = '100px';
        }
    }

    getCombos(): void {
        this.commonService.getMultipleCombosPromise([
            'TIPO_DOCUMENTO',
            'TIPO_MONEDA_TRAMA'
        ]).then(resp => {
            this.tipoDocumentos = resp[0]['data'].map((item: any) => {
                return {
                    id: item['valNumEntero'],
                    descripcion: item['valCadCorto']
                };
            });

            this.tipoMonedas = resp[1]['data'].map((item: any) => {
                return {
                    id: item['valNumEntero'],
                    descripcion: item['valCadLargo']
                };
            });
        });
    }

    getEstadosTipoCambio(): void {
        this.commonService.getEstadosTipoCambio().subscribe({
            next: (data: any) => {
                this.estadosTipoCambio = data.data;
            },
            error: () => {
                this.showMessage('error', 'Error en getEstadosTipoCambio', 'Error no controlado');
            }
        });
    }

    getCanales(): void {
        this.parametroTipoCambioService.getGrupoParametrosNomTabla('VARIACION_TIPO_CAMBIO').subscribe({
            next: (data: any) => {
                this.listadoCanales = data.data;
            },
            error: () => {
                this.showMessage('error', 'Error en getCanales', 'Error no controlado');
            }
        });
    }

    getTransactions(): void {
        this.datosTipoCambioTrx = [];
        this.datosTrxLogs = [];
        this.loadingDatosTipoCambioTrx = true;

        const formValue = this.formBusqueda.value;
        const rangoFechas = Array.isArray(formValue.fechaRangoTrx) ? formValue.fechaRangoTrx : [];
        const cuentaDestino = formValue.numCuentaDestino;
        const cuentaOrigen = formValue.numCuentaOrigen;
        const idOperacionPartner = formValue.numOperacionProveedor;
        const nroCambioMonedaOperacion = formValue.numOperacion;
        const tipoOperacionOh = formValue.tipoOperacion ? formValue.tipoOperacion.codigo : '';
        const tipoDoc = formValue.tipoDocumento ? formValue.tipoDocumento.id : '';
        const numDoc = formValue.numDocumento;
        const idCambioMonedaEstado = formValue.estadoTipoCambio ? formValue.estadoTipoCambio.idCambioMonedaEstado : '';

        let fechaEjecucionDesde = '';
        let fechaEjecucionHasta = '';

        if (rangoFechas[0] || rangoFechas[1] || nroCambioMonedaOperacion) {
            if (rangoFechas[0] && !rangoFechas[1]) {
                this.loadingDatosTipoCambioTrx = false;
                this.showMessage('warn', '', 'Es necesario ingresar un Intervalo de fechas válido');
                return;
            }
            if (rangoFechas[0] && rangoFechas[1]) {
                fechaEjecucionDesde = moment(rangoFechas[0]).format('YYYY-MM-DD');
                fechaEjecucionHasta = moment(rangoFechas[1]).format('YYYY-MM-DD');
            }
        } else {
            this.loadingDatosTipoCambioTrx = false;
            this.showMessage('warn', '', 'Es necesario ingresar un rango de fechas o el Núm. de operación');
            return;
        }

        this.transaccionesService.getReporteTransacciones(
            fechaEjecucionDesde,
            fechaEjecucionHasta,
            cuentaDestino,
            cuentaOrigen,
            idOperacionPartner,
            nroCambioMonedaOperacion,
            tipoOperacionOh,
            tipoDoc,
            numDoc,
            idCambioMonedaEstado
        ).subscribe({
            next: (resp: any) => {
                this.loadingDatosTipoCambioTrx = false;

                if (resp['codigo'] === 0) {
                    this.datosTipoCambioTrx = (resp.data || []).map((item: any) => {
                        const tipoDocumentoIdentidad = this.tipoDocumentos.find((e: any) => e.id == item.tipoDocIdentidad);
                        const tipoMonedaOrigen = this.tipoMonedas.find((e: any) => e.id == item.monedaOrigen);
                        const tipoMonedaDestino = this.tipoMonedas.find((e: any) => e.id == item.monedaDestino);
                        const estadoTipoCambio = this.estadosTipoCambio.find((e: any) => e.idCambioMonedaEstado == item.idCambioMonedaEstado);
                        const canal = this.listadoCanales.find((e: any) => e.desElemento === 'CANALES' && e.valNumEntero == item.canal);

                        return {
                            ...item,
                            descMonedaOrigen: tipoMonedaOrigen ? tipoMonedaOrigen['descripcion'] : '',
                            descMonedaDestino: tipoMonedaDestino ? tipoMonedaDestino['descripcion'] : '',
                            descTipoDocumentoIdentidad: tipoDocumentoIdentidad ? tipoDocumentoIdentidad['descripcion'] : '',
                            descEstadoTipoCambio: estadoTipoCambio ? estadoTipoCambio['descripcionCorta'] : '',
                            codigoEstado: estadoTipoCambio ? estadoTipoCambio['codigoEstado'] : '',
                            tipoEstado: estadoTipoCambio ? estadoTipoCambio['tipoEstado'] : '',
                            descCanal: canal ? canal['valCadCorto'] : ''
                        };
                    });

                    this.onPaginado({ first: 0, rows: this.rows });
                } else {
                    this.showMessage('error', 'Error getTransactions', resp['mensaje']);
                }
            },
            error: () => {
                this.loadingDatosTipoCambioTrx = false;
                this.showMessage('error', 'Error getTransactions', 'Error en el servicio de obtener transacciones');
            }
        });
    }

    getLogTransactions(event: any): void {
        this.loadingDatosTrxLogs = true;
        const nroCambioMonedaOperacion = event.data.nroCambioMonedaOperacion;

        this.transaccionesService.getReporteLogTransacciones(
            nroCambioMonedaOperacion
        ).subscribe({
            next: (data: any) => {
                this.loadingDatosTrxLogs = false;
                this.datosTrxLogs = (data.data || []).map((item: any) => {
                    const tipoDocumentoIdentidad = this.tipoDocumentos.find((e: any) => e.id == item.tipoDocIdentidad);
                    return {
                        ...item,
                        descTipoDocumentoIdentidad: tipoDocumentoIdentidad ? tipoDocumentoIdentidad['descripcion'] : ''
                    };
                });
            },
            error: () => {
                this.loadingDatosTrxLogs = false;
                this.showMessage('error', 'Error getTransactions', 'Error en el servicio de obtener transacciones');
            }
        });
    }

    changeModelTipoDocumento(event: any): void {
        if (event) {
            if (event.id == 1) {
                this.nroCaracter = 8;
                this.formBusqueda.get('numDocumento')?.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required]);
            } else if (event.id == 2) {
                this.nroCaracter = 9;
                this.formBusqueda.get('numDocumento')?.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required]);
            } else {
                this.nroCaracter = 0;
                this.formBusqueda.get('numDocumento')?.clearValidators();
            }
        } else {
            this.nroCaracter = 0;
            this.formBusqueda.get('numDocumento')?.clearValidators();
        }

        this.formBusqueda.get('numDocumento')?.updateValueAndValidity();
    }

    filterElementTipoDocumento(event: any, data: any): void {
        this.filteredElementTipoDocumentos = [];
        const query = event.query;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.descripcion.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                this.filteredElementTipoDocumentos.push(element);
            }
        }
    }

    openDialogRegularizarTrx(datosTrx: any): void {
        this.dialogRef = this.dialogService.open(RegularizarTransaccionComponent, {
            header: 'Regularizar Transacción',
            width: '60vw',
            data: {
                datosTrx,
                estadosTipoCambio: this.estadosTipoCambio
            },
            breakpoints: {
                '960px': '80vw',
                '640px': '95vw'
            }
        });

        if (this.dialogRef) {
            this.dialogRef.onClose.subscribe((resp: any) => {
                if (resp && resp.data && resp.data['codigo'] === 0) {
                    this.showMessage('success', '', 'Regularización registrada');
                    this.getTransactions();
                } else if (resp && resp.data && resp.data['codigo'] !== 0) {
                    this.showMessage('error', 'Error openDialogRegularizarTrx', 'Error en el servicio de regularización de transacción');
                }
            });
        }
    }

    exportExcel(): void {
        const date = new Date();
        const excelName = 'Reporte transacciones tipo cambio ' + moment(date).format('DD/MM/YYYY') + '.xlsx';
        const sheetName = 'Datos';
        const datos: any[] = [];
        const header: string[] = [];
        const isCurrency: any[] = [];
        const filterLavel = 'Fecha de Reporte';

        this.cols.forEach((element: any, index: number) => {
            if (index > 1) {
                header.push(element.header);
            }
        });

        this.datosTipoCambioTrx.forEach(x => {
            const list: any[] = [];

            const importeOrigenPartner = x.importeOrigenPartner || 0;
            const importeOrigenPartnerFormat = this.currencyPipe.transform(importeOrigenPartner, ' ', 'symbol', '1.2-2');

            const importeOrigenOh = x.importeOrigenOh || 0;
            const importeOrigenOhFormat = this.currencyPipe.transform(importeOrigenOh, ' ', 'symbol', '1.2-2');

            const importeDestinoPartner = x.importeDestinoPartner || 0;
            const importeDestinoPartnerFormat = this.currencyPipe.transform(importeDestinoPartner, ' ', 'symbol', '1.2-2');

            const importeDestinoOh = x.importeDestinoOh || 0;
            const importeDestinoOhFormat = this.currencyPipe.transform(importeDestinoOh, ' ', 'symbol', '1.2-2');

            const spreadCompraOh = x.spreadCompraOh || 0;
            const spreadCompraOhFormat = this.currencyPipe.transform(spreadCompraOh, ' ', 'symbol', '1.2-2');

            const spreadVentaOh = x.spreadVentaOh || 0;
            const spreadVentaOhFormat = this.currencyPipe.transform(spreadVentaOh, ' ', 'symbol', '1.2-2');

            const tipoCambioOh = x.tipoCambioOh || 0;
            const tipoCambioOhFormat = this.currencyPipe.transform(tipoCambioOh, ' ', 'symbol', '1.4-4');

            const tipoCambioPartner = x.tipoCambioPartner || 0;
            const tipoCambioPartnerFormat = this.currencyPipe.transform(tipoCambioPartner, ' ', 'symbol', '1.4-4');

            const tipoCambioTransaccion = x.tipoCambioTransaccion || 0;
            const tipoCambioTransaccionFormat = this.currencyPipe.transform(tipoCambioTransaccion, ' ', 'symbol', '1.4-4');

            const tipoCambioObservadoPartner = x.tipoCambioObservadoPartner || 0;
            const tipoCambioObservadoPartnerFormat = this.currencyPipe.transform(tipoCambioObservadoPartner, ' ', 'symbol', '1.4-4');

            list.push(x.nroCambioMonedaOperacion);
            list.push(x.idOperacionPartner);
            list.push(x.cuentaOrigen);
            list.push(x.descMonedaOrigen);
            list.push(importeOrigenPartnerFormat);
            list.push(importeOrigenOhFormat);
            list.push(x.nroOperacionCuentaOrigen);
            list.push(x.cuentaDestino);
            list.push(x.descMonedaDestino);
            list.push(importeDestinoPartnerFormat);
            list.push(importeDestinoOhFormat);
            list.push(x.nroOperacionCuentaDestino);
            list.push(spreadCompraOhFormat);
            list.push(spreadVentaOhFormat);
            list.push(x.descEstadoTipoCambio);
            list.push(x.descTipoDocumentoIdentidad);
            list.push(x.numeroDocIdentidad);
            list.push(x.tipoOperacionOh);
            list.push(this.datepipe.transform(x.fechaHoraConfirmacionUsuario, 'dd/MM/yyyy HH:mm:ss'));
            list.push(this.datepipe.transform(x.fechaHoraEjecucionOperacion, 'dd/MM/yyyy HH:mm:ss'));
            list.push(this.datepipe.transform(x.fechaHoraLiquidacion, 'dd/MM/yyyy HH:mm:ss'));
            list.push(tipoCambioOhFormat);
            list.push(tipoCambioPartnerFormat);
            list.push(tipoCambioTransaccionFormat);
            list.push(tipoCambioObservadoPartnerFormat);
            list.push(x.idConsultaPartner);
            list.push(x.nroLoteLiquidado);
            list.push(x.descCanal);

            datos.push(list);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
    }

    filterElement(event: any, data: any): void {
        this.filteredElement = [];
        const query = event.query;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.descripcion.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                this.filteredElement.push(element);
            }
        }
    }

    filterElementEstadoTipoCambio(event: any, data: any): void {
        this.filteredElement = [];
        const query = event.query;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.descripcionCorta.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                this.filteredElement.push(element);
            }
        }
    }

    private showMessage(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail });
    }
}
