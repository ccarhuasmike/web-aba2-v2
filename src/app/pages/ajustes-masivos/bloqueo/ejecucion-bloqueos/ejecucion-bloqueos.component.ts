import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { MessageService, ConfirmationService } from 'primeng/api';
import { EjecucionBloqueosService } from "./ejecucion-bloqueos.service";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { FileUploadModule } from "primeng/fileupload";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { ExcelService } from "@/pages/service/excel.service";
import { CommonService } from "@/pages/service/commonService";

@Component({
    selector: 'app-ejecucion-bloqueos',
    templateUrl: './ejecucion-bloqueos.component.html',
    styleUrls: ['./ejecucion-bloqueos.component.scss'],
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
    providers: [MessageService, ConfirmationService ],
})
export class EjecucionBloqueosComponent implements OnInit {

    headers: string[] = [];
    baseHeaders: string[] = ['UIDCLIENTE', 'UIDCUENTA', 'TOKEN', 'CODBLOQUEO', 'CODMOTIVO', 'DESCRIPCION'];
    fakeHeaders: string[] = ['UIDCLIENTE', 'UIDCUENTA', 'TOKEN', 'CODBLOQUEO', 'DESCRIPCIONBLOQUEO', 'CODMOTIVO', 'DESCRIPCIONMOTIVO', 'DESCRIPCION', 'ERROR'];
    data: any[] = [];
    leakedData: any[] = [];
    cols: any[] = [];
    rows = 10;
    files: File[] = [];
    body: any[] = [];
    counter = 0;

    loadingRecords = false;
    loadingParametros = false;

    motivosBloqueoCuenta: any[] = [];
    motivosBloqueoTarjeta: any[] = [];
    codigosBloqueoCuenta: any[] = [];
    codigosBloqueoTarjeta: any[] = [];
    codigosMotivosBloqueoCuenta: any[] = [];

    // Options for pagination
    rowsPerPageOptions: number[] = [];

    constructor(
        private readonly toastr: MessageService,
        private readonly commonService: CommonService,
        private readonly excelService: ExcelService,
        private readonly ejecucionBloqueosService: EjecucionBloqueosService,
        private readonly confirmationService: ConfirmationService,
    ) {
        // This is a constructor
    }

    ngOnInit(): void {
        this.getCombos();
    }

    async getCombos() {
        this.loadingParametros = false;
        await this.getCodigosBloqueoCuenta();
        await this.getCodigosBloqueoTarjeta();
        await this.getMotivosBloqueoCuenta();
        await this.getMotivosBloqueoTarjeta();
        await this.getCodigosMotivosBloqueoCuenta();
        this.loadingParametros = true;
    }

