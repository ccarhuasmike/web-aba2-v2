import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import moment from 'moment';
import { CALENDAR_DETAIL } from '@/layout/Utils/constants/aba.constants';
import { ExcelService } from '@/pages/service/excel.service';
import { OpeCampaniasService } from './ope-campanias.service';
import { DatePickerModule } from 'primeng/datepicker';
import { UtilService } from '@/utils/util.services';

@Component({
    selector: 'app-ope-campanias',
    templateUrl: './ope-campanias.component.html',
    styleUrls: ['./ope-campanias.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        AccordionModule,
        AutoCompleteModule,
        ButtonModule,
        DatePickerModule,
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        ToastModule,
        TooltipModule
    ],
    providers: [MessageService, DatePipe, CurrencyPipe]
})
export class OpeCampaniasComponent implements OnInit {

    @ViewChild('dtDetalle') table!: Table;

    es = CALENDAR_DETAIL;
    panelOpenState: string[] = ['0'];
    formBusqueda!: FormGroup;
    heightTableResumen = '100px';
    heightTableDetalle = '100px';

    rows = 15;

    loadingDatosOperaciones = false;
    loadingDatosOperacionesDetalle = false;

    cols: any[] = [
        { header: 'ID OPERACIÓN CAMPAÑA', width: '200px' },
        { header: 'ID CAMPAÑA', width: '200px' },
        { header: 'FECHA OPERACIÓN', width: '200px' },
        { header: 'IMPORTE TOTAL CAMPAÑA', width: '200px' },
        { header: 'TOTAL SPREAD COMPRA FOH', width: '200px' },
        { header: 'TOTAL SPREAD VENTA FOH', width: '200px' },
        { header: 'TOTAL SPREAD FOH', width: '200px' },
        { header: 'GANANCIA SPREAD FOH', width: '200px' },
        { header: 'PERDIDA SPREAD FOH', width: '200px' },
        { header: 'USUARIO REGISTRO', width: '200px' },
        { header: 'FECHA REGISTRO', width: '200px' }
    ];

    colsDetalle: any[] = [
        { header: 'ID OPERACIÓN CAMPAÑA DETALLE', width: '220px' },
        { header: 'ID CAMBIO MONEDA OPERACIÓN', width: '220px' },
        { header: 'FECHA OPERACIÓN', width: '200px' },
        { header: 'IMPORTE CAMPAÑA', width: '200px' },
        { header: 'SPREAD COMPRA FOH', width: '200px' },
        { header: 'SPREAD VENTA FOH', width: '200px' },
        { header: 'USUARIO REGISTRO', width: '200px' },
        { header: 'FECHA REGISTRO', width: '200px' }
    ];

    datoOperacion: any;
    datosOperaciones: any[] = [];
    datosOperacionesDetalle: any[] = [];

    campanias: any[] = [];
    filteredElementCampanias: any[] = [];

    constructor(
        private readonly datepipe: DatePipe,
        private readonly currencyPipe: CurrencyPipe,
        private readonly excelService: ExcelService,
        private readonly opeCampaniasService: OpeCampaniasService,
        private readonly messageService: MessageService
    ) {
        this.createForm();
    }

    ngOnInit(): void {
        this.getCampanias();
    }

    createForm(): void {
        this.formBusqueda = new FormGroup({
            fechaRangoOperacion: new FormControl([]),
            campania: new FormControl('')
        });
    }

    getCampanias(): void {
        this.opeCampaniasService.getCampanias().subscribe({
            next: (resp: any) => {
                if (resp['codigo'] === 0) {
                    this.campanias = resp.data;
                } else {
                    this.showMessage('error', 'Error getCampanias', resp['mensaje']);
                }
            },
            error: () => {
                this.showMessage('error', 'Error getCampanias', 'Error en el servicio de obtener campañas');
            }
        });
    }

