import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HistorialBloqueosService } from './historial-bloqueos.service';
import { EjecucionBloqueosService } from '../ejecucion-bloqueos/ejecucion-bloqueos.service';
import moment from 'moment';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CALENDAR_DETAIL } from '@/layout/Utils/constants/aba.constants';
import { ExcelService } from '@/pages/service/excel.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-historial-bloqueos',
    templateUrl: './historial-bloqueos.component.html',
    styleUrls: ['./historial-bloqueos.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        AccordionModule,
        ButtonModule,
        CommonModule,
        DatePickerModule,
        InputTextModule,
        ReactiveFormsModule,
        TableModule,
        TooltipModule,
        ToastModule,
    ],
    providers: [DatePipe,MessageService]
})
export class HistorialBloqueosComponent implements OnInit {

    es = CALENDAR_DETAIL;
    panelOpenState: string[] = ['0'];

    formBusqueda!: FormGroup;
    rows: number = 15;
    first: number = 0;

    rowsDetalle: number = 15;
    firstDetalle: number = 0;

    totalRecordsLote: number = 0;
    totalRecordsDetalle: number = 0;

    colsLote = [
        { header: 'Núm. Lote' },
        { header: 'Cantidad Registros' },
        { header: 'Fecha Ejecución Inicio' },
        { header: 'Fecha Ejecución Fin' },
        { header: 'Cantidad Registros Procesados' },
        { header: 'Cantidad Registros No Procesados' },
        { header: 'Usuario Creación' },
        { header: 'Fecha Creación' }
    ];

    colsDetalleLote = [
        { header: 'UID Cliente' },
        { header: 'UID Cuenta' },
        { header: 'Token' },
        { header: 'Código Bloqueo' },
        { header: 'Descripción Bloqueo' },
        { header: 'Motivo Bloqueo' },
        { header: 'Descripción Motivo' },
        { header: 'Descripción' },
        { header: 'Error' }
    ]

    motivosBloqueoCuenta: any[] = [];
    motivosBloqueoTarjeta: any[] = [];

    codigosBloqueoCuenta: any[] = [];
    codigosBloqueoTarjeta: any[] = [];

    datosLote: any[] = [];
    datosDetallelote: any[] = [];

    loadingDatosLote: boolean = false;
    loadingDatosDetallelote: boolean = false;

    numLoteSeleccionado: any;

    fechaRangoHistorial: [Date, Date] = [new Date(), new Date()];
    fIniRango: string | null = null;
    ffinRango: string | null = null;

    constructor(
        private readonly datePipe: DatePipe,
        private readonly ejecucionBloqueosService: EjecucionBloqueosService,
        private readonly historialBloqueos: HistorialBloqueosService,
        private readonly toastr: MessageService,
        private readonly excelService: ExcelService
    ) {
        this.createForm();
    }

    ngOnInit() {
        this.getMotivosBloqueoCuenta();
        this.getCodigosBloqueoCuenta();
        this.getMotivosBloqueoTarjeta();
        this.getCodigosBloqueoTarjeta();
    }

    createForm() {
        this.formBusqueda = new FormGroup({
            fechaRangoBloqueo: new FormControl(),
            nroLote: new FormControl()
        })
    }

    getMotivosBloqueoCuenta() {
        this.ejecucionBloqueosService.getMotivosBloqueoCuenta().subscribe((resp: any) => {
            if (resp) {
                this.motivosBloqueoCuenta = resp['data']['listaMotivoBloqueoCuenta'];
            }
        })
    }

    getMotivosBloqueoTarjeta() {
        this.ejecucionBloqueosService.getMotivosBloqueoTarjeta().subscribe((resp: any) => {
            if (resp) {
                this.motivosBloqueoTarjeta = resp['data']['listaMotivoBloqueoTarjeta'];
            }
        })
    }

    getCodigosBloqueoCuenta() {
        this.ejecucionBloqueosService.getCodigosBloqueoCuenta().subscribe((resp: any) => {
            if (resp) {
                this.codigosBloqueoCuenta = resp['data']['listaEstadoCuenta'];
            }
        })
    }

    getCodigosBloqueoTarjeta() {
        this.ejecucionBloqueosService.getCodigosBloqueoTarjeta().subscribe((resp: any) => {
            if (resp) {
                this.codigosBloqueoTarjeta = resp['data']['listaEstadoTarjeta'];
            }
        })
    }

    getLoteBloqueo() {
        this.ffinRango = null;
        this.fIniRango = null;

        this.datosLote = [];
        this.datosDetallelote = [];

        this.numLoteSeleccionado = null;

        this.totalRecordsLote = 0;
        this.loadingDatosLote = true;

        const formValues = this.formBusqueda.value;
        const rangoFechas = formValues.fechaRangoBloqueo;
        const nroLote = formValues.nroLote;

        if (rangoFechas || nroLote) {
            if (rangoFechas) {
                if (rangoFechas[1]) {
                    if (nroLote) {
                        this.ffinRango = null;
                        this.fIniRango = null;
                    } else {
                        this.fIniRango = this.datePipe.transform(rangoFechas[0], 'yyyy-MM-dd');
                        this.ffinRango = this.datePipe.transform(rangoFechas[1], 'yyyy-MM-dd');
                    }
                } else {
                    this.toastr.add({ severity: 'warn', summary: 'Validacion de Fechas: ', detail: 'Se debe ingresar un intervalo de fechas' });
                    this.loadingDatosLote = false;
                    return;
                }
            }
        } else {
            this.loadingDatosLote = false;
            this.toastr.add({ severity: 'warn', summary: 'Validacion de filtros:', detail: 'Se debe ingresar al menos un filtro' });
            return;
        }

        this.historialBloqueos.getLote(this.first, this.rows, this.fIniRango, this.ffinRango, nroLote).subscribe((resp: any) => {
            this.loadingDatosLote = false;
            if (resp['codigo'] == 0) {
                this.datosLote = resp.data.content;
                this.totalRecordsLote = resp.data.totalElements;
            }
        }, (_error) => {
            this.loadingDatosLote = false;
            this.toastr.add({ severity: 'error', summary: 'Error getLoteBloqueo', detail: 'Error en el servicio de obtener los lotes' });
        });
    }