    getCodigosBloqueoCuenta(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.ejecucionBloqueosService.getCodigosBloqueoCuenta().subscribe((resp: any) => {
                if (resp) {
                    this.codigosBloqueoCuenta = resp['data']['listaEstadoCuenta'].filter((e: any) => e.codigo !== '04');
                    resolve(true);
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Error getCodigosBloqueoCuenta', detail: 'Error en el servicio de obtener códigos de bloqueo de cuenta' });
                reject();
            })
        });
    }

    getCodigosBloqueoTarjeta(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.ejecucionBloqueosService.getCodigosBloqueoTarjeta().subscribe((resp: any) => {
                if (resp) {
                    this.codigosBloqueoTarjeta = resp['data']['listaEstadoTarjeta'].filter((e: any) => e.codigo !== '04');;
                    resolve(true);
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Error getCodigosBloqueoTarjeta', detail: 'Error en el servicio de obtener códigos de bloqueo de tarjeta' });
                reject();
            })
        });
    }

    getMotivosBloqueoCuenta(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.ejecucionBloqueosService.getMotivosBloqueoCuenta().subscribe((resp: any) => {
                if (resp) {
                    this.motivosBloqueoCuenta = resp['data']['listaMotivoBloqueoCuenta'];
                    resolve(true);
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Error getMotivosBloqueoCuenta', detail: 'Error en el servicio de obtener motivos de bloqueo de cuenta' });
                reject();
            })
        });
    }

    getMotivosBloqueoTarjeta(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.ejecucionBloqueosService.getMotivosBloqueoTarjeta().subscribe((resp: any) => {
                if (resp) {
                    this.motivosBloqueoTarjeta = resp['data']['listaMotivoBloqueoTarjeta'];
                    resolve(true);
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Error getMotivosBloqueoTarjeta', detail: 'Error en el servicio de obtener motivos de bloqueo de tarjeta' });
                reject();
            })
        });
    }

    getCodigosMotivosBloqueoCuenta(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.ejecucionBloqueosService.getEstadosMotivosBloqueoCuenta().subscribe((resp: any) => {
                if (resp) {
                    this.codigosMotivosBloqueoCuenta = resp['data'].content;
                    resolve(true);
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Error getEstadosMotivosBloqueoCuenta', detail: 'Error en el servicio de obtener estados - motivos de bloqueo de cuenta' });
                reject();
            })
        });
    }

    removeAll() {
        this.data = [];
        this.files = [];
        this.cols = [];
        this.headers = [];
        this.body = [];
        this.counter = 0;
    }

    uploader(event: any) {
        this.removeAll();
        this.loadingRecords = true;
        this.files = event.files;
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {

            const bstr: string = e.target.result;
            const dataExcel = <any[]>this.excelService.importFromFile(bstr);
            this.headers = dataExcel[0];

            if (JSON.stringify(this.headers) !== JSON.stringify(this.baseHeaders)) {
                this.counter = 1;
                return this.toastr.add({ severity: 'error', summary: 'Error al importar', detail: 'Cabeceras no válidas, por favor descargue la estructura del formato' });
            }

            this.body = dataExcel.slice(1);

            if (!this.body.length) {
                this.loadingRecords = false;
                return;
            }

            this.data = this.body.map((arr, index) => {

                const obj: any = {};
                obj['id'] = index;

                let msgError = '<ul>';
                let flagBloqueoCuenta = false;
                let codigoEstadoCuenta = '';

                for (const key in this.headers) {

                    const element = this.headers[key];

                    let error = false;

                    if (key == '0') {
                        if (this.ejecucionBloqueosService.validateUUIDCliente(arr[key])) {
                            this.counter++;
                            error = true;
                            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El UUID de cliente es requerido.</li>';
                        }
                        obj[element] = {
                            valor: arr[key].trim(),
                            error: error ? msgError : ''
                        }
                    }

                    if (key == '1') {
                        if (this.ejecucionBloqueosService.validateUUIDCuenta(arr[key])) {
                            this.counter++;
                            error = true;
                            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El UUID de cuenta es requerido.</li>'
                        }
                        obj[element] = {
                            valor: arr[key].trim(),
                            error: error ? msgError : ''
                        }
                    }

                    if (key == '2') {
                        if (arr[key] == undefined || arr[key] == null) {
                            flagBloqueoCuenta = true;
                        }

                        obj[element] = {
                            valor: arr[key] != undefined && arr[key] != null ? arr[key].trim() : '',
                            error: ''
                        }
                    }

                    if (key == '3') {

                        codigoEstadoCuenta = arr[key];
                        const codigosBloqueo = flagBloqueoCuenta ? this.codigosBloqueoCuenta : this.codigosBloqueoTarjeta;

                        if (this.ejecucionBloqueosService.validateCodigoBloqueo(arr[key], codigosBloqueo)) {
                            this.counter++;
                            error = true;
                            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El código de bloqueo es incorrecto.</li>'
                        }

                        obj[element] = {
                            valor: arr[key].trim(),
                            error: error ? msgError : ''
                        }

                        if (!error) {
                            const valor = codigosBloqueo.find(item => item.codigo === arr[key])
                            obj['DESCRIPCIONBLOQUEO'] = {
                                valor: valor.descripcion,
                                error: ''
                            }
                        }
                    }

                    if (key == '4') {

                        const motivosBloqueo = flagBloqueoCuenta ? this.motivosBloqueoCuenta : this.motivosBloqueoTarjeta;

                        if (this.ejecucionBloqueosService.validateCodigoBloqueo(arr[key], motivosBloqueo)) {
                            this.counter++;
                            error = true;
                            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El motivo de bloqueo es incorrecto.</li>'
                        }

                        if (!flagBloqueoCuenta && this.ejecucionBloqueosService.validateRelacionBloqueoTarjeta(arr[key], codigoEstadoCuenta, motivosBloqueo)) {
                            this.counter++;
                            error = true;
                            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El motivo de bloqueo no corresponde al estado de bloqueo.</li>'
                        }

                        if (flagBloqueoCuenta && this.ejecucionBloqueosService.validateRelacionBloqueoCuenta(arr[key], codigoEstadoCuenta, this.codigosMotivosBloqueoCuenta)) {
                            this.counter++;
                            error = true;
                            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El motivo de bloqueo no corresponde al estado de bloqueo.</li>'
                        }

                        obj[element] = {
                            valor: arr[key].trim(),
                            error: error ? msgError : ''
                        }

                        if (!error) {
                            const valor = motivosBloqueo.find(item => item.codigo === arr[key])
                            obj['DESCRIPCIONMOTIVO'] = {
                                valor: valor.descripcion,
                                error: ''
                            }
                        }
                    }

                    if (key == '5') {
                        if (this.ejecucionBloqueosService.validateDescripcion(arr[key])) {
                            this.counter++;
                            error = true;
                            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El tamaño máximo del mensaje es de 255 caracteres.</li>'
                        }

                        if (arr[key] == undefined || arr[key] == null) {
                            flagBloqueoCuenta = true;
                        }

                        obj[element] = {
                            valor: arr[key] != undefined && arr[key] != null ? arr[key].trim() : '',
                            error: error ? msgError : ''
                        }
                    }
                }

                msgError = msgError + '</ul>';

                return obj;
            })

            this.data.forEach(arr => {
                let count = 0;
                let valor = '';
                for (const key in arr) {
                    const element = arr[key];
                    if (element.error !== undefined && element.error) {
                        count++
                        valor = element.error;
                    }
                }

                arr['ERROR'] = {
                    valor: valor,
                    error: false
                }

                if (count > 0) {
                    arr['ERROR'].error = true;
                }
            });

            this.rowsPerPageOptions = this.commonService.getRowsPerPageOptions(this.rows, this.data.length);

            this.loadingRecords = false;

            this.leakedData = this.data;
        };

        this.fakeHeaders.forEach(element => {
            this.cols.push({
                field: element,
                header: element
            })
        });

        reader.readAsBinaryString(this.files[0]);
    }

    filter(event: any, header: any) {
        this.data = this.leakedData.filter((item) => String(item[header].valor) == undefined || null ? [] : String(item[header].valor).toLowerCase().startsWith(event.toLowerCase()))
    }

    filterGlobal(event: any) {
        this.data = this.leakedData.filter((item) =>
            String(item['UIDCLIENTE']?.valor).toLowerCase().includes(event.toLowerCase()) ||
            String(item['UIDCUENTA']?.valor).toLowerCase().includes(event.toLowerCase()) ||
            String(item['TOKEN']?.valor).toLowerCase().includes(event.toLowerCase()) ||
            String(item['CODBLOQUEO']?.valor).toLowerCase().includes(event.toLowerCase()) ||
            String(item['DESCRIPCIONBLOQUEO']?.valor).toLowerCase().includes(event.toLowerCase()) ||
            String(item['CODMOTIVO']?.valor).toLowerCase().includes(event.toLowerCase()) ||
            String(item['DESCRIPCIONMOTIVO']?.valor).toLowerCase().includes(event.toLowerCase()) ||
            String(item['DESCRIPCION']?.valor).toLowerCase().includes(event.toLowerCase()) ||
            String(item['ERROR']?.valor).toLowerCase().includes(event.toLowerCase()));
    }

    process() {

        this.confirmationService.confirm({
            header: 'Envio de Bloqueos',
            message: '¿Estás seguro de querer realizar esta acción?',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Aceptar',
            },
            accept: () => {
                const usuario = JSON.parse(localStorage.getItem('userABA')!);

                const headerBloqueoApi = ['customerUid', 'accountUid', 'status', 'reasonCode', 'token', 'description'];

                const dataBloqueosApi = this.dataExcelToApi(this.data);

                let blobCSV = this.excelService.generateCSV(headerBloqueoApi, dataBloqueosApi);
                let file = new File([blobCSV], "DatosBloqueosMasivos.csv");

                this.ejecucionBloqueosService.postSendBloquesCSV(file, usuario.email).subscribe((resp: any) => {
                    if (resp?.['codigo'] == 0) {
                        this.toastr.add({ severity: 'success', summary: 'Éxito', detail: 'Lista de bloqueos enviado con exito' });
                        this.removeAll();
                    } else {
                        this.toastr.add({ severity: 'error', summary: 'Error process()', detail: 'Error en el servicio de bloqueos masivos' });
                    }
                }, (_error) => {
                    this.toastr.add({ severity: 'error', summary: 'Error process()', detail: 'Error no controlado' });
                })
            },
            reject: () => {
                this.toastr.add({ severity: 'error', summary: 'Error openDialogAprobar', detail: 'Error en el servicio de actualizar campaña' });
            }
        });
    }

    dataExcelToApi(datos: any[]): any[] {
        let datosBloqueosList: any[] = [];
        datos.forEach((item: any) => {
            let itemArray: any[] = [
                item['UIDCLIENTE'].valor,
                item['UIDCUENTA'].valor,
                item['CODBLOQUEO'].valor,
                item['CODMOTIVO'].valor,
                item['TOKEN'].valor,
                item['DESCRIPCION'].valor
            ];
            datosBloqueosList.push(itemArray);
        })
        return datosBloqueosList;
    }
    downloadFormat() {
        debugger;
        window.open('../../../../../assets/documents/Formato ajustes masivos - bloqueos.xlsx', '_blank');
        //window.open('@assets/documents/Formato ajustes masivos - bloqueos.xlsx', '_blank');
    }
}