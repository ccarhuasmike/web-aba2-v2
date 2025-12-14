import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import moment from 'moment';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';

import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { ConsultasService } from './consultas.service';
import { CommonService } from '@/pages/service/commonService';
import { ExcelService } from '@/pages/service/excel.service';
import { ParametroTipoCambioService } from '@/pages/mantenimiento/parametro/parametro-tipo-cambio/parametro-tipo-cambio.service';
import { CALENDAR_DETAIL } from '@/layout/Utils/constants/aba.constants';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    selector: 'app-tipo-cambio-consultas',
    templateUrl: './consultas.component.html',
    styleUrls: ['./consultas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        AccordionModule,
        AutoCompleteModule,
        ButtonModule,
        DatePickerModule,
        CommonModule,
        InputTextModule,
        ReactiveFormsModule,
        TableModule,
        TooltipModule,
        ToastModule,
        PaginatorModule
    ],
    providers: [MessageService, DatePipe, CurrencyPipe]
})
export class ConsultasComponent implements OnInit {

    es = CALENDAR_DETAIL;
    formBusqueda!: FormGroup;
    nroCaracter = 0;

    loadingDatosConsultas = false;
    rows = 15;

    cols: any[] = [
        { header: 'TIPO. DOCUMENTO', width: '140px' },
        { header: 'NUM. DOCUMENTO', width: '160px' },
        { header: 'ID CONSULTA PROVEEDOR', width: '180px' },
        { header: 'NUM. OPERACIÓN CAMBIO', width: '180px' },
        { header: 'NUM. OPERACIÓN PROVEEDOR', width: '200px' },
        { header: 'FECHA CONSULTA CLIENTE', width: '180px' },
        { header: 'FECHA CONSULTA PROVEEDOR', width: '200px' },
        { header: 'FECHA CONFIRMACIÓN CLIENTE', width: '200px' },
        { header: 'MONTO ABONADO PROVEEDOR DESTINO', width: '180px' },
        { header: 'MONTO ABONADO FOH DESTINO', width: '180px' },
        { header: 'MONTO CARGADO PROVEEDOR ORIGEN', width: '180px' },
        { header: 'MONTO CARGADO FOH ORIGEN', width: '180px' },
        { header: 'TIPO CAMBIO COMPRA FOH', width: '180px' },
        { header: 'TIPO CAMBIO VENTA FOH', width: '180px' },
        { header: 'TIPO CAMBIO COMPRA PROVEEDOR', width: '180px' },
        { header: 'TIPO CAMBIO VENTA PROVEEDOR', width: '180px' },
        { header: 'CANAL', width: '140px' },
        { header: 'CAMPAÑA', width: '320px' }
    ];

    filteredElementTipoDocumento: any[] = [];
    tipoDocumentos: any[] = [];

    datosListadoConsultas: any[] = [];
    listadoCanales: any[] = [];
    heightTableConsulta = '100px';

    constructor(
        private readonly datepipe: DatePipe,
        private readonly currencyPipe: CurrencyPipe,
        private readonly commonService: CommonService,
        private readonly excelService: ExcelService,
        private readonly consultasService: ConsultasService,
        private readonly parametroTipoCambioService: ParametroTipoCambioService,
        private readonly messageService: MessageService
    ) {
        this.createForm();
    }

    ngOnInit(): void {
        this.getCombos();
        this.getCanales();
    }

