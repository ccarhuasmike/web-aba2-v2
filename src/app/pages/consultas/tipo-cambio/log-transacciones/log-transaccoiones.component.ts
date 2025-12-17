import { CommonModule, DatePipe } from '@angular/common';
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
import { LogTransaccionesService } from './log-transaccoiones.service';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { UtilService } from '@/utils/util.services';

@Component({
    selector: 'app-log-transacciones',
    templateUrl: './log-transaccoiones.component.html',
    styleUrls: ['./log-transaccoiones.component.scss'],
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
        TooltipModule,
        InputTextModule
    ],
    providers: [MessageService, DatePipe]
})
export class LogTransaccionesComponent implements OnInit {

    es = CALENDAR_DETAIL;
    panelOpenState: string[] = ['0'];
    formBusqueda!: FormGroup;
    nroCaracter = 0;

    loadingDatosLogTransacciones = false;
    rows = 15;

    cols: any[] = [
        { header: 'TIPO DOCUMENTO', width: '140px' },
        { header: 'NUM. DOCUMENTO', width: '160px' },
        { header: 'NUM. OPERACIÓN CAMBIO', width: '180px' },
        { header: 'FECHA CONFIRMACIÓN USUARIO', width: '200px' },
        { header: 'ID. OPERACIÓN', width: '160px' },
        { header: 'NOMBRE OPERACIÓN', width: '250px' },
        { header: 'NRO. OPERACIÓN CUENTA ORIGEN', width: '200px' },
        { header: 'NRO. OPERACIÓN CUENTA DESTINO', width: '200px' },
        { header: 'USUARIO REGISTRO', width: '180px' },
        { header: 'FECHA REGISTRO', width: '160px' }
    ];

    filteredElementTipoDocumento: any[] = [];
    tipoDocumentos: any[] = [];

    datosLogTransacciones: any[] = [];
    heightTableLog = '100px';

    constructor(
        private readonly datepipe: DatePipe,
        private readonly commonService: CommonService,
        private readonly excelService: ExcelService,
        private readonly logTransaccionesService: LogTransaccionesService,
        private readonly messageService: MessageService
    ) {
        this.createForm();
    }

    ngOnInit(): void {
        this.getCombos();
    }

    createForm(): void {
        this.formBusqueda = new FormGroup({
            fechaRangoTrx: new FormControl([]),
            numOperacion: new FormControl(''),
            tipoDocumento: new FormControl(''),
            numDocumento: new FormControl('')
        });
    }

    clearBusquedaFiltros(): void {
        this.nroCaracter = 0;
        this.createForm();
        this.datosLogTransacciones = [];
    }

    getCombos(): void {
        this.commonService.getMultipleCombosPromise([
            'TIPO_DOCUMENTO'
        ]).then(resp => {
            this.tipoDocumentos = resp[0]['data'].map((item: any) => {
                return {
                    codigo: item['valNumEntero'],
                    descripcion: item['valCadCorto']
                };
            });
        });
    }

    onPaginado(event: any): void {
        const records = this.datosLogTransacciones.slice(event.first, event.first + this.rows);

        if (records.length > 1) {
            const height = records.length * 26;
            this.heightTableLog = `${height}px`;
        } else {
            this.heightTableLog = '100px';
        }
    }

    getLogTrx(): void {
        this.datosLogTransacciones = [];

        this.loadingDatosLogTransacciones = true;

        const formValue = this.formBusqueda.value;

        const rangoFechas = Array.isArray(formValue.fechaRangoTrx) ? formValue.fechaRangoTrx : [];
        const numOperacion = formValue.numOperacion;
        const tipoDocumento = formValue.tipoDocumento ? formValue.tipoDocumento.codigo : '';
        const numDocumento = formValue.numDocumento;

        let fechaConfirmacionDesde = '';
        let fechaConfirmacionHasta = '';

        if (rangoFechas[0] || rangoFechas[1] || numOperacion) {
            if (rangoFechas[0] && !rangoFechas[1]) {
                this.loadingDatosLogTransacciones = false;
                this.showMessage('warn', '', 'Es necesario ingresar un Intervalo de fechas válido');
                return;
            }
            if (rangoFechas[0] && rangoFechas[1]) {
                fechaConfirmacionDesde = moment(rangoFechas[0]).format('YYYY-MM-DD');
                fechaConfirmacionHasta = moment(rangoFechas[1]).format('YYYY-MM-DD');
            }
        } else {
            this.loadingDatosLogTransacciones = false;
            this.showMessage('warn', '', 'Es necesario ingresar un rango de fechas o el Núm. de operación');
            return;
        }

        this.logTransaccionesService.getCambioMonedaLog(
            fechaConfirmacionDesde,
            fechaConfirmacionHasta,
            numOperacion,
            tipoDocumento,
            numDocumento
        ).subscribe({
            next: (resp: any) => {
                this.loadingDatosLogTransacciones = false;

                if (resp['codigo'] === 0) {
                    this.datosLogTransacciones = resp.data || [];

                    if (this.datosLogTransacciones.length > 0) {
                        this.datosLogTransacciones = this.datosLogTransacciones.map(item => {
                            const descripcionDocumento = this.tipoDocumentos.find((e: any) => String(e.codigo) == item.tipoDocIdentidad);

                            return {
                                ...item,
                                tipoDocIdentidadDescripcion: descripcionDocumento ? descripcionDocumento['descripcion'] : ''
                            };
                        });
                    }
                    this.onPaginado({ first: 0, rows: this.rows });
                } else {
                    this.showMessage('error', 'Error getLogTrx', resp['mensaje']);
                }
            },
            error: () => {
                this.loadingDatosLogTransacciones = false;
                this.showMessage('error', 'Error getLogTrx', 'Error en el servicio de obtener log de transacciones');
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
        this.filteredElementTipoDocumento = [];
        const query = event?.query ?? '';
        this.filteredElementTipoDocumento = UtilService.filterByField(data, query, 'descripcion');     
    }

    exportExcel(): void {
        const date = new Date();
        const excelName = 'Reporte log transacciones tipo cambio ' + moment(date).format('DD/MM/YYYY') + '.xlsx';
        const sheetName = 'Datos';
        const datos: any[] = [];
        const header: string[] = [];
        const isCurrency: any[] = [];
        const filterLavel = 'Fecha de Reporte';

        this.cols.forEach((element: any) => {
            header.push(element.header);
        });

        this.datosLogTransacciones.forEach(x => {
            const list: any[] = [
                x.tipoDocIdentidadDescripcion,
                x.numeroDocIdentidad,
                x.nroCambioMonedaOperacion,
                this.datepipe.transform(x.fechaConfirmacionUsuario, 'dd/MM/yyyy HH:mm:ss'),
                x.idCambioMonedaOperacion,
                x.descripcionLarga,
                x.nroOperacionCuentaOrigen,
                x.nroOperacionCuentaDestino,
                x.usuarioRegistro,
                this.datepipe.transform(x.fechaRegistro, 'dd/MM/yyyy HH:mm:ss')
            ];

            datos.push(list);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
    }

    private showMessage(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
        this.messageService.add({ severity, summary, detail });
    }
}