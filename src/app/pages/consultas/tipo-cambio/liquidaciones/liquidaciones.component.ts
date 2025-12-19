import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenuItem, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import moment from 'moment';
import { CALENDAR_DETAIL } from '@/layout/Utils/constants/aba.constants';
import { CommonService } from '@/pages/service/commonService';
import { ExcelService } from '@/pages/service/excel.service';
import { BancoService } from '@/pages/mantenimiento/banco/banco.service';
import { LiquidacionesService } from './liquidaciones.service';
import { PagoLiquidacionComponent } from './modals/pago-liquidacion/pago-liquidacion.component';
import { RegularizarLiquidacionComponent } from './modals/regularizar-liquidacion/regularizar-liquidacion.component';
import { AsientosContableComponent } from './modals/asientos-contable/asientos-contable.component';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    selector: 'app-liquidaciones',
    templateUrl: './liquidaciones.component.html',
    styleUrls: ['./liquidaciones.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        AccordionModule,
        ButtonModule,
        DatePickerModule,
        CommonModule,
        InputTextModule,
        MenuModule,
        ReactiveFormsModule,
        TableModule,
        ToastModule,
        TooltipModule
    ],
    providers: [MessageService, DialogService, DatePipe, CurrencyPipe]
})
export class LiquidacionesComponent implements OnInit {

    @ViewChild('dtDetalle') tableDetalle!: Table;

    es = CALENDAR_DETAIL;
    panelOpenState: string[] = ['0'];
    formBusqueda!: FormGroup;
    nroCaracter = 0;
    heightTableResumen = '100px';
    heightTableDetalle = '100px';

    rows = 15;

    loadingDatosLiquidaciones = false;
    loadingDatosLiquidacionDetalle = false;

    cols: any[] = [
        { header: '', width: '60px' },
        { header: 'FECHA LIQUIDACIÓN', width: '150px' },
        { header: 'ID SOLICITUD', width: '120px' },
        { header: 'NRO. LOTE', width: '110px' },
        { header: 'FECHA ENVÍO AL PROVEEDOR', width: '210px' },
        { header: 'FECHA RESPUESTA DEL PROVEEDOR', width: '220px' },
        { header: 'FECHA ENVÍO DE PAGO', width: '170px' },
        { header: 'FECHA CONFIRMACIÓN DE PAGO', width: '210px' },
        { header: 'BANCO', width: '150px' },
        { header: 'CUENTA CORRIENTE', width: '160px' },
        { header: 'SUMA MONTO COMPRA DÓLARES', width: '220px' },
        { header: 'SUMA MONTO VENTA DÓLARES', width: '220px' },
        { header: 'SUMA MONTO SOLES POR VENTA DÓLARES', width: '270px' },
        { header: 'SUMA MONTO SOLES POR COMPRA DÓLARES', width: '280px' },
        { header: 'SUMA MONTO ENVÍO DÓLARES PROVEEDOR (COMPRA)', width: '340px' },
        { header: 'SUMA MONTO RECIBIR DÓLARES PROVEEDOR (VENTA)', width: '340px' },
        { header: 'SUMA MONTO ENVÍO SOLES PROVEEDOR (VENTA)', width: '310px' },
        { header: 'SUMA MONTO RECIBIR SOLES PROVEEDOR (COMPRA)', width: '330px' },
        { header: 'SUMA SPREAD COMPRA FOH', width: '200px' },
        { header: 'SUMA SPREAD VENTA FOH', width: '200px' },
        { header: 'MONEDA RECIBIR PROVEEDOR', width: '200px' },
        { header: 'MONTO NETO RECIBIR PROVEEDOR', width: '220px' },
        { header: 'MONEDA ENVIAR PROVEEDOR', width: '200px' },
        { header: 'MONTO NETO ENVIAR PROVEEDOR', width: '220px' },
        { header: 'ESTADO LIQUIDACIÓN', width: '170px' }
    ];

