import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';

import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DisableContentByRoleDirective } from '@/layout/Utils/directives/disable-content-by-role.directive';
import { CALENDAR_DETAIL, ESTADOS_SOLUCION_OBS, ORIGENES_TRANSACTION_OBS, TIPO_TERMINAL, ROLES } from '@/layout/Utils/constants/aba.constants';
import { ExcelService } from '@/pages/service/excel.service';
import { CommonService } from '@/pages/service/commonService';
import { TransaccionesObservadasService } from './transacciones-observadas.service';
import { DetalleTrxObservadaComponent } from './modals/detalle-trx-observada/detalle-trx-observada.component';
import { SolucionTrxObservadaComponent } from './modals/solucion-trx-observada/solucion-trx-observada.component';
import moment from 'moment';
import { DialogService } from 'primeng/dynamicdialog';
import { DatePickerModule } from 'primeng/datepicker';

type MenuItemWithRoles = MenuItem & { restrictedRoles?: string[] };

@Component({
    selector: 'app-transacciones-observadas',
    templateUrl: './transacciones-observadas.component.html',
    styleUrls: ['./transacciones-observadas.component.scss'],
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
        PaginatorModule,
        ReactiveFormsModule,
        TableModule,
        TooltipModule
    ],
    providers: [MessageService, DatePipe, CurrencyPipe, DialogService]
})
export class TransaccionesObservadasComponent implements OnInit {

    formObservedTransaction: FormGroup;

    data: any[] = [];
    cols: any[] = [];
    rows = 50; //Valor anterior 100
    first = 0;
    totalRecords = 0;

    panelOpenState: string | string[] | null = 'filters';
    fini: string = moment().format('YYYY-MM-DD');
    ffin: string = moment().format('YYYY-MM-DD');
    es = CALENDAR_DETAIL;

    filteredElementOrigen: any[]= [];
    filteredElementTipoSolucion: any[]= [];
    filteredElementEstado: any[]= [];

    roles: any = ROLES;
    origenes: any[] = ORIGENES_TRANSACTION_OBS;
    estados: any[] = ESTADOS_SOLUCION_OBS;
    tiposTerminal: any[] = TIPO_TERMINAL;
    tipoSoluciones: any[] = [];
    tipoMonedas: any[] = [];
    tipoDocumentos: any[] = [];

    uidCliente = '';
    uidCuenta = '';

    constructor(
        public datePipe: DatePipe,
        public currencyPipe: CurrencyPipe,
        private excelService: ExcelService,
        private commonService: CommonService,
        private transaccionesObservadasService: TransaccionesObservadasService,
        private readonly messageService: MessageService,
        private readonly dialog: DialogService
    ) {
        this.formObservedTransaction = new FormGroup({
            id: new FormControl(null),
            tarjeta: new FormControl(null),
            origen: new FormControl(null),
            tipoSolucion: new FormControl(null),
            estado: new FormControl(this.estados[0], [Validators.required]),
            fechaRango: new FormControl(null, [Validators.required]),
        });
    }

    ngOnInit(): void {
        this.cols = [
            { field: '', header: 'Opciones' },
            { field: 'id', header: 'ID Trans. Observada' },
            { field: 'fechaCreacionConvert', header: 'Fecha Apertura' },
            { field: 'fechaActualizacionConvert', header: 'Fecha Cierre' },
            { field: 'fechaProcesoDiarioConvert', header: 'Fecha de Proceso' },
            { field: 'motivoEstado', header: 'Motivo' },
            { field: 'descripcionEstado', header: 'Estado' },
            { field: 'data.procesador.transaccion.descOrigen', header: 'Origen' },
            { field: 'data.entrada.MCD4TARE', header: 'Token Tarjeta' },
            { field: 'data.entrada.MCTIAREN', header: 'Número Referencia' },
            { field: 'data.entrada.MCTIAUTO', header: 'Código Autorización' },
            { field: 'data.entrada.MCTIFTRAConvert', header: 'Fecha Transacción' },
            { field: 'data.entrada.MCTIIMPOConvert', header: 'Monto Transacción' },
            { field: 'data.entrada.MCTIMONEDesc', header: 'Moneda Transacción' },
            { field: 'data.entrada.MCTIIMADConvert', header: 'Monto Divisa' },
            { field: 'data.entrada.MCTIMOADDesc', header: 'Moneda Divisa' },
            { field: 'data.entrada.MCTICEST', header: 'Codigo Comercio' },
            { field: 'data.entrada.MCTINEST', header: 'Nombre Comercio' },
            { field: 'data.entrada.MCTIMCC', header: 'Actividad Comercio' },
            { field: 'data.entrada.MCTIPAIS', header: 'País Comercio' },
            { field: 'data.entrada.MCTICIUD', header: 'Ciudad Comercio' },
            { field: 'data.entrada.MCTITITEDesc', header: 'Tipo Terminal' },
        ];

        this.commonService.getMultipleCombosPromise([
            'TIPO_MONEDA_TRAMA',
            'TIPO_SOLUCION_TRX_OBS'
        ]).then((resp:any[]) => {
            this.tipoMonedas = resp[0]['data'];
            this.tipoSoluciones = resp[1]['data']
                .filter((item: any) =>
                    item.valCadCorto !== '01' &&
                    item.valCadCorto !== '07'
                ).map((item: any) => {
                    return {
                        id: item.valCadCorto,
                        descripcion: item.desElemento
                    }
                });
        });

        this.commonService.getMultipleCombosPromiseCliente(['documentos/tipos']).then(resp => {
            this.tipoDocumentos = resp[0].data.content.map((item: any) => {
                return {
                    id: item['codigo'],
                    descripcion: item['nombre']
                }
            });
        });

    }

