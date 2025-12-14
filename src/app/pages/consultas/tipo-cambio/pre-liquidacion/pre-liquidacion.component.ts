import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import moment from 'moment';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CALENDAR_DETAIL } from '@/layout/Utils/constants/aba.constants';
import { CommonService } from '@/pages/service/commonService';
import { ExcelService } from '@/pages/service/excel.service';
import { ProveedorService } from '@/pages/mantenimiento/proveedor/proveedor.service';
import { PreLiquidacionService } from './pre-liquidacion.service';

@Component({
    selector: 'app-pre-liquidacion',
    templateUrl: './pre-liquidacion.component.html',
    styleUrls: ['./pre-liquidacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        AccordionModule,
        AutoCompleteModule,
        ButtonModule,
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        ToastModule,
        TooltipModule
    ],
    providers: [MessageService, DatePipe, CurrencyPipe]
})
export class PreLiquidacionComponent implements OnInit {

    es = CALENDAR_DETAIL;
    panelOpenState: string[] = ['0'];
    formBusqueda!: FormGroup;

    rows = 15;

    loadingDatosLiquidaciones = false;
    loadingDatosLiquidacionDetalle = false;

    cols: any[] = [
        { header: 'SUMA MONTO COMPRA DÓLARES' },
        { header: 'SUMA MONTO VENTA DÓLARES' },
        { header: 'SUMA MONTO SOLES POR VENTA DÓLARES' },
        { header: 'SUMA MONTO SOLES POR COMPRA DÓLARES' },
        { header: 'SUMA MONTO ENVÍO DÓLARES PROVEEDOR (COMPRA)' },
        { header: 'SUMA MONTO RECIBIR DÓLARES PROVEEDOR (VENTA)' },
        { header: 'SUMA MONTO ENVÍO SOLES PROVEEDOR (VENTA)' },
        { header: 'SUMA MONTO RECIBIR SOLES PROVEEDOR (COMPRA)' },
        { header: 'SUMA SPREAD COMPRA FOH' },
        { header: 'SUMA SPREAD VENTA FOH' },
        { header: 'MONEDA RECIBIR PROVEEDOR' },
        { header: 'MONTO NETO RECIBIR PROVEEDOR' },
        { header: 'MONEDA ENVIAR PROVEEDOR' },
        { header: 'MONTO NETO ENVIAR PROVEEDOR' }
    ];

    colsDetalle: any[] = [
        { header: 'NRO. OPERACIÓN CLIENTE' },
        { header: 'NRO. OPERACIÓN PROVEEDOR' },
        { header: 'NRO. CUENTA ORIGEN' },
        { header: 'MONEDA ORIGEN' },
        { header: 'MONTO CARGADO PROVEEDOR ORIGEN' },
        { header: 'MONTO CARGADO FOH ORIGEN' },
        { header: 'NRO. OPERACIÓN CUENTA ORIGEN' },
        { header: 'NRO. CUENTA DESTINO' },
        { header: 'MONEDA DESTINO' },
        { header: 'MONTO ABONADO PROVEEDOR DESTINO' },
        { header: 'MONTO ABONADO FOH DESTINO' },
        { header: 'NRO. OPERACIÓN CUENTA DESTINO' },
        { header: 'SPREAD COMPRA FOH' },
        { header: 'SPREAD VENTA FOH' },
        { header: 'ESTADO TRANSACCIÓN' },
        { header: 'TIPO DOCUMENTO' },
        { header: 'NRO. DOCUMENTO' },
        { header: 'TIPO OPERACIÓN' },
        { header: 'FECHA CONFIRMACIÓN CLIENTE' },
        { header: 'FECHA EJECUCIÓN' },
        { header: 'FECHA PRE LIQUIDACIÓN' },
        { header: 'TIPO CAMBIO FOH' },
        { header: 'TIPO CAMBIO PROVEEDOR' },
        { header: 'TIPO CAMBIO TRANSACCIÓN' },
        { header: 'ID CONSULTA PROVEEDOR' },
    ];

    datosLiquidaciones: any[] = [];
    datosLiquidacionDetalle: any[] = [];

    datoLiquidado: any;

    tipoDocumentos: any[] = [];
    tipoMonedas: any[] = [];
    estadosTipoCambio: any[] = [];
    proveedores: any[] = [];
    filteredElementProveedor: any[] = [];

    constructor(
        private readonly datepipe: DatePipe,
        private readonly currencyPipe: CurrencyPipe,
        private readonly commonService: CommonService,
        private readonly excelService: ExcelService,
        private readonly preLiquidacionService: PreLiquidacionService,
        private readonly messageService: MessageService,
        private readonly proveedorService: ProveedorService
    ) {
        this.createForm();
    }

