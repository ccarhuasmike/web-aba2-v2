import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import moment from 'moment';
import { HistorialSolicitudesService } from './historial-solicitudes.service';
import { SolicitudObservadaDetalleComponent } from './modals/detalle/solicitud-observada-detalle.component';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuItem, MessageService } from 'primeng/api';
import { UtilService } from '@/utils/util.services';
import { CALENDAR_DETAIL } from '@/layout/Utils/constants/aba.constants';
import { CommonService } from '@/pages/service/commonService';
import { ExcelService } from '@/pages/service/excel.service';

@Component({
    selector: 'app-historial-solicitudes',
    templateUrl: './historial-solicitudes.component.html',
    styleUrls: ['./historial-solicitudes.component.scss'],    
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        AccordionModule,
        AutoCompleteModule,
        ButtonModule,
        CommonModule,
        DatePickerModule,
        InputTextModule,
        MenuModule,
        ReactiveFormsModule,
        TableModule,
        TooltipModule
    ],
    providers: [DatePipe, DialogService,MessageService]
})
export class HistorialSolicitudesComponent implements OnInit {

    searchForm!: FormGroup;
    es = CALENDAR_DETAIL
    nroCaracter: number = 0;
    panelOpenState: string[] = ['0'];
    tipoDocumentos: any[]=[];
    tipoMonedas: any[]=[];
    tipoCanal: any[]=[];
    filteredElementTipoDocumento: any[]=[];
    datosSolicitudesObservadas: any[] = [];
    rows = 15;
    cols = [
        { header: '', nomProperty: '' },
        { header: 'Fecha Hora Registro', nomProperty: 'fechaHoraRegistroConvert' },
        { header: 'Tipo Doc.', nomProperty: 'tipoDoc' },
        { header: 'Número Doc.', nomProperty: 'numeroDoc' },
        { header: '1er. Nombre', nomProperty: 'primerNombre' },
        { header: '2do. Nombre', nomProperty: 'segundoNombre' },
        { header: 'Apellido Pat.', nomProperty: 'apellidoPaterno' },
        { header: 'Apellido Mat.', nomProperty: 'apellidoMaterno' },
        { header: 'Celular', nomProperty: 'celular' },
        { header: 'Correo', nomProperty: 'email' },
        { header: 'Usuario Crea.', nomProperty: 'usuarioCreacion' },
        { header: 'Canal', nomProperty: 'descCanal' }
    ];

    colsExcel = [
        { header: '', nomProperty: '' },
        { header: 'Fecha Hora Registro', nomProperty: 'fechaHoraRegistroConvert' },
        { header: 'Tipo Doc.', nomProperty: 'tipoDoc' },
        { header: 'Número Doc.', nomProperty: 'numeroDoc' },
        { header: 'Tratam. Datos Obligatorios', nomProperty: 'flgAceptTratamDatosObligatorio' },
        { header: 'Tratam. Datos Opcionales', nomProperty: 'flgAceptTratamDatosOpcional' },
        { header: '1er. Nombre', nomProperty: 'primerNombre' },
        { header: '2do. Nombre', nomProperty: 'segundoNombre' },
        { header: 'Apellido Pat.', nomProperty: 'apellidoPaterno' },
        { header: 'Apellido Mat.', nomProperty: 'apellidoMaterno' },
        { header: 'Sexo', nomProperty: 'sexo' },
        { header: 'Fecha Nac.', nomProperty: 'fechaNacimiento' },
        { header: 'Estado Civil', nomProperty: 'estadoCivil' },
        { header: 'Celular', nomProperty: 'celular' },
        { header: 'Correo', nomProperty: 'email' },
        { header: 'Misma Direc. DNI', nomProperty: 'flgMismaDireccionDni' },
        { header: 'Tipo Vivienda', nomProperty: 'tipoVivienda' },
        { header: 'Departamento', nomProperty: 'departamento' },
        { header: 'Provincia', nomProperty: 'provincia' },
        { header: 'Distrito', nomProperty: 'distrito' },
        { header: 'Dirección', nomProperty: 'direccion' },
        { header: 'Referencia Direc.', nomProperty: 'referenciaDireccion' },
        { header: 'Pep', nomProperty: 'flgPep' },
        { header: 'Tipo Ocupación', nomProperty: 'tipoOcupacion' },
        { header: 'Nombre Empresa', nomProperty: 'nombreEmpresa' },
        { header: 'Nombre Negocio', nomProperty: 'nombreNegocio' },
        { header: 'Fecha Ingr. Laboral', nomProperty: 'fechaIngresoLaboral' },
        { header: 'Cargo Act.', nomProperty: 'cargoActual' },
        { header: 'Ingreso Mens.', nomProperty: 'ingresoMensual' },
        { header: 'Neg. Propio', nomProperty: 'flgNegocioPropio' },
        { header: 'Act. Ocupación', nomProperty: 'actividadOcupacion' },
        { header: 'Giro Neg.', nomProperty: 'giroNegocio' },
        { header: 'Tiene RUC', nomProperty: 'flgRuc' },
        { header: 'RUC', nomProperty: 'ruc' },
        { header: 'Acept. Contrato', nomProperty: 'flgAceptacionContrato' },
        { header: 'Moneda', nomProperty: 'descMoneda' },
        { header: 'Nro. Paso', nomProperty: 'paso' },
        { header: 'Usuario Crea.', nomProperty: 'usuarioCreacion' },
        { header: 'Canal', nomProperty: 'descCanal' },
        { header: 'Cód. Agencia', nomProperty: 'codigoAgencia' },
        { header: 'Tipo Producto', nomProperty: 'tipoProducto' },
        { header: 'Cód CallCenter', nomProperty: 'codCallCenter' },
        { header: 'Detalle Observacion', nomProperty: 'observacionRechazo' }
    ]
    constructor(
        private readonly datePipe: DatePipe,
        private readonly toastr: MessageService,
        private readonly excelService: ExcelService,
        private readonly commonService: CommonService,
        private readonly solicitudesService: HistorialSolicitudesService,
        private readonly dialogService: DialogService
    ) {
        this.createForm();
    }
    ngOnInit() {
        this.getCombos();
    }

