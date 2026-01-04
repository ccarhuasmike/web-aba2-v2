import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EjecucionSolicitudesService } from './ejecucion-solicitudes.service';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ExcelService } from '@/pages/service/excel.service';
import { CommonService } from '@/pages/service/commonService';

@Component({
    selector: 'app-ejecucion-solicitudes',
    templateUrl: './ejecucion-solicitudes.component.html',
    styleUrls: ['./ejecucion-solicitudes.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        ButtonModule,
        CommonModule,
        DividerModule,
        FileUploadModule,
        InputTextModule,
        TableModule,
        TooltipModule
    ],
    providers: [MessageService]
})

export class EjecucionSolicitudesComponent implements OnInit {

    tipoDocumentos: any[] = [];
    tipoMonedas: any[] = [];

    dataSolicitudes: any[] = [];
    filesSolicitud: any[] = [];
    existError: boolean = false;
    counterSolicitud = 0;

    loadingRecordsSolicitud: boolean = false;
    leakedDataSolicitud: any[] = [];

    headersExcel: any[] = [
        'tipoDoc',
        'numeroDoc',
        'flgAceptTratamDatosObligatorio',
        'flgAceptTratamDatosOpcional',
        'primerNombre',
        'segundoNombre',
        'apellidoPaterno',
        'apellidoMaterno',
        'sexo',
        'fechaNacimiento',
        'estadoCivil',
        'celular',
        'email',
        'flgMismaDireccionDni',
        'tipoVivienda',
        'departamento',
        'provincia',
        'distrito',
        'direccion',
        'referenciaDireccion',
        'flgPep',
        'tipoOcupacion',
        'nombreEmpresa',
        'nombreNegocio',
        'fechaIngresoLaboral',
        'cargoActual',
        'ingresoMensual',
        'flgNegocioPropio',
        'actividadOcupacion',
        'giroNegocio',
        'flgRuc',
        'ruc',
        'codCallCenter',
    ];

    fakeHeadersSolicitud: any[] = [
        { header: 'tipoDoc', headerTable: 'Tipo documento' },
        { header: 'numeroDoc', headerTable: 'Núm documento' },
        { header: 'flgAceptTratamDatosObligatorio', headerTable: '¿Acepto Tratam. Datos Obligatorios?' },
        { header: 'flgAceptTratamDatosOpcional', headerTable: '¿Acepto Tratam. Datos Opcionales?' },
        { header: 'primerNombre', headerTable: 'Primer Nombre' },
        { header: 'segundoNombre', headerTable: 'Segundo Nombre' },
        { header: 'apellidoPaterno', headerTable: 'Apellido Paterno' },
        { header: 'apellidoMaterno', headerTable: 'Apellido Materno' },
        { header: 'sexo', headerTable: 'Sexo' },
        { header: 'fechaNacimiento', headerTable: 'Fecha Nacimiento' },
        { header: 'estadoCivil', headerTable: 'Estado Civil' },
        { header: 'celular', headerTable: 'Celular' },
        { header: 'email', headerTable: 'Correo Elec.' },
        { header: 'flgMismaDireccionDni', headerTable: '¿Tiene misma dirección DNI?' },
        { header: 'tipoVivienda', headerTable: 'Tipo de Vivienda' },
        { header: 'departamento', headerTable: 'Departamento' },
        { header: 'provincia', headerTable: 'Provincia' },
        { header: 'distrito', headerTable: 'Distrito' },
        { header: 'direccion', headerTable: 'Dirección' },
        { header: 'referenciaDireccion', headerTable: 'Referencia' },
        { header: 'flgPep', headerTable: '¿Es Pep?' },
        { header: 'tipoOcupacion', headerTable: 'Tipo de ocupación' },
        { header: 'nombreEmpresa', headerTable: 'Nombre de Empresa' },
        { header: 'nombreNegocio', headerTable: 'Nombre de Negocio' },
        { header: 'fechaIngresoLaboral', headerTable: 'Fecha Ingreso Laboral' },
        { header: 'cargoActual', headerTable: 'Cargo actual' },
        { header: 'ingresoMensual', headerTable: 'Ingreso mensual' },
        { header: 'flgNegocioPropio', headerTable: '¿Tiene negocio propio?' },
        { header: 'actividadOcupacion', headerTable: 'Actividad ocupación' },
        { header: 'giroNegocio', headerTable: 'Giro de negocio' },
        { header: 'flgRuc', headerTable: '¿Tiene RUC?' },
        { header: 'ruc', headerTable: 'Núm de RUC' },
        { header: 'codCallCenter', headerTable: 'Cód de CallCenter' },
        { header: 'ERROR', headerTable: 'ERROR' }
    ];

