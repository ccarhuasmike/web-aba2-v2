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

                    switch (key) {
                        case "0":
                            if (arr[key] == undefined || this.solicitudesService.validateTipoDoc(arr[key], this.tipoDocumentos)) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El tipo de documento es inválido.</li>';
                            }
                            tipoDocumento = arr[key];
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "1":
                            if (arr[key] == undefined || this.solicitudesService.validateNumeroDocu(arr[key], tipoDocumento)) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El número de documento es inválido.</li>';
                            }
                            obj[element] = {
                                valor: (arr[key]) ? String(arr[key]) : "",
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "2":
                            if (arr[key] == undefined || this.solicitudesService.validateFlagSiNo(arr[key])) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El Flag de Tratamientos de datos obligatorios debe ser valido (Si/No).</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "3":
                            if (arr[key] == undefined || this.solicitudesService.validateFlagSiNo(arr[key])) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El Flag de Tratamientos de datos opcionales debe ser valido (Si/No).</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "4":
                            if (arr[key] == undefined) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El primer nombre es requerido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "5":
                            obj[element] = {
                                valor: arr[key] || '',
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "6":
                            if (arr[key] == undefined) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El apellido paterno es requerido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "7":
                            if (arr[key] == undefined) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El apellido materno es requerido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "8":
                            if (arr[key] == undefined || this.solicitudesService.validateGenero(arr[key])) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El género debe ser valido (M ó F).</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "9":
                            if (arr[key] == undefined || this.solicitudesService.validateFecha(arr[key])) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>La fecha de nacimiento debe ser válida.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "10":
                            if (arr[key] == undefined) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El estado civil es requerido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "11":
                            if (arr[key] == undefined || this.solicitudesService.validateNumTel(arr[key])) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El número de celular es requerido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "12":
                            if (arr[key] == undefined || this.solicitudesService.validateEmail(arr[key])) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El correo electronico debe ser valido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "13":
                            if (arr[key] == undefined || this.solicitudesService.validateFlagSiNo(arr[key])) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El Flag de Misma direccion de DNI debe ser valido (Si/No).</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "14":
                            if (arr[key] == undefined) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El tipo de vivienda es requerido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "15":
                            if (arr[key] == undefined || this.solicitudesService.validateUbigeo(arr[key], 2)) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El código de departamento debe ser valido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "16":
                            if (arr[key] == undefined || this.solicitudesService.validateUbigeo(arr[key], 4)) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El código de provincia debe ser valido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "17":
                            if (arr[key] == undefined || this.solicitudesService.validateUbigeo(arr[key], 6)) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El código de distrito debe ser valido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "18":
                            if (arr[key] == undefined) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>La dirección es requerido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "19":
                            obj[element] = {
                                valor: arr[key] || '',
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "20":
                            if (arr[key] == undefined || this.solicitudesService.validateFlagSiNo(arr[key])) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El Flag de Pep debe ser valido (Si/No).</li>';
                            } else {
                                tieneRuc = (arr[key].toUpperCase() == 'SI') ? true : false;
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "21":
                            if (arr[key] == undefined) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El tipo de ocupacion es requerido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "22":
                            obj[element] = {
                                valor: arr[key] || '',
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "23":
                            obj[element] = {
                                valor: arr[key] || '',
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "24":
                            if (arr[key]) {
                                error = this.solicitudesService.validateFecha(arr[key]);
                                msgError = (error) ? msgError + '<li><i class="pi pi-times-circle"></i>La fecha de ingreso laboral debe ser valido.</li>' : msgError;
                            } else {
                                error = false;
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "25":
                            obj[element] = {
                                valor: arr[key] || '',
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "26":
                            obj[element] = {
                                valor: arr[key] || '',
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "27":
                            if (arr[key] == undefined) {
                                error = false;
                            } else {
                                error = this.solicitudesService.validateFlagSiNo(arr[key]);
                                msgError = (error) ? msgError + '<li><i class="pi pi-times-circle"></i>El Flag de Negocio propio debe ser valido (Si/No).</li>' : msgError;
                            }
                            obj[element] = {
                                valor: arr[key] || '',
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "28":
                            obj[element] = {
                                valor: arr[key] || '',
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "29":
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "30":
                            if (arr[key] == undefined) {
                                error = false;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El Flag de tiene ruc propio debe ser valido (Si/No).</li>';
                            } else {
                                error = this.solicitudesService.validateFlagSiNo(arr[key])
                                tieneRuc = ((arr[key]).toUpperCase() == 'SI') ? true : false;
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        case "31":
                            if (tieneRuc) {
                                if (arr[key] == undefined || this.solicitudesService.validateRUC(arr[key])) {
                                    error = true;
                                    msgError = msgError + '<li><i class="pi pi-times-circle"></i>El numero de RUC no es valido.</li>';
                                }
                                obj[element] = {
                                    valor: arr[key],
                                    error: error ? msgError : ''
                                }
                            } else {
                                obj[element] = {
                                    valor: '',
                                    error: error ? msgError : ''
                                }
                            }
                            error = false;
                            break;
                        case "32":
                            if (arr[key] == undefined) {
                                error = true;
                                msgError = msgError + '<li><i class="pi pi-times-circle"></i>El código de call center es requerido.</li>';
                            }
                            obj[element] = {
                                valor: arr[key],
                                error: error ? msgError : ''
                            }
                            error = false;
                            break;
                        default:
                            break;
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
                (key != 'id') ? arrString.push(item[key]['valor']) : '';
            }

            existe = arrString.find(e => String(e).toLowerCase().includes(event.toLowerCase())) ? true : false;
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
        debugger;                                  
        window.open('@assets/documents/Formato carga trama solicitudes.xlsx', '_blank');
    }
}