    colsDetalle: any[] = [
        { header: '', width: '60px' },
        { header: 'NRO. OPERACIÓN CLIENTE', width: '200px' },
        { header: 'NRO. OPERACIÓN PROVEEDOR', width: '250px' },
        { header: 'NRO. CUENTA ORIGEN', width: '200px' },
        { header: 'MONEDA ORIGEN', width: '150px' },
        { header: 'MONTO CARGADO PROVEEDOR ORIGEN', width: '250px' },
        { header: 'MONTO CARGADO FOH ORIGEN', width: '225px' },
        { header: 'NRO. OPERACIÓN CUENTA ORIGEN', width: '250px' },
        { header: 'NRO. CUENTA DESTINO', width: '200px' },
        { header: 'MONEDA DESTINO', width: '150px' },
        { header: 'MONTO ABONADO PROVEEDOR DESTINO', width: '250px' },
        { header: 'MONTO ABONADO FOH DESTINO', width: '250px' },
        { header: 'NRO. OPERACIÓN CUENTA DESTINO', width: '250px' },
        { header: 'SPREAD COMPRA FOH', width: '150px' },
        { header: 'SPREAD VENTA FOH', width: '150px' },
        { header: 'ESTADO TRANSACCIÓN', width: '250px' },
        { header: 'TIPO DOCUMENTO', width: '150px' },
        { header: 'NRO. DOCUMENTO', width: '150px' },
        { header: 'TIPO OPERACIÓN', width: '150px' },
        { header: 'FECHA CONFIRMACIÓN CLIENTE', width: '250px' },
        { header: 'FECHA EJECUCIÓN', width: '200px' },
        { header: 'FECHA LIQUIDACIÓN', width: '200px' },
        { header: 'TIPO CAMBIO FOH', width: '150px' },
        { header: 'TIPO CAMBIO PROVEEDOR', width: '200px' },
        { header: 'TIPO CAMBIO TRANSACCIÓN', width: '200px' },
        { header: 'TIPO CAMBIO OBSERVADO PROVEEDOR', width: '250px' },
        { header: 'ID CONSULTA PROVEEDOR', width: '200px' },
        { header: 'NRO. LOTE LIQUIDADO', width: '150px' }
    ];

    datosLiquidaciones: any[] = [];
    datosLiquidacionDetalle: any[] = [];
    datoLiquidado: any;

    tipoDocumentos: any[] = [];
    tipoMonedas: any[] = [];
    estadosTipoCambio: any[] = [];
    bancos: any[] = [];

    private dialogRef?: DynamicDialogRef | null;

    constructor(
        private readonly dialogService: DialogService,
        private readonly datepipe: DatePipe,
        private readonly currencyPipe: CurrencyPipe,
        private readonly commonService: CommonService,
        private readonly excelService: ExcelService,
        private readonly liquidacionesService: LiquidacionesService,
        private readonly bancoService: BancoService,
        private readonly messageService: MessageService
    ) {
        this.createForm();
    }

    ngOnInit(): void {
        this.getCombos();
        this.getEstadosTipoCambio();
        this.getBancos();
    }

    createForm(): void {
        this.formBusqueda = new FormGroup({
            fechaRangoLiquidacion: new FormControl([]),
            numLote: new FormControl('')
        });
    }

    clearBusquedaFiltros(): void {
        this.createForm();
        this.datosLiquidaciones = [];
        this.datosLiquidacionDetalle = [];
        this.datoLiquidado = null;
    }

    onPaginadoResumen(event: any): void {
        const records = this.datosLiquidaciones.slice(event.first, event.first + this.rows);

        if (records.length > 1) {
            const height = records.length * 28;
            this.heightTableResumen = `${height}px`;
        } else {
            this.heightTableResumen = '100px';
        }
    }