    ngOnInit(): void {
        this.getCombos();
        this.getEstadosTipoCambio();
        this.getProveedores();
    }

    createForm(): void {
        this.formBusqueda = new FormGroup({
            proveedor: new FormControl(null, [Validators.required])
        });
    }

    clearBusquedaFiltros(): void {
        this.formBusqueda.reset();
        this.datosLiquidaciones = [];
        this.datosLiquidacionDetalle = [];
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

    getProveedores(): void {
        this.proveedorService.getObtenerProveedor().subscribe({
            next: (resp: any) => {
                if (resp && resp['codigo'] === 0) {
                    this.proveedores = (resp.data || []).map((e: any) => {
                        let nombreGenerico = e.razonSocial;

                        if (!nombreGenerico) {
                            nombreGenerico = `${e.primerNombre || ''} ${e.segundoNombre || ''} ${e.apellidoPaterno || ''} ${e.apellidoMaterno || ''}`.trim();
                        }

                        return {
                            ...e,
                            nombreGenerico
                        };
                    });
                } else {
                    this.showMessage('error', 'Error getProveedores', resp?.mensaje || 'Error no controlado');
                }
            },
            error: () => {
                this.showMessage('error', 'Error getProveedores', 'Error no controlado');
            }
        });
    }

    getLiquidaciones(): void {
        if (this.formBusqueda.invalid) {
            this.showMessage('warn', '', 'Seleccione un partner para realizar la búsqueda');
            return;
        }

        this.datosLiquidaciones = [];
        this.datosLiquidacionDetalle = [];
        this.loadingDatosLiquidaciones = true;

        const idPartner = this.formBusqueda.get('proveedor')?.value?.idPartner;

        this.preLiquidacionService.getResumenLiquidacion(
            idPartner
        ).subscribe({
            next: (resp: any) => {
                this.loadingDatosLiquidaciones = false;

                if (resp['codigo'] === 0) {
                    this.datosLiquidaciones = (resp.data || []).map((item:any) => {
                        const monedaEnvioPartner = this.tipoMonedas.find((e: any) => e.id == item.monedaEnviarPartner);
                        const monedaRecibirPartner = this.tipoMonedas.find((e: any) => e.id == item.monedaRecibirPartner);

                        return {
                            ...item,
                            descripcionMonedaEnvioPartner: monedaEnvioPartner ? monedaEnvioPartner['descripcion'] : '',
                            descripcionMonedaRecibirPartner: monedaRecibirPartner ? monedaRecibirPartner['descripcion'] : ''
                        };
                    });

                    if (this.datosLiquidaciones.length) {
                        this.getLiquidacionDetalle(this.datosLiquidaciones[0]);
                    }
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

        this.loadingDatosLiquidacionDetalle = true;
        this.datoLiquidado = data;

        const idPreLiquidacion = data.idCambioMonedaPreLiqDiariaRes;

        this.preLiquidacionService.getDetalleLiquidacion(
            idPreLiquidacion
        ).subscribe({
            next: (resp: any) => {
                this.loadingDatosLiquidacionDetalle = false;

                if (resp['codigo'] === 0) {
                    this.datosLiquidacionDetalle = (resp.data || []).map((item:any) => {
                        const tipoDocumentoIdentidad = this.tipoDocumentos.find((e: any) => String(e.id) == item.tipoDocIdentidad);
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

    filterElementProveedor(event: any, data: any): void {
        this.filteredElementProveedor = [];
        const query = event?.query?.toLowerCase() ?? '';
        if (!data) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.nombreGenerico.toLowerCase().indexOf(query) >= 0) {
                this.filteredElementProveedor.push(element);
            }
        }
    }

    changeModelProveedor(event: any): void {
        if (!event) {
            this.formBusqueda.get('proveedor')?.setValue(null);
            this.datosLiquidaciones = [];
            this.datosLiquidacionDetalle = [];
        }
    }

    exportExcel(): void {
        const date = new Date();
        const excelName = 'Reporte pre-liquidaciones tipo cambio ' + moment(date).format('DD/MM/YYYY') + '.xlsx';
        const sheetName = 'Datos';
        const datos: any[] = [];
        const header: string[] = [];
        const isCurrency: any[] = [];
        const filterLavel = 'Fecha de Reporte';

        this.cols.forEach((element: any) => {
            header.push(element.header);
        });

        this.datosLiquidaciones.forEach(x => {
            const list: any[] = [];

            const totalDolaresTcCompraOhFormat = this.currencyPipe.transform(x.totalDolaresTcCompraOh || 0, ' ', 'symbol', '1.2-2');
            const totalDolaresTcVentaOhFormat = this.currencyPipe.transform(x.totalDolaresTcVentaOh || 0, ' ', 'symbol', '1.2-2');
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

            list.push(totalDolaresTcCompraOhFormat);
            list.push(totalDolaresTcVentaOhFormat);
            list.push(totalSolesTcVentaOhFormat);
            list.push(totalSolesTcCompraOhFormat);
            list.push(totalDolaresTcCompraPartnerFormat);
            list.push(totalDolaresTcVentaPartnerFormat);
            list.push(totalSolesTcVentaPartnerFormat);
            list.push(totalSolesTcCompraPartnerFormat);
            list.push(totalSpreadCompraOhFormat);
            list.push(totalSpreadVentaOhFormat);
            list.push(x.descripcionMonedaRecibirPartner);
            list.push(netoRecibirPartnerFormat);
            list.push(x.descripcionMonedaEnvioPartner);
            list.push(netoEnviarPartnerFormat);
            datos.push(list);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
    }

    exportExcelDetalle(): void {
        const date = new Date();
        const excelName = 'Reporte pre-liquidaciones detalle tipo cambio ' + moment(date).format('DD/MM/YYYY') + '.xlsx';
        const sheetName = 'Datos';
        const datos: any[] = [];
        const header: string[] = [];
        const isCurrency: any[] = [];
        const filterLavel = 'Fecha de Reporte';

        this.colsDetalle.forEach((element: any) => {
            header.push(element.header);
        });

        this.datosLiquidacionDetalle.forEach(x => {
            const list: any[] = [];

            const importeOrigenPartnerFormat = this.currencyPipe.transform(x.importeOrigenPartner || 0, ' ', 'symbol', '1.2-2');
            const importeOrigenOhFormat = this.currencyPipe.transform(x.importeOrigenOh || 0, ' ', 'symbol', '1.2-2');
            const importeDestinoPartnerFormat = this.currencyPipe.transform(x.importeDestinoPartner || 0, ' ', 'symbol', '1.2-2');
            const importeDestinoOhFormat = this.currencyPipe.transform(x.importeDestinoOh || 0, ' ', 'symbol', '1.2-2');
            const spreadCompraOhFormat = this.currencyPipe.transform(x.spreadCompraOh || 0, ' ', 'symbol', '1.2-2');
            const spreadVentaOhFormat = this.currencyPipe.transform(x.spreadVentaOh || 0, ' ', 'symbol', '1.2-2');
            const tipoCambioOhFormat = this.currencyPipe.transform(x.tipoCambioOh || 0, ' ', 'symbol', '1.4-4');
            const tipoCambioPartnerFormat = this.currencyPipe.transform(x.tipoCambioPartner || 0, ' ', 'symbol', '1.4-4');
            const tipoCambioTransaccionFormat = this.currencyPipe.transform(x.tipoCambioTransaccion || 0, ' ', 'symbol', '1.4-4');

            list.push(x.nroCambioMonedaOperacion);
            list.push(x.idOperacionPartner);
            list.push(x.cuentaOrigen);
            list.push(x.descripcionMonedaOrigen);
            list.push(importeOrigenPartnerFormat);
            list.push(importeOrigenOhFormat);
            list.push(x.nroOperacionCuentaOrigen);
            list.push(x.cuentaDestino);
            list.push(x.descripcionMonedaDestino);
            list.push(importeDestinoPartnerFormat);
            list.push(importeDestinoOhFormat);
            list.push(x.nroOperacionCuentaDestino);
            list.push(spreadCompraOhFormat);
            list.push(spreadVentaOhFormat);
            list.push(x.descEstadoTipoCambio);
            list.push(x.tipoDocIdentidadDescripcion);
            list.push(x.numeroDocIdentidad);
            list.push(x.tipoOperacionOh);
            list.push(this.datepipe.transform(x.fechaHoraConfirmacionUsuario, 'dd/MM/yyyy HH:mm:ss'));
            list.push(this.datepipe.transform(x.fechaHoraEjecucionOperacion, 'dd/MM/yyyy HH:mm:ss'));
            list.push(this.datepipe.transform(x.fechaHoraPreLiquidacion, 'dd/MM/yyyy HH:mm:ss'));
            list.push(tipoCambioOhFormat);
            list.push(tipoCambioPartnerFormat);
            list.push(tipoCambioTransaccionFormat);
            list.push(x.idConsultaPartner);
            datos.push(list);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
    }

    private showMessage(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail });
    }
}