    getOperaciones(): void {
        this.datosOperaciones = [];
        this.datosOperacionesDetalle = [];
        this.loadingDatosOperaciones = true;

        const formValue = this.formBusqueda.value;
        const rangoFechas = Array.isArray(formValue.fechaRangoOperacion) ? formValue.fechaRangoOperacion : [];
        let fechaDesde = '';
        let fechaHasta = '';
        const idCambioMonedaCampana = formValue.campania?.idCambioMonedaCampana ?? '';

        if (rangoFechas[0] || rangoFechas[1] || idCambioMonedaCampana) {
            if (rangoFechas[0] && !rangoFechas[1]) {
                this.loadingDatosOperaciones = false;
                this.showMessage('warn', '', 'Es necesario ingresar un intervalo de fechas válido');
                return;
            }
            if (rangoFechas[0] && rangoFechas[1]) {
                fechaDesde = moment(rangoFechas[0]).format('YYYY-MM-DD');
                fechaHasta = moment(rangoFechas[1]).format('YYYY-MM-DD');
            }
        } else {
            this.loadingDatosOperaciones = false;
            this.showMessage('warn', '', 'Es necesario ingresar un rango de fechas o la campaña');
            return;
        }

        this.opeCampaniasService.getResumenCambioMonedaOperacionCampana(
            fechaDesde,
            fechaHasta,
            idCambioMonedaCampana
        ).subscribe({
            next: (resp: any) => {
                this.loadingDatosOperaciones = false;

                if (resp['codigo'] === 0) {
                    this.datosOperaciones = resp.data.map((item: any) => {
                        const importeTotalCampanaFormat = this.currencyPipe.transform(item.importeTotalCampana || 0, ' ', 'symbol', '1.2-2');
                        const totalSpreadCompraOhFormat = this.currencyPipe.transform(item.totalSpreadCompraOh || 0, ' ', 'symbol', '1.2-2');
                        const totalSpreadVentaOhFormat = this.currencyPipe.transform(item.totalSpreadVentaOh || 0, ' ', 'symbol', '1.2-2');
                        const totalSpreadOhFormat = this.currencyPipe.transform(item.totalSpreadOh || 0, ' ', 'symbol', '1.2-2');
                        const gananciaSpreadOhFormat = this.currencyPipe.transform(item.gananciaSpreadOh || 0, ' ', 'symbol', '1.2-2');
                        const perdidaSpreadOhFormat = this.currencyPipe.transform(item.perdidaSpreadOh || 0, ' ', 'symbol', '1.2-2');
                        const fechaOperacion = this.datepipe.transform(new Date(item.fechaOperacion), 'dd/MM/yyyy');
                        const fechaRegistro = this.datepipe.transform(item.fechaRegistro, 'dd/MM/yyyy HH:mm:ss');

                        return {
                            ...item,
                            importeTotalCampana: importeTotalCampanaFormat,
                            totalSpreadCompraOh: totalSpreadCompraOhFormat,
                            totalSpreadVentaOh: totalSpreadVentaOhFormat,
                            totalSpreadOh: totalSpreadOhFormat,
                            gananciaSpreadOh: gananciaSpreadOhFormat,
                            perdidaSpreadOh: perdidaSpreadOhFormat,
                            fechaOperacion,
                            fechaRegistro
                        };
                    });

                    this.onPaginadoResumen({ first: 0, rows: this.rows });
                } else {
                    this.showMessage('error', 'Error getOperaciones', resp['mensaje']);
                }
            },
            error: () => {
                this.loadingDatosOperaciones = false;
                this.showMessage('error', 'Error getOperaciones', 'Error en el servicio de obtención de operaciones');
            }
        });
    }