    createForm() {
        this.searchForm = new FormGroup({
            rangoFechas: new FormControl(null, [Validators.required]),
            tipoDocumentos: new FormControl(null, [Validators.required]),
            numDocumento: new FormControl(null, [Validators.required])
        })
    }

    getCombos() {
        const parametros = this.commonService.getParametrosAhorros([
            'TIPO_DOCUMENTO',
            'TIPO_MONEDA_TRAMA',
            'TIPO_CANAL_TRAMA'
        ]);

        this.tipoDocumentos = parametros['TIPO_DOCUMENTO']!
            .filter((item: any) => item['valCadCorto'] != 'RUC' && item['valCadCorto'] != 'PASAPORTE')
            .map((item: any) => {
                return {
                    id: item['valCadCorto'],
                    descripcion: item['valCadCorto']
                }
            });

        this.tipoMonedas = parametros['TIPO_MONEDA_TRAMA']!
            .map((item: any) => {
                return {
                    id: item['valNumEntero'],
                    descripcion: item['valCadLargo']
                }
            });

        this.tipoCanal = parametros['TIPO_CANAL_TRAMA']!
            .map((item: any) => {
                return {
                    id: item['valCadCorto'],
                    descripcion: item['valCadLargo']
                }
            });
    }

    getSolicitudesObservadas() {
        const fechaRango = this.searchForm.get('rangoFechas')?.value;
        const tipoDocumento = this.searchForm.get('tipoDocumentos')!.value?.id || '';
        const numDocumento = this.searchForm.get('numDocumento')!.value || '';

        let fini = '';
        let ffin = '';

        if (!fechaRango && !tipoDocumento && !numDocumento) {
            this.toastr.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe ingresar al menos un filtro' });
        } else {
            if (fechaRango) {
                if (fechaRango.length === 2 && fechaRango[1]) {
                    fini = moment(fechaRango[0]).format('YYYY-MM-DD');
                    ffin = moment(fechaRango[1]).format('YYYY-MM-DD');
                } else {
                    this.toastr.add({ severity: 'warn', summary: 'Advertencia', detail: 'El rango de fechas debe ser válido' });
                }
            }

            if ((tipoDocumento && !numDocumento) || (!tipoDocumento && numDocumento)) {
                this.toastr.add({ severity: 'warn', summary: 'Advertencia', detail: 'Tipo o número de documento inválido' });
            }
        }

        this.datosSolicitudesObservadas = [];

        const request = {
            fechaDesde: fini,
            fechaHasta: ffin,
            tipoDoc: tipoDocumento,
            numeroDoc: numDocumento
        };

        this.solicitudesService.postConsultaSolicitudesRechazadas(request).subscribe((resp: any) => {
            if (resp) {
                if (resp['codigo'] == 0) {
                    this.datosSolicitudesObservadas = resp.data.map((item: any) => {
                        const tipoMoneda = this.tipoMonedas.find(e => e.id === +item.moneda);
                        const descMoneda = tipoMoneda?.descripcion || '';
                        const tipoCanal = this.tipoCanal.find(e => e.id === item.canal)
                        const descCanal = tipoCanal?.descripcion || '';
                        const fechaHoraRegistroConvert = this.datePipe.transform(item.fechaHoraRegistro, 'dd/MM/yyyy HH:mm:ss')
                        const fechaNacimientoConvert = this.datePipe.transform(item.fechaNacimiento, 'dd/MM/yyyy');
                        const fechaIngresoLaboralConvert = this.datePipe.transform(item.fechaIngresoLaboral, 'dd/MM/yyyy');

                        return {
                            ...item,
                            descMoneda,
                            descCanal,
                            fechaHoraRegistroConvert,
                            fechaNacimientoConvert,
                            fechaIngresoLaboralConvert
                        }
                    })
                } else {
                    this.toastr.add({ severity: 'error', summary: 'Error getSolicitudesObservadas', detail: resp['mensaje'] });
                }
            }
        }, (_error) => {
            this.toastr.add({ severity: 'error', summary: 'Error getSolicitudesObservadas', detail: 'Error en el servicio de obtener solicitudes rechazadas de ahorros oh' });
        })
    }