    headerSolicitud: any[] = [];
    bodyDataExcel: any[] = [];
    colsSolicitud: any[] = [];

    rows = 15;
    rowsPerPageOptions: number[] = [];

    constructor(
        private readonly toastr: MessageService,
        private readonly excelService: ExcelService,
        private readonly commonService: CommonService,
        private readonly solicitudesService: EjecucionSolicitudesService
    ) { }
    ngOnInit(): void {
        this.getCombos();
    }
    getCombos() {
        const parametros = this.commonService.getParametrosAhorros([
            'TIPO_DOCUMENTO',
            'TIPO_MONEDA_TRAMA'
        ]);

        this.tipoDocumentos = parametros['TIPO_DOCUMENTO']!
            .filter((item: any) => item['valCadCorto'] != 'RUC')
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
    }

    private validateField(fieldIndex: string, value: any, element: string, tipoDocumento: string, tieneRuc: boolean, msgError: string): { valor: any; error: string; fieldIndex: string } {
        const validationMap: { [key: string]: () => { error: boolean; message: string } } = {
            '0': () => ({ error: value == undefined || this.solicitudesService.validateTipoDoc(value, this.tipoDocumentos), message: 'El tipo de documento es inválido.' }),
            '1': () => ({ error: value == undefined || this.solicitudesService.validateNumeroDocu(value, tipoDocumento), message: 'El número de documento es inválido.' }),
            '2': () => ({ error: value == undefined || this.solicitudesService.validateFlagSiNo(value), message: 'El Flag de Tratamientos de datos obligatorios debe ser valido (Si/No).' }),
            '3': () => ({ error: value == undefined || this.solicitudesService.validateFlagSiNo(value), message: 'El Flag de Tratamientos de datos opcionales debe ser valido (Si/No).' }),
            '4': () => ({ error: value == undefined, message: 'El primer nombre es requerido.' }),
            '6': () => ({ error: value == undefined, message: 'El apellido paterno es requerido.' }),
            '7': () => ({ error: value == undefined, message: 'El apellido materno es requerido.' }),
            '8': () => ({ error: value == undefined || this.solicitudesService.validateGenero(value), message: 'El género debe ser valido (M ó F).' }),
            '9': () => ({ error: value == undefined || this.solicitudesService.validateFecha(value), message: 'La fecha de nacimiento debe ser válida.' }),
            '10': () => ({ error: value == undefined, message: 'El estado civil es requerido.' }),
            '11': () => ({ error: value == undefined || this.solicitudesService.validateNumTel(value), message: 'El número de celular es requerido.' }),
            '12': () => ({ error: value == undefined || this.solicitudesService.validateEmail(value), message: 'El correo electronico debe ser valido.' }),
            '13': () => ({ error: value == undefined || this.solicitudesService.validateFlagSiNo(value), message: 'El Flag de Misma direccion de DNI debe ser valido (Si/No).' }),
            '14': () => ({ error: value == undefined, message: 'El tipo de vivienda es requerido.' }),
            '15': () => ({ error: value == undefined || this.solicitudesService.validateUbigeo(value, 2), message: 'El código de departamento debe ser valido.' }),
            '16': () => ({ error: value == undefined || this.solicitudesService.validateUbigeo(value, 4), message: 'El código de provincia debe ser valido.' }),
            '17': () => ({ error: value == undefined || this.solicitudesService.validateUbigeo(value, 6), message: 'El código de distrito debe ser valido.' }),
            '18': () => ({ error: value == undefined, message: 'La dirección es requerido.' }),
            '21': () => ({ error: value == undefined, message: 'El tipo de ocupacion es requerido.' }),
            '32': () => ({ error: value == undefined, message: 'El código de call center es requerido.' })
        };

        if (validationMap[fieldIndex]) {
            const validation = validationMap[fieldIndex]();
            const errorMsg = validation.error ? msgError + '<li><i class="pi pi-times-circle"></i>' + validation.message + '</li>' : msgError;
            return { valor: value, error: errorMsg, fieldIndex };
        }

        return { valor: value || '', error: msgError, fieldIndex };
    }

    enviarListaSolicitudes() {
        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        const objSolicutdesLista = this.dataSolicitudes.map((item) => {
            let objItem: { [key: string]: any } = {};
            for (let key in item) {
                if (!(key == 'id' || key == 'ERROR')) {
                    objItem[key] = item[key]['valor']
                }
            }

            objItem['moneda'] = '604';
            objItem['paso'] = 3;
            objItem['canal'] = '03';
            objItem['codigoAgencia'] = '136';
            objItem['tipoProducto'] = '1';
            objItem['usuarioCreacion'] = usuario.email;

            return objItem;
        });

        this.solicitudesService.postRegistrar(objSolicutdesLista, usuario.email).subscribe((resp: any) => {
            if (resp) {
                if (resp['codigo'] == 0) {
                    this.toastr.add({ severity: 'success', summary: 'Éxito', detail: 'Se envio el listado de solicitues a registrar' });
                    this.removeAll();
                } else {
                    return this.toastr.add({ severity: 'warn', summary: 'Error enviarListaSolicitudes', detail: resp['mensaje'] });
                }
            }
        }, (_error) => {
            return this.toastr.add({ severity: 'error', summary: 'enviarListaSolicitudes', detail: 'Error en el servicio de procesar solicitudes de ahorros oh' });
        })
    }

    uploaderSolicitudes(event: any) {
        this.existError = false;
        this.filesSolicitud = event.files;
        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
            const bstr: string = e.target.result;
            const dataExcel = <any[]>this.excelService.importFromFile(bstr);
            this.headerSolicitud = dataExcel[0];

            if (JSON.stringify(this.headerSolicitud) !== JSON.stringify(this.headersExcel)) {
                this.counterSolicitud = 1;
                this.loadingRecordsSolicitud = false;
                this.toastr.add({ severity: 'error', summary: 'Error', detail: 'Cabeceras no válidas, por favor descargue formato carga trama solicitudes.xlsx' });
                return;
            }

            this.bodyDataExcel = dataExcel.slice(1);
            this.bodyDataExcel = this.bodyDataExcel.filter(item => item.length != 0);

            if (this.bodyDataExcel.length == 0) {
                this.counterSolicitud = 1;
                this.loadingRecordsSolicitud = false;
                this.toastr.add({ severity: 'error', summary: 'Error', detail: 'No se encontraron registros' });
                return;
            }

            if (this.bodyDataExcel.length > 1000) {
                this.counterSolicitud = 1;
                this.loadingRecordsSolicitud = false;
                this.toastr.add({ severity: 'error', summary: 'Error', detail: 'La cantidad de solicitudes debe ser 1000 como maximo' });
                return;
            }

            this.dataSolicitudes = this.bodyDataExcel.map((arr: any, index: number) => {
                const obj: { [key: string]: any } = {}
                obj['id'] = index;

                let msgError = '<ul>';
                let tipoDocumento = '';
                let tieneRuc = false;

                for (const key in this.headerSolicitud) {
                    const element = this.headerSolicitud[key];
                    let error = false;

                    // Handle special cases with conditional logic
                    if (key === "0") {
                        if (arr[key] == undefined || this.solicitudesService.validateTipoDoc(arr[key], this.tipoDocumentos)) {
                            error = true;
                            msgError = msgError + '<li><i class="pi pi-times-circle"></i>El tipo de documento es inválido.</li>';
                        }
                        tipoDocumento = arr[key];
                        obj[element] = { valor: arr[key], error: error ? msgError : '' }
                    } else if (key === "20") {
                        if (arr[key] == undefined || this.solicitudesService.validateFlagSiNo(arr[key])) {
                            error = true;
                            msgError = msgError + '<li><i class="pi pi-times-circle"></i>El Flag de Pep debe ser valido (Si/No).</li>';
                        } else {
                            tieneRuc = (arr[key].toUpperCase() == 'SI');
                        }
                        obj[element] = { valor: arr[key], error: error ? msgError : '' }
                    } else if (key === "24") {
                        if (arr[key]) {
                            error = this.solicitudesService.validateFecha(arr[key]);
                            msgError = (error) ? msgError + '<li><i class="pi pi-times-circle"></i>La fecha de ingreso laboral debe ser valido.</li>' : msgError;
                        }
                        obj[element] = { valor: arr[key], error: error ? msgError : '' }
                    } else if (key === "27") {
                        if (arr[key] != undefined) {
                            error = this.solicitudesService.validateFlagSiNo(arr[key]);
                            msgError = (error) ? msgError + '<li><i class="pi pi-times-circle"></i>El Flag de Negocio propio debe ser valido (Si/No).</li>' : msgError;
                        }
                        obj[element] = { valor: arr[key] || '', error: error ? msgError : '' }
                    } else if (key === "30") {
                        if (arr[key] == undefined) {
                            msgError = msgError + '<li><i class="pi pi-times-circle"></i>El Flag de tiene ruc propio debe ser valido (Si/No).</li>';
                        } else {
                            error = this.solicitudesService.validateFlagSiNo(arr[key])
                            tieneRuc = ((arr[key]).toUpperCase() == 'SI');
                        }
                        obj[element] = { valor: arr[key], error: error ? msgError : '' }
                    } else if (key === "31") {
                        if (tieneRuc) {
                            if (arr[key] == undefined || this.solicitudesService.validateRUC(arr[key])) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El numero de RUC no es valido.</li>';
                            }
                            obj[element] = { valor: arr[key], error: error ? msgError : '' }
                        } else {
                            obj[element] = { valor: '', error: error ? msgError : '' }
                        }
                    } else {
                        // Use validation map for remaining cases
                        const validation = this.validateField(key, arr[key], element, tipoDocumento, tieneRuc, msgError);
                        obj[element] = { valor: validation.valor, error: validation.error }
                        msgError = validation.error;
                    }
                }

                return obj;
            });