    getOperacionesDetalle(data: any): void {
        if (this.table) {
            this.table.clear();
        }

        this.loadingDatosOperacionesDetalle = true;
        this.datoOperacion = data;

        this.opeCampaniasService.getDetalleCambioMonedaOperacionCampana(
            data.idCambioMonedaCamOpeRes
        ).subscribe({
            next: (resp: any) => {
                this.loadingDatosOperacionesDetalle = false;

                if (resp['codigo'] === 0) {
                    this.datosOperacionesDetalle = resp.data.map((item: any) => {
                        const importeCampanaFormat = this.currencyPipe.transform(item.importeCampana || 0, ' ', 'symbol', '1.2-2');
                        const spreadCompraOhFormat = this.currencyPipe.transform(item.spreadCompraOh || 0, ' ', 'symbol', '1.2-2');
                        const spreadVentaOhFormat = this.currencyPipe.transform(item.spreadVentaOh || 0, ' ', 'symbol', '1.2-2');
                        const fechaOperacion = this.datepipe.transform(new Date(item.fechaOperacion), 'dd/MM/yyyy');
                        const fechaRegistro = this.datepipe.transform(item.fechaRegistro, 'dd/MM/yyyy HH:mm:ss');

                        return {
                            ...item,
                            importeCampana: importeCampanaFormat,
                            spreadCompraOh: spreadCompraOhFormat,
                            spreadVentaOh: spreadVentaOhFormat,
                            fechaOperacion,
                            fechaRegistro
                        };
                    });

                    this.onPaginadoDetalle({ first: 0, rows: this.rows });
                } else {
                    this.showMessage('error', 'Error getOperacionesDetalle', resp['mensaje']);
                }
            },
            error: () => {
                this.loadingDatosOperacionesDetalle = false;
                this.showMessage('error', 'Error getOperacionesDetalle', 'Error en el servicio de obtener detalle');
            }
        });
    }

    clearBusquedaFiltros(): void {
        this.createForm();
        this.datosOperaciones = [];
        this.datosOperacionesDetalle = [];
    }

    onPaginadoResumen(event: any): void {
        const records = this.datosOperaciones.slice(event.first, event.first + this.rows);

        if (records.length > 1) {
            const height = records.length * 28;
            this.heightTableResumen = `${height}px`;
        } else {
            this.heightTableResumen = '100px';
        }
    }

    onPaginadoDetalle(event: any): void {
        const records = this.datosOperacionesDetalle.slice(event.first, event.first + this.rows);

        if (records.length > 1) {
            const height = records.length * 32.5;
            this.heightTableDetalle = `${height}px`;
        } else {
            this.heightTableDetalle = '100px';
        }
    }

    exportExcel(): void {
        const date = new Date();
        const excelName = 'Reporte operaciones por campaña ' + moment(date).format('DD/MM/YYYY') + '.xlsx';
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

        this.datosOperaciones.forEach(x => {
            const list: any[] = [
                x.idCambioMonedaCamOpeRes,
                x.idCambioMonedaCampana,
                x.fechaOperacion,
                x.importeTotalCampana,
                x.totalSpreadCompraOh,
                x.totalSpreadVentaOh,
                x.totalSpreadOh,
                x.gananciaSpreadOh,
                x.perdidaSpreadOh,
                x.usuarioRegistro,
                x.fechaRegistro
            ];
            datos.push(list);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
    }

    exportExcelDetalle(): void {
        const date = new Date();
        const excelName = 'Reporte detalle operaciones por campaña ' + moment(date).format('DD/MM/YYYY') + '.xlsx';
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

        this.datosOperacionesDetalle.forEach(x => {
            const list: any[] = [
                x.idCambioMonedaCamOpeDet,
                x.idCambioMonedaOperacion,
                x.fechaOperacion,
                x.importeCampana,
                x.spreadCompraOh,
                x.spreadVentaOh,
                x.usuarioRegistro,
                x.fechaRegistro
            ];
            datos.push(list);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
    }

    filterElementCampania(event: any, data: any): void {


        this.filteredElementCampanias = [];
        const query = event?.query ?? '';
        this.filteredElementCampanias = UtilService.filterByField(data, query, 'descripcion');


    }

    private showMessage(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail });
    }
}