    getCombos(): void {
        this.commonService.getMultipleCombosPromise(['TIPO_DOCUMENTO']).then(resp => {
            this.tipoDocumentos = resp[0]['data'].map((item: any) => {
                return {
                    id: item['valNumEntero'],
                    descripcion: item['valCadCorto']
                };
            });
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

    createForm(): void {
        this.formBusqueda = new FormGroup({
            fechaRangoTrx: new FormControl([]),
            idConsultaPartner: new FormControl(''),
            nroCambioMonedaOperacion: new FormControl(''),
            tipoDocumento: new FormControl(''),
            numDocumento: new FormControl('')
        });
    }

    clearBusquedaFiltros(): void {
        this.nroCaracter = 0;
        this.createForm();
    }

    onPaginado(event: any): void {
        const records = this.datosListadoConsultas.slice(event.first, event.first + this.rows);

        if (records.length > 1) {
            const height = records.length * 26;
            this.heightTableConsulta = `${height}px`;
        } else {
            this.heightTableConsulta = '100px';
        }
    }

    getConsultas(): void {
        this.datosListadoConsultas = [];
        this.loadingDatosConsultas = true;

        const formValue = this.formBusqueda.value;
        const rangoFechas = Array.isArray(formValue.fechaRangoTrx) ? formValue.fechaRangoTrx : [];
        const fechaConsultaDesde = rangoFechas[0] ? moment(rangoFechas[0]).format('YYYY-MM-DD') : '';
        const fechaConsultaHasta = rangoFechas[1] ? moment(rangoFechas[1]).format('YYYY-MM-DD') : '';
        const idConsultaPartner = formValue.idConsultaPartner;
        const nroCambioMonedaOperacion = formValue.nroCambioMonedaOperacion;
        const tipoDocumento = formValue.tipoDocumento ? formValue.tipoDocumento.id : '';
        const numDocumento = formValue.numDocumento;

        const hasFechas = !!(rangoFechas[0] || rangoFechas[1]);

        if (!hasFechas && !nroCambioMonedaOperacion) {
            this.loadingDatosConsultas = false;
            this.showMessage('warn', '', 'Es necesario ingresar un rango de fechas o el Núm. de operación');
            return;
        }

        if ((rangoFechas[0] && !rangoFechas[1]) || (!rangoFechas[0] && rangoFechas[1])) {
            this.loadingDatosConsultas = false;
            this.showMessage('warn', '', 'Es necesario ingresar un Intervalo de fechas válido');
            return;
        }

        this.consultasService.getConsultas(
            fechaConsultaDesde,
            fechaConsultaHasta,
            idConsultaPartner,
            nroCambioMonedaOperacion,
            tipoDocumento,
            numDocumento
        ).subscribe({
            next: (resp: any) => {
                this.loadingDatosConsultas = false;

                if (resp['codigo'] === 0) {
                    this.datosListadoConsultas = resp.data || [];

                    if (this.datosListadoConsultas.length > 0) {
                        this.datosListadoConsultas = this.datosListadoConsultas.map(item => {
                            const descripcionDocumento = this.tipoDocumentos.find((e: any) => String(e.id) === item.tipoDocIdentidad);
                            const canal = this.listadoCanales.find((e: any) => e.desElemento === 'CANALES' && e.valNumEntero == item.canal);

                            return {
                                ...item,
                                tipoDocIdentidadDescripcion: descripcionDocumento ? descripcionDocumento['descripcion'] : '',
                                descCanal: canal ? canal['valCadCorto'] : ''
                            };
                        });
                    }
                    this.onPaginado({ first: 0, rows: this.rows });
                } else {
                    this.showMessage('error', 'Error getConsultas', resp['mensaje']);
                }
            },
            error: () => {
                this.loadingDatosConsultas = false;
                this.showMessage('error', 'Error getConsultas', 'Error en el servicio de obtener consultas');
            }
        });
    }

    changeModelTipoDocumento(event: any): void {
        if (event) {
            if (event.id === 1) {
                this.nroCaracter = 8;
                this.formBusqueda.get('numDocumento')?.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required]);
            } else if (event.id === 2) {
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
        this.filteredElementTipoDocumento = [];
        const query = event.query?.toLowerCase() ?? '';
        if (!data) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.descripcion.toLowerCase().indexOf(query) >= 0) {
                this.filteredElementTipoDocumento.push(element);
            }
        }
    }

    exportExcel(): void {
        const date = new Date();
        const excelName = `Reporte consultas tipo cambio ${moment(date).format('DD/MM/YYYY')}.xlsx`;
        const sheetName = 'Datos';
        const datos: any[] = [];
        const header: string[] = [];
        const isCurrency: any[] = [];
        const filterLavel = 'Fecha de Reporte';

        this.cols.forEach((element: any) => {
            header.push(element.header);
        });

        this.datosListadoConsultas.forEach(x => {
            const list: any[] = [];

            const importeDestinoPartner = x.importeDestinoPartner || 0;
            const importeDestinoPartnerFormat = this.currencyPipe.transform(importeDestinoPartner, ' ', 'symbol', '1.2-2');

            const importeDestinoOh = x.importeDestinoOh || 0;
            const importeDestinoOhFormat = this.currencyPipe.transform(importeDestinoOh, ' ', 'symbol', '1.2-2');

            const importeOrigenPartner = x.importeOrigenPartner || 0;
            const importeOrigenPartnerFormat = this.currencyPipe.transform(importeOrigenPartner, ' ', 'symbol', '1.2-2');

            const importeOrigenOh = x.importeOrigenOh || 0;
            const importeOrigenOhFormat = this.currencyPipe.transform(importeOrigenOh, ' ', 'symbol', '1.2-2');

            const tipoCambioCompraOh = x.tipoCambioCompraOh || 0;
            const tipoCambioCompraOhFormat = this.currencyPipe.transform(tipoCambioCompraOh, ' ', 'symbol', '1.4-4');

            const tipoCambioVentaOh = x.tipoCambioVentaOh || 0;
            const tipoCambioVentaOhFormat = this.currencyPipe.transform(tipoCambioVentaOh, ' ', 'symbol', '1.4-4');

            const tipoCambioCompraPartner = x.tipoCambioCompraPartner || 0;
            const tipoCambioCompraPartnerFormat = this.currencyPipe.transform(tipoCambioCompraPartner, ' ', 'symbol', '1.4-4');

            const tipoCambioVentaPartner = x.tipoCambioVentaPartner || 0;
            const tipoCambioVentaPartnerFormat = this.currencyPipe.transform(tipoCambioVentaPartner, ' ', 'symbol', '1.4-4');

            list.push(x.tipoDocIdentidadDescripcion);
            list.push(x.numeroDocIdentidad);
            list.push(x.idConsultaPartner);
            list.push(x.nroCambioMonedaOperacion);
            list.push(x.idOperacionPartner);
            list.push(this.datepipe.transform(x.fechaHoraConsultaUsuario, 'dd/MM/yyyy HH:mm:ss'));
            list.push(this.datepipe.transform(x.fechaHoraConsultaPartner, 'dd/MM/yyyy HH:mm:ss'));
            list.push(this.datepipe.transform(x.fechaHoraConfirmacionUsuario, 'dd/MM/yyyy HH:mm:ss'));
            list.push(importeDestinoPartnerFormat);
            list.push(importeDestinoOhFormat);
            list.push(importeOrigenPartnerFormat);
            list.push(importeOrigenOhFormat);
            list.push(tipoCambioCompraOhFormat);
            list.push(tipoCambioVentaOhFormat);
            list.push(tipoCambioCompraPartnerFormat);
            list.push(tipoCambioVentaPartnerFormat);
            list.push(x.descCanal);
            list.push(x.descripcion);
            datos.push(list);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
    }

    private showMessage(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail });
    }
}