    onPage(event:any) {
        this.rows = event.rows;
        this.first = (event.first / this.rows);
        this.getLoteBloqueo();
    }

    onPageDetalle(event:any) {
        this.rowsDetalle = event.rows;
        this.firstDetalle = (event.first / this.rowsDetalle);

        const data = {
            id: this.numLoteSeleccionado
        }

        this.getDetalleBloqueos(data);
    }

    getDetalleBloqueos(data: any) {
        this.loadingDatosDetallelote = true;
        this.datosDetallelote = [];
        this.totalRecordsDetalle = 0;
        this.numLoteSeleccionado = data.id;

        this.historialBloqueos.getDetalleLote(this.firstDetalle, this.rowsDetalle, this.numLoteSeleccionado).subscribe((resp: any) => {
            if (resp['codigo'] == 0) {

                this.datosDetallelote = resp.data.content;
                this.totalRecordsDetalle = resp.data.totalElements;

                this.datosDetallelote = this.datosDetallelote.map((item: any) => {
                    let descBloqueo = '';
                    let descMotivo = '';
                    const descError = (item.huboError) ? (JSON.parse(item.response))['mensaje'] : '';
                    if (item.tokenTarjeta) {
                        const bloqueo = this.codigosBloqueoTarjeta.find(e => e.codigo === item.codigoBloqueo);
                        descBloqueo = bloqueo.descripcion;
                        const motivo = this.motivosBloqueoTarjeta.find(e => e.codigo === item.motivoBloqueo);
                        descMotivo = motivo.descripcion;
                    } else {
                        const bloqueo = this.codigosBloqueoCuenta.find(e => e.codigo === item.codigoBloqueo);
                        descBloqueo = bloqueo.descripcion;
                        const motivo = this.motivosBloqueoCuenta.find(e => e.codigo === item.motivoBloqueo);
                        descMotivo = motivo.descripcion;
                    }
                    return {
                        descError,
                        descBloqueo,
                        descMotivo,
                        ...item
                    }
                });
            }

            this.loadingDatosDetallelote = false;
        }, (_error => {
            this.toastr.add({ severity: 'error', summary: 'Error getDetalleBloqueos', detail: 'Error en el servicio de obtener el detalle del lote' });
            this.loadingDatosDetallelote = false;
        }));
    }

    descargarExcel() {
        const fechaReporte = new Date();
        const excelName = 'Reporte Detalle Lote : ' + moment(fechaReporte).format('DD/MM/YYYY') + '.xlsx';
        const sheetName = 'Datos';
        const datos: any[] = [];
        const header: string[] = [];
        const isCurrency: any[] = [];
        const filterLavel = 'Fecha de Reporte';

        header.push(
            'UID Cliente',
            'UID Cuenta',
            'Token',
            'Código Bloqueo',
            'Descripción Bloqueo',
            'Motivo Bloqueo',
            'Descripción Motivo',
            'Descripción',
            'Error'
        );

        this.historialBloqueos.getDetalleLote(0, this.totalRecordsDetalle, this.numLoteSeleccionado).subscribe((resp: any) => {
            if (resp['codigo'] == 0) {
                for (const x of resp['data'].content) {
                    x.descError = (x.huboError) ? (JSON.parse(x.response))['mensaje'] : '';
                    if (x.tokenTarjeta) {
                        const bloqueo = this.codigosBloqueoTarjeta.find(e => e.codigo === x.codigoBloqueo);
                        x.descBloqueo = bloqueo.descripcion;
                        const motivo = this.motivosBloqueoTarjeta.find(e => e.codigo === x.motivoBloqueo);
                        x.descMotivo = motivo.descripcion;
                    } else {
                        const bloqueo = this.codigosBloqueoCuenta.find(e => e.codigo === x.codigoBloqueo);
                        x.descBloqueo = bloqueo.descripcion;
                        const motivo = this.motivosBloqueoCuenta.find(e => e.codigo === x.motivoBloqueo);
                        x.descMotivo = motivo.descripcion;
                    }

                    const list = [
                        x.uidcliente,
                        x.uidCuenta,
                        x.tokenTarjeta,
                        x.codigoBloqueo,
                        x.descBloqueo,
                        x.motivoBloqueo,
                        x.descMotivo,
                        x.detalle,
                        x.descError
                    ];
                    datos.push(list);
                }

                this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, fechaReporte, filterLavel);
            }

            this.loadingDatosDetallelote = false;
        }, (_error => {
            this.toastr.add({ severity: 'error', summary: 'Error getDetalleBloqueos', detail: 'Error en el servicio de obtener el detalle del lote' });
            this.loadingDatosDetallelote = false;
        }));
    }

    clearBusquedaFiltros() {
        this.formBusqueda.patchValue({
            fechaRangoBloqueo: null,
            nroLote: null
        });
    }
}