    onPaginadoDetalle(event: any): void {
        const records = this.datosLiquidacionDetalle.slice(event.first, event.first + this.rows);

        if (records.length > 1) {
            const height = records.length * 32;
            this.heightTableDetalle = `${height}px`;
        } else {
            this.heightTableDetalle = '100px';
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

    getBancos(): void {
        this.bancoService.getObtenerBancos().subscribe({
            next: (resp: any) => {
                this.bancos = resp['data'] || [];
            },
            error: () => {
                this.showMessage('error', 'Error en getEstadosTipoCambio', 'Error no controlado');
            }
        });
    }

    getLiquidaciones(): void {
        this.datosLiquidaciones = [];
        this.datosLiquidacionDetalle = [];
        this.loadingDatosLiquidaciones = true;

        const formValue = this.formBusqueda.value;

        const rangoFechas = Array.isArray(formValue.fechaRangoLiquidacion) ? formValue.fechaRangoLiquidacion : [];
        let fechaLiquidacionDesde = '';
        let fechaLiquidacionHasta = '';
        const numLote = formValue.numLote;

        if (rangoFechas[0] || rangoFechas[1] || numLote) {
            if (rangoFechas[0] && !rangoFechas[1]) {
                this.loadingDatosLiquidaciones = false;
                this.showMessage('warn', '', 'Es necesario ingresar un Intervalo de fechas válido');
                return;
            }
            if (rangoFechas[0] && rangoFechas[1]) {
                fechaLiquidacionDesde = moment(rangoFechas[0]).format('YYYY-MM-DD');
                fechaLiquidacionHasta = moment(rangoFechas[1]).format('YYYY-MM-DD');
            }
        } else {
            this.loadingDatosLiquidaciones = false;
            this.showMessage('warn', '', 'Es necesario ingresar un rango de fechas o el Núm. de Lote');
            return;
        }

        this.liquidacionesService.getResumenLiquidacion(
            fechaLiquidacionDesde,
            fechaLiquidacionHasta,
            numLote
        ).subscribe({
            next: (resp: any) => {
                this.loadingDatosLiquidaciones = false;

                if (resp['codigo'] === 0) {
                    this.datosLiquidaciones = (resp.data || []).map((item: any) => {
                        const monedaEnvioPartner = this.tipoMonedas.find((e: any) => e.id == item.monedaEnviarPartner);
                        const monedaRecibirPartner = this.tipoMonedas.find((e: any) => e.id == item.monedaRecibirPartner);
                        const estadoTipoCambio = this.estadosTipoCambio.find((e: any) => e.idCambioMonedaEstado == item.idCambioMonedaEstado);
                        const banco = this.bancos.find((e: any) => e.idBanco == item.idPartnerBanco);

                        return {
                            ...item,
                            descBanco: banco ? banco['nombre'] : '',
                            descripcionMonedaEnvioPartner: monedaEnvioPartner ? monedaEnvioPartner['descripcion'] : '',
                            descripcionMonedaRecibirPartner: monedaRecibirPartner ? monedaRecibirPartner['descripcion'] : '',
                            descEstadoTipoCambio: estadoTipoCambio ? estadoTipoCambio['descripcionCorta'] : '',
                            codigoEstado: estadoTipoCambio ? estadoTipoCambio['codigoEstado'] : '',
                            tipoEstado: estadoTipoCambio ? estadoTipoCambio['tipoEstado'] : ''
                        };
                    });

                    this.onPaginadoResumen({ first: 0, rows: this.rows });
                } else {
                    this.showMessage('error', 'Error getLiquidaciones', resp['mensaje']);
                }
            },
            error: () => {
                this.loadingDatosLiquidaciones = false;
                this.showMessage('error', 'Error getLiquidaciones', 'Error en el servicio de obtención de liquidaciones');
            }
        });
    }

    getLiquidacionDetalle(data: any): void {
        if (!data) {
            return;
        }

        if (this.tableDetalle) {
            this.tableDetalle.clear();
        }

        this.loadingDatosLiquidacionDetalle = true;
        this.datoLiquidado = data;

        const formValue = this.formBusqueda.value;
        const rangoFechas = Array.isArray(formValue.fechaRangoLiquidacion) ? formValue.fechaRangoLiquidacion : [];

        let fechaLiquidacionDesde = '';
        let fechaLiquidacionHasta = '';
        const numLote = data.nroLoteLiquidado;

        if (rangoFechas[1]) {
            fechaLiquidacionDesde = moment(rangoFechas[0]).format('YYYY-MM-DD');
            fechaLiquidacionHasta = moment(rangoFechas[1]).format('YYYY-MM-DD');
        } else if (rangoFechas[0]) {
            this.loadingDatosLiquidacionDetalle = false;
            this.showMessage('warn', '', 'Intervalo de fechas inválido');
            return;
        }

        this.liquidacionesService.getDetalleLiquidacion(
            fechaLiquidacionDesde,
            fechaLiquidacionHasta,
            numLote
        ).subscribe({
            next: (resp: any) => {
                this.loadingDatosLiquidacionDetalle = false;

                if (resp['codigo'] === 0) {
                    this.datosLiquidacionDetalle = (resp.data || []).map((item: any) => {
                        const tipoDocumentoIdentidad = this.tipoDocumentos.find((e: any) => e.id == item.tipoDocIdentidad);
                        const monedaOrigen = this.tipoMonedas.find((e: any) => e.id == item.monedaOrigen);
                        const monedaDestino = this.tipoMonedas.find((e: any) => e.id == item.monedaDestino);
                        const estadoTipoCambio = this.estadosTipoCambio.find((e: any) => e.idCambioMonedaEstado == item.idCambioMonedaEstado);

                        return {
                            ...item,
                            descripcionMonedaOrigen: monedaOrigen ? monedaOrigen['descripcion'] : '',
                            descripcionMonedaDestino: monedaDestino ? monedaDestino['descripcion'] : '',
                            tipoDocIdentidadDescripcion: tipoDocumentoIdentidad ? tipoDocumentoIdentidad['descripcion'] : '',
                            descEstadoTipoCambio: estadoTipoCambio ? estadoTipoCambio['descripcionCorta'] : ''
                        };
                    });

                    this.onPaginadoDetalle({ first: 0, rows: this.rows });
                } else {
                    this.showMessage('error', 'Error getLiquidacionDetalle', resp['mensaje']);
                }
            },
            error: () => {
                this.loadingDatosLiquidacionDetalle = false;
                this.showMessage('error', 'Error getLiquidacionDetalle', 'Error en el servicio de obtener Liquidación Detalle');
            }
        });
    }



    // getResumenActions(rowData: any): MenuItem[] {
    //     return [
    //         {
    //             label: 'Pagar',
    //             icon: 'pi pi-credit-card',
    //             disabled: !(rowData.tipoEstado == 2 && (rowData.codigoEstado === '01' || rowData.codigoEstado === '03')),
    //             command: () => this.openDialogPagoLiquidacion(rowData)
    //         },
    //         {
    //             label: 'Asientos contables',
    //             icon: 'pi pi-book',
    //             command: () => this.openDialogAsientosContables(rowData)
    //         }
    //     ];
    // }


    menuItems: any[] = [];
    onButtonClick(event: Event, rowData: any, menu: any) {
        this.menuItems = this.getMenuItems(rowData);
        menu.toggle(event);
    }


    getMenuItems(rowData: any, menu?: any): MenuItem[] {
        return [
            this.createMenuItem(
                'Pagar',
                'pi pi-credit-card',
                () => this.openDialogPagoLiquidacion(rowData),
                !(rowData.tipoEstado == 2 && (rowData.codigoEstado === '01' || rowData.codigoEstado === '03')),//disabled
                menu
            ),
            this.createMenuItem(
                'Asientos contables',
                'pi pi-book',
                () => this.openDialogAsientosContables(rowData),
                menu
            )
        ];
    }

    private createMenuItem(
        label: string,
        icon: string,
        action: () => void,
        disabled?: boolean,
        menu?: any
    ): MenuItem {
        return {
            label,
            icon,
            ...(disabled !== undefined && { disabled }),
            command: () => this.executeMenuAction(action, menu)
        };
    }


    private executeMenuAction(action: () => void, menu?: any): void {
        setTimeout(() => {
            action();
            menu?.hide();
        }, 5);
    }


    menuItemsDetalle: any[] = [];
    onButtonDetalleClick(event: Event, rowData: any, menu: any) {
        this.menuItemsDetalle = this.getMenuItemsDetalle(rowData);
        menu.toggle(event);
    }

    getMenuItemsDetalle(rowData: any, menu?: any): MenuItem[] {
        return [
            this.createMenuItem(
                'Regularizar detalle',
                'pi pi-pencil',
                () => this.openDialogRegularizarLiquidacion(rowData),
                menu
            )
        ];
    }
    openDialogPagoLiquidacion(data: any): void {
        this.dialogRef = this.dialogService.open(PagoLiquidacionComponent, {
            header: 'Pagar Liquidación',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: data
        });

        if (this.dialogRef) {
            this.dialogRef.onClose.subscribe((resp: any) => {
                if (resp?.data && resp.accion === 'create') {
                    if (resp.data['codigo'] === 0) {
                        this.showMessage('success', 'Pago proveedor', 'El pago fue exitoso');
                        this.getLiquidaciones();
                    } else {
                        this.showMessage('error', 'Error openDialogPagoLiquidacion', 'Error en el servicio de pago de liquidación');
                    }
                }
            });
        }
    }

    openDialogRegularizarLiquidacion(data: any): void {
        this.dialogRef = this.dialogService.open(RegularizarLiquidacionComponent, {
            header: 'Regularizar Liquidación',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: data
        });

        if (this.dialogRef) {
            this.dialogRef.onClose.subscribe((resp: any) => {
                if (resp?.data) {
                    if (resp.data['codigo'] === 0) {
                        this.showMessage('success', '', 'Regularización registrada');
                        this.getLiquidacionDetalle(this.datoLiquidado);
                    } else {
                        this.showMessage('error', 'Error openDialogRegularizarLiquidacion', 'Error en el servicio de regularización de liquidación');
                    }
                }
            });
        }
    }

    openDialogAsientosContables(data: any): void {
        this.dialogRef = this.dialogService.open(AsientosContableComponent, {
            header: 'Asientos Contables',
            width: '60vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: data
        });
    }

    exportExcel(): void {
        const date = new Date();
        const excelName = 'Reporte liquidaciones tipo cambio ' + moment(date).format('DD/MM/YYYY') + '.xlsx';
        const sheetName = 'Datos';
        const datos: any[] = [];
        const header: string[] = [];
        const isCurrency: any[] = [];
        const filterLavel = 'Fecha de Reporte';

        this.cols.forEach((element: any, index: number) => {
            if (index > 0) {
                header.push(element.header);
            }
        });

        this.datosLiquidaciones.forEach(x => {
            const totalDolaresTcCompraOhFormat = this.currencyPipe.transform(x.totalDolaresTcCompraOh || 0, ' ', 'symbol', '1.2-2');
            const totalDolaresTcVentaOhhFormat = this.currencyPipe.transform(x.totalDolaresTcVentaOh || 0, ' ', 'symbol', '1.2-2');
            const totalSolesTcVentaOhFormat = this.currencyPipe.transform(x.totalSolesTcVentaOh || 0, ' ', 'symbol', '1.2-2');
            const totalSolesTcCompraOhFormat = this.currencyPipe.transform(x.totalSolesTcCompraOh || 0, ' ', 'symbol', '1.2-2');
            const totalDolaresTcCompraPartnerFormat = this.currencyPipe.transform(x.totalDolaresTcCompraPartner || 0, ' ', 'symbol', '1.2-2');
            const totalDolaresTcVentaPartnerFormat = this.currencyPipe.transform(x.totalDolaresTcVentaPartner || 0, ' ', 'symbol', '1.2-2');
            const totalSolesTcVentaPartnerFormat = this.currencyPipe.transform(x.totalSolesTcVentaPartner || 0, ' ', 'symbol', '1.2-2');
            const totalSolesTcCompraPartnerFormat = this.currencyPipe.transform(x.totalSolesTcCompraPartner || 0, ' ', 'symbol', '1.2-2');
            const totalSpreadCompraOhFormat = this.currencyPipe.transform(x.totalSpreadCompraOh || 0, ' ', 'symbol', '1.2-2');
            const totalSpreadVentaOhFormat = this.currencyPipe.transform(x.totalSpreadVentaOh || 0, ' ', 'symbol', '1.2-2');
            const netoRecibirPartnerFormat = this.currencyPipe.transform(x.netoRecibirPartner || 0, ' ', 'symbol', '1.2-2');
            const netoEnviarPartnerFormat = this.currencyPipe.transform(x.netoEnviarPartner || 0, ' ', 'symbol', '1.2-2');

            datos.push([
                this.datepipe.transform(x.fechaHoraLiquidacion, 'dd/MM/yyyy HH:mm:ss'),
                x.idCambioMonedaLiqDiariaRes,
                x.nroLoteLiquidado,
                this.datepipe.transform(x.fechaHoraEnvioPartner, 'dd/MM/yyyy HH:mm:ss'),
                this.datepipe.transform(x.fechaHoraRespuestaPartner, 'dd/MM/yyyy HH:mm:ss'),
                this.datepipe.transform(x.fechaHoraEnvioPagar, 'dd/MM/yyyy HH:mm:ss'),
                this.datepipe.transform(x.fechaHoraConfirmacionPago, 'dd/MM/yyyy HH:mm:ss'),
                x.descBanco,
                x.cuentaCorriente,
                totalDolaresTcCompraOhFormat,
                totalDolaresTcVentaOhhFormat,
                totalSolesTcVentaOhFormat,
                totalSolesTcCompraOhFormat,
                totalDolaresTcCompraPartnerFormat,
                totalDolaresTcVentaPartnerFormat,
                totalSolesTcVentaPartnerFormat,
                totalSolesTcCompraPartnerFormat,
                totalSpreadCompraOhFormat,
                totalSpreadVentaOhFormat,
                x.descripcionMonedaRecibirPartner,
                netoRecibirPartnerFormat,
                x.descripcionMonedaEnvioPartner,
                netoEnviarPartnerFormat,
                x.descEstadoTipoCambio
            ]);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
    }

    exportExcelDetalle(): void {
        const date = new Date();
        const excelName = 'Reporte detalle liquidaciones tipo cambio ' + moment(date).format('DD/MM/YYYY') + '.xlsx';
        const sheetName = 'Datos';
        const datos: any[] = [];
        const header: string[] = [];
        const isCurrency: any[] = [];
        const filterLavel = 'Fecha de Reporte';

        this.colsDetalle.forEach((element: any, index: number) => {
            if (index > 0) {
                header.push(element.header);
            }
        });

        this.datosLiquidacionDetalle.forEach(x => {
            const importeOrigenPartnerFormat = this.currencyPipe.transform(x.importeOrigenPartner || 0, ' ', 'symbol', '1.2-2');
            const importeOrigenOhFormat = this.currencyPipe.transform(x.importeOrigenOh || 0, ' ', 'symbol', '1.2-2');
            const importeDestinoPartnerFormat = this.currencyPipe.transform(x.importeDestinoPartner || 0, ' ', 'symbol', '1.2-2');
            const importeDestinoOhFormat = this.currencyPipe.transform(x.importeDestinoOh || 0, ' ', 'symbol', '1.2-2');
            const spreadCompraOhFormat = this.currencyPipe.transform(x.spreadCompraOh || 0, ' ', 'symbol', '1.2-2');
            const spreadVentaOhFormat = this.currencyPipe.transform(x.spreadVentaOh || 0, ' ', 'symbol', '1.2-2');
            const tipoCambioOhFormat = this.currencyPipe.transform(x.tipoCambioOh || 0, ' ', 'symbol', '1.4-4');
            const tipoCambioPartnerFormat = this.currencyPipe.transform(x.tipoCambioPartner || 0, ' ', 'symbol', '1.4-4');
            const tipoCambioTransaccionFormat = this.currencyPipe.transform(x.tipoCambioTransaccion || 0, ' ', 'symbol', '1.4-4');
            const tipoCambioLiqPartnerFormat = this.currencyPipe.transform(x.tipoCambioLiqPartner || 0, ' ', 'symbol', '1.4-4');

            datos.push([
                x.nroCambioMonedaOperacion,
                x.idOperacionPartner,
                x.cuentaOrigen,
                x.descripcionMonedaOrigen,
                importeOrigenPartnerFormat,
                importeOrigenOhFormat,
                x.nroOperacionCuentaOrigen,
                x.cuentaDestino,
                x.descripcionMonedaDestino,
                importeDestinoPartnerFormat,
                importeDestinoOhFormat,
                x.nroOperacionCuentaDestino,
                spreadCompraOhFormat,
                spreadVentaOhFormat,
                x.descEstadoTipoCambio,
                x.tipoDocIdentidadDescripcion,
                x.numeroDocIdentidad,
                x.tipoOperacionOh,
                this.datepipe.transform(x.fechaHoraConfirmacionUsuario, 'dd/MM/yyyy HH:mm:ss'),
                this.datepipe.transform(x.fechaHoraEjecucionOperacion, 'dd/MM/yyyy HH:mm:ss'),
                this.datepipe.transform(x.fechaHoraLiquidacion, 'dd/MM/yyyy HH:mm:ss'),
                tipoCambioOhFormat,
                tipoCambioPartnerFormat,
                tipoCambioTransaccionFormat,
                tipoCambioLiqPartnerFormat,
                x.idConsultaPartner,
                x.nroLoteLiquidado
            ]);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
    }

    private showMessage(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail });
    }
}