            this.dataSolicitudes.forEach(arr => {
                let count = 0;
                let valor = '';

                for (const key in arr) {
                    const elementSolicitud = arr[key];
                    if (elementSolicitud.error !== undefined && elementSolicitud.error) {
                        count++;
                        valor = elementSolicitud.error;

                        this.existError = true;
                        this.counterSolicitud++;
                    }
                }

                arr['ERROR'] = {
                    valor: valor + '</ul>',
                    error: false
                }
                if (count > 0) {
                    arr['ERROR'].error = true;
                }
            });

            this.rowsPerPageOptions = this.commonService.getRowsPerPageOptions(this.rows, this.dataSolicitudes.length);
            this.loadingRecordsSolicitud = false;
            this.leakedDataSolicitud = this.dataSolicitudes;
        }

        this.fakeHeadersSolicitud.forEach(element => {
            this.colsSolicitud.push({
                field: element.header,
                header: element.headerTable
            })
        });

        reader.readAsBinaryString(this.filesSolicitud[0]);
    }

    filter(event: any, header: any) {
        this.dataSolicitudes = this.leakedDataSolicitud.filter((item) => item[header.field].valor == undefined ? [] : String(item[header.field].valor).toLowerCase().startsWith(event.toLowerCase()));
    }

    filterGlobal(event: any) {
        this.dataSolicitudes = this.leakedDataSolicitud.filter((item) => {
            let arrString = [];
            let existe = false;

            for (const key in item) {
                if (key !== 'id') {
                    arrString.push(item[key]['valor']);
                }
            }

            existe = arrString.some(e => String(e).toLowerCase().includes(event.toLowerCase()));
            return existe;
        })
    }

    removeAll() {
        this.dataSolicitudes = [];
        this.filesSolicitud = [];
        this.colsSolicitud = [];
        this.headerSolicitud = [];
        this.bodyDataExcel = [];
        this.counterSolicitud = 0;
    }

    downloadFormat() {
        const fileUrl = encodeURI('/assets/documents/Formato carga trama solicitudes.xlsx');
        this.commonService.downloadFile(fileUrl, 'Formato carga trama solicitudes.xlsx');
    }
}