    getTransaccionesObservadas() {

        const form = this.formObservedTransaction.value;

        this.data = [];

        let fechaDesde = '';
        let fechaHasta = '';

        if (form.fechaRango && form.fechaRango[0] && form.fechaRango[1]) {
            fechaDesde = moment(form.fechaRango[0]).format('YYYY-MM-DD');
            fechaHasta = moment(form.fechaRango[1]).format('YYYY-MM-DD');
        }

        const estado = form.estado.id;
        const tamanio = this.rows;
        const pagina = this.first / this.rows + 1;
        this.transaccionesObservadasService.getTransaccionesObservadas(
            fechaDesde,
            fechaDesde,
            fechaHasta,
            estado,
            pagina,
            tamanio
        ).subscribe((resp: any) => {
            if (resp['codigo'] == 0) {
                let originalData = resp.data.items;
                this.totalRecords = resp.data.total;
                this.data = this.convertDataToVista(originalData);
            } else if (resp['codigo'] == -1) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error getTransaccionesObservadas',
                    detail: resp['mensaje'] || 'Error inesperado'
                });
            }
        }, (_error) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error getTransaccionesObservadas',
                detail: 'Error en el servicio de obtener transacciones observadas'
            });
        });
    }

    onPageChange(event:any) {
        this.rows = event.rows;
        this.first = event.first;
        this.getTransaccionesObservadas();
    }

    search() {
        this.getTransaccionesObservadas();
    }

    clear() {
        this.formObservedTransaction.reset({
            estado: this.estados[0],
            fechaRango: null
        });
    }

    filterElementOrigen(event:any, data:any) {
        this.filteredElementOrigen = [];
        const query = event.query;
        for (const element of data) {
            if (element.descripcion.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                this.filteredElementOrigen.push(element);
            }
        }
    }

    filterElementTipoSolucion(event:any, data:any) {
        this.filteredElementTipoSolucion = [];
        const query = event.query;
        for (const element of data) {
            if (element.descripcion.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                this.filteredElementTipoSolucion.push(element);
            }
        }
    }

    filterElementEstado(event:any, data:any) {
        this.filteredElementEstado = [];
        const query = event.query;
        for (const element of data) {
            if (element.descripcion.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                this.filteredElementEstado.push(element);
            }
        }
    }

    getRowMenuItems(rowData: any): MenuItemWithRoles[] {
        return [
            {
                label: 'Ver detalle',
                icon: 'pi pi-eye',
                command: () => this.openDialogDetalle(rowData)
            },
            {
                label: 'Solucionar',
                icon: 'pi pi-wrench',
                command: () => this.openDialogSolucion(rowData),
                disabled: rowData.estado == '02',
                restrictedRoles: [
                    this.roles.OPERACION_CONTABLE,
                    this.roles.FRAUDE,
                    this.roles.PLAFT,
                    this.roles.ATENCION_CLIENTE_TD,
                    this.roles.CONSULTA
                ]
            },
            {
                label: 'Ir a la cuenta',
                icon: 'pi pi-reply',
                command: () => this.getCuentaCliente(rowData)
            }
        ];
    }

    openDialogDetalle(data: any): void {
        this.dialog.open(DetalleTrxObservadaComponent, {
            header: 'Detalle Transacción',
            width: '60vw',
            data: {
                dataTrxObservada: data
            },
            styleClass: 'header-modal',
            breakpoints: {
                '960px': '80vw',
                '640px': '95vw'
            }
        });
    }

    openDialogSolucion(data: any): void {
        const dialogRef = this.dialog.open(SolucionTrxObservadaComponent, {
            header: 'Solución Transacción',
            width: '70vw',
            data: {
                datosTrxObservadas: data,
                tipoDocumentos: this.tipoDocumentos
            },
            styleClass: 'header-modal',
            breakpoints: {
                '960px': '85vw',
                '640px': '95vw'
            }
        });

        dialogRef?.onClose.subscribe((resp:any) => {
            if (resp?.data && resp.data['codigo'] === 0) {
                this.search();
            }
        });
    }

    getCuentaCliente(row: any) {

        const token = row.data.entrada.MCD4TARE;

        this.transaccionesObservadasService.getCuentaPorTokenTarjeta(token)
            .subscribe(async (resp:any) => {
                if (resp['codigo'] == 0) {

                    const tipoDocumento = this.tipoDocumentos.find((item: any) => item.id === resp['data'].tipoDocIdent);

                    if (tipoDocumento) {
                        const tipoDocumentoId = tipoDocumento.id;
                        const descDocumento = tipoDocumento.descripcion;
                        const nroDocumento = resp['data'].numeroDocIdent;
                        const numeroCuenta = resp['data'].numeroCuenta;

                        const url = `/apps/consultas/autorizaciones;tipoDocumento=${tipoDocumentoId};descDocumento=${descDocumento};nroDocumento=${nroDocumento};numeroCuenta=${numeroCuenta}`;

                        window.open(url, '_blank');
                    }
                } else if (resp['codigo'] == -1) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error getCuenta',
                        detail: resp['mensaje'] || 'Error inesperado'
                    });
                }
            }, (_error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error getCuenta',
                    detail: 'Error en el servicio de obtener cuenta'
                });
            });
    }

    convertDataToVista(data: any): any {

        const form = this.formObservedTransaction.value;

        let dataConverted = data.map((item: any) => {
            item['fechaCreacionConvert'] = item.fechaCreacion ? this.datePipe.transform(item.fechaCreacion, 'dd/MM/yyyy') : null;

            item['fechaActualizacionConvert'] = item.fechaActualizacion ? this.datePipe.transform(item.fechaActualizacion, 'dd/MM/yyyy') : null;

            const fechaProcesoDiario = new Date(item.fechaProcesoDiario);
            fechaProcesoDiario.setHours(fechaProcesoDiario.getHours() - 5);
            item['fechaProcesoDiarioConvert'] = item.fechaProcesoDiario ? this.datePipe.transform(item.fechaProcesoDiario, 'dd/MM/yyyy') : null;

            item.data.entrada['MCTIFTRAConvert'] = this.commonService.dateFormatAAMMDD(item.data.entrada.MCTIFTRA);

            item.data.entrada['MCTIIMPOConvert'] = this.currencyPipe.transform(item.data.entrada.MCTIIMPO / 100, ' ', 'symbol', '1.2-2');

            item['descripcionEstado'] = item.estado == '01' ? 'ABIERTO' : 'CERRADO';

            const monedaTrx = this.tipoMonedas.find(e => e.valNumEntero == item.data.entrada.MCTIMONE);
            item.data.entrada['MCTIMONEDesc'] = monedaTrx?.valCadLargo;

            item.data.entrada['MCTIIMADConvert'] = this.currencyPipe.transform(item.data.entrada.MCTIIMAD / 100, ' ', 'symbol', '1.2-2');
            // SMCCB
            if (item.data.entrada.MCTIMOAD === null || item.data.entrada.MCTIMOAD === undefined) {
                item.data.entrada['MCTIMOADDesc'] = "DOLARES";
            } else {
                const monedaDiv = this.tipoMonedas.find(e => e.valNumEntero == item.data.entrada.MCTIMOAD);
                if (monedaDiv === null || monedaDiv === undefined) {
                    item.data.entrada['MCTIMOADDesc'] = "DOLARES";
                } else {
                    item.data.entrada['MCTIMOADDesc'] = monedaDiv?.valCadLargo;
                }
            }
            // const monedaDiv = this.tipoMonedas.find(e => e.valNumEntero == item.data.entrada.MCTIMOAD);
            // item.data.entrada['MCTIMOADDesc'] = monedaDiv?.valCadLargo;

            const terminal = this.tiposTerminal.find((e: any) => e.codigo == item.data.entrada.MCTITITE);
            item.data.entrada['MCTITITEDesc'] = terminal?.descripcion;


            if (item.data.procesador) {
                if (item.data.procesador.transaccion) {
                    const origen = this.origenes.find((e: any) => e.id == item.data.procesador.transaccion?.descOrigen);
                    item.data.procesador.transaccion!.descripcionOrigen = origen?.descripcion;
                }
            }
            const tipoSolucion = this.tipoSoluciones.find((e: any) => e.id == item.tipoSolucion);
            item.descTipoSolucion = tipoSolucion?.descripcion;

            return item;
        }).filter((item: any) => {
            if (form.id && item.id !== form.id) {
                return false;
            }
            if (form.tarjeta && item.data.entrada.MCD4TARE !== form.tarjeta) {
                return false;
            }
            if (item.data.procesador) {
                if (item.data.procesador.transaccion) {
                    if (form.origen && item.data.procesador.transaccion?.descOrigen !== form.origen.id) {
                        return false;
                    }
                }
            }
            if (form.tipoSolucion && item.tipoSolucion !== form.tipoSolucion.id) {
                return false;
            }
            return true;
        });

        return dataConverted;
    }

    paginasConsultar(): number[] {
        const pageActual = this.first / this.rows + 1
        const pageFinal = Math.ceil(this.totalRecords / this.rows);

        let listaPaginas: number[] = [];

        for (let index = 1; index <= pageFinal; index++) {
            (index != pageActual) ? listaPaginas.push(index) : null;
        }

        return listaPaginas;
    }

    async exportExcel() {
        const date = new Date();
        const excelName = 'Reporte consultas transacciones observadas ' + moment(date).format('DD/MM/YYYY') + '.xlsx';
        const sheetName = 'Datos';
        const datos :any[]= [];
        const header:any[] = [];
        const isCurrency:any[] = [];
        const filterLavel = 'Fecha de Reporte';

        const form = this.formObservedTransaction.value;
        const estado = form.estado.id;

        let fechaDesde = '';
        let fechaHasta = '';

        if (form.fechaRango && form.fechaRango[0] && form.fechaRango[1]) {
            fechaDesde = moment(form.fechaRango[0]).format('YYYY-MM-DD');
            fechaHasta = moment(form.fechaRango[1]).format('YYYY-MM-DD');
        }

        this.cols.forEach((element: any) => {
            (element.header != 'Opciones') ? header.push(element.header) : null;
        });

        //Logica para obtener la data y paginacion
        let tamanio = this.rows;
        let pagina = this.first / this.rows + 1; //first 1ra vez es 0 y de ahi es el index del row que se muestra
        let listadoData = [];

        const listadoPaginasConsultar = this.paginasConsultar(); //[1,2,4,5] - pagActual=3
        if (listadoPaginasConsultar.length == 1) {
            listadoData[0] = this.data;
        } else {
            await this.transaccionesObservadasService.getMultipleTransaccionesObservadasPromise(
                listadoPaginasConsultar,
                fechaDesde,
                fechaDesde,
                fechaHasta,
                estado,
                tamanio
            ).then(resp => {
                for (let index = 0; index < listadoPaginasConsultar.length; index++) {
                    listadoData[listadoPaginasConsultar[index]] = this.convertDataToVista(resp[index].data.items)
                }

                listadoData[pagina] = this.data;
            })
        }

        listadoData.forEach((dataPagina: any[]) => {
            dataPagina.forEach(row => {
                const list = [];

                list.push(row.id);
                list.push(row.fechaCreacionConvert);
                list.push(row.fechaActualizacionConvert);
                list.push(row.fechaProcesoDiarioConvert);
                list.push(row.motivoEstado);
                list.push(row.descripcionEstado);
                list.push(row.data.procesador?.transaccion?.descripcionOrigen);
                list.push(row.data.entrada.MCD4TARE);
                list.push(row.data.entrada.MCTIAREN);
                list.push(row.data.entrada.MCTIAUTO);
                list.push(row.data.entrada.MCTIFTRAConvert);
                list.push(row.data.entrada.MCTIIMPOConvert);
                list.push(row.data.entrada.MCTIMONEDesc);
                list.push(row.data.entrada.MCTIIMADConvert);
                list.push(row.data.entrada.MCTIMOADDesc);
                list.push(row.data.entrada.MCTICEST);
                list.push(row.data.entrada.MCTINEST);
                list.push(row.data.entrada.MCTIMCC);
                list.push(row.data.entrada.MCTIPAIS);
                list.push(row.data.entrada.MCTICIUD);
                list.push(row.data.entrada.MCTITITEDesc);

                datos.push(list);
            });
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
    }
}