    openDialogDetalle(data: any) {
        this.dialogService.open(SolicitudObservadaDetalleComponent, {
            header: 'Detalle Informacion Solicitud Observada',
            width: '60vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: {
                '960px': '80vw',
                '640px': '95vw'
            },
            data: data
        });
    }

    menuItems: MenuItem[] = [];

    onRowMenuClick(event: Event, rowData: any, menu: any) {
        this.menuItems = this.getMenuItems(rowData, menu);
        menu.toggle(event);
    }

    getMenuItems(rowData: any, menu?: any): MenuItem[] {
        return [
            {
                label: 'Ver Detalle',
                icon: 'pi pi-eye',
                command: () => this.executeMenuAction(() => this.openDialogDetalle(rowData), menu)
            }
        ];
    }

    private executeMenuAction(action: () => void, menu?: any): void {
        setTimeout(() => {
            action();
            menu?.hide();
        }, 5);
    }

    exportExcel() {
        const date = new Date();
        const excelName = 'Reporte Solicitudes Observadas ' + moment(date).format('DD/MM/YYYY') + '.xlsx';
        const sheetName = 'Datos';
         const datos: any[] = [];
        const header: string[] = [];
        const isCurrency: any[] = [];
        const filterLavel = 'Fecha de Reporte';

        this.colsExcel.forEach((element: any, index: number) => {
            if (index > 0) {
                header.push(element.header);
            }
        });

        this.datosSolicitudesObservadas.forEach(x => {
            const list = [
                x.fechaHoraRegistroConvert,
                x.tipoDoc,
                x.numeroDoc,
                x.flgAceptTratamDatosObligatorio,
                x.flgAceptTratamDatosOpcional,
                x.primerNombre,
                x.segundoNombre,
                x.apellidoPaterno,
                x.apellidoMaterno,
                x.sexo,
                x.fechaNacimientoConvert,
                x.estadoCivil,
                x.celular,
                x.email,
                x.flgMismaDireccionDni,
                x.tipoVivienda,
                x.departamento,
                x.provincia,
                x.distrito,
                x.direccion,
                x.referenciaDireccion,
                x.flgPep,
                x.tipoOcupacion,
                x.nombreEmpresa,
                x.nombreNegocio,
                x.fechaIngresoLaboralConvert,
                x.cargoActual,
                x.ingresoMensual,
                x.flgNegocioPropio,
                x.actividadOcupacion,
                x.giroNegocio,
                x.flgRuc,
                x.ruc,
                x.flgAceptacionContrato,
                x.descMoneda,
                x.paso,
                x.usuarioCreacion,
                x.descCanal,
                x.codigoAgencia,
                x.tipoProducto,
                x.codCallCenter,
                x.observacionRechazo
            ];

            datos.push(list);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);

    }

    changeModelTipoDocumento(event: any) {
        if (event) {
            if (event.id == 'DNI') {
                this.nroCaracter = 8;
            }

            if (event.id == 'CE') {
                this.nroCaracter = 9;
            }

            if (event.id == 'PASAPORTE') {
                this.nroCaracter = 10;
            }
        }
    }


    filterElementTipoDocumento(event: any, data: any) {
        this.filteredElementTipoDocumento = [];
        const query = event?.query ?? '';
        this.filteredElementTipoDocumento = UtilService.filterByField(data, query, 'descripcion');
    }
    clearBusquedaFiltros() {
        this.createForm();
        this.nroCaracter = 0;
    }
}