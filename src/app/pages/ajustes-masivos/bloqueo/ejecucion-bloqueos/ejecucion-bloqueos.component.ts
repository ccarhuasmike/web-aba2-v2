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
                reject(new Error('Error getCodigosBloqueoCuenta'));
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
                reject(new Error('Error getCodigosBloqueoTarjeta'));
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
                reject(new Error('Error getMotivosBloqueoCuenta'));
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
                reject(new Error('Error getMotivosBloqueoTarjeta'));
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
                reject(new Error('Error getEstadosMotivosBloqueoCuenta'));
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

    async uploader(event: any) {
        this.removeAll();
        this.loadingRecords = true;
        this.files = event.files;

        try {
            const arrayBuffer = await this.files[0].arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const bstr: string = String.fromCodePoint(...Array.from(uint8Array));
            const dataExcel = <any[]>this.excelService.importFromFile(bstr);
            this.headers = dataExcel[0];

            if (JSON.stringify(this.headers) !== JSON.stringify(this.baseHeaders)) {
                this.counter = 1;
                this.loadingRecords = false;
                return this.toastr.add({ severity: 'error', summary: 'Error al importar', detail: 'Cabeceras no válidas, por favor descargue la estructura del formato' });
            }

            this.body = dataExcel.slice(1);

            if (!this.body.length) {
                this.loadingRecords = false;
                return;
            }

            this.data = this.body.map((arr, index): any => {
                return this.buildRowObject(arr, index);
            })

            this.data.forEach(arr => {
                this.setErrorField(arr);
            });

            this.rowsPerPageOptions = this.commonService.getRowsPerPageOptions(this.rows, this.data.length);

            this.leakedData = this.data;
        } catch (error) {
            console.error('Error processing file:', error);
            this.toastr.add({ severity: 'error', summary: 'Error al procesar archivo', detail: 'Error al leer el archivo' });
        } finally {
            this.loadingRecords = false;
        }

        this.fakeHeaders.forEach(element => {
            this.cols.push({
                field: element,
                header: element
            })
        });
    }

    filter(event: string, header: any) {
        const search = event?.toLowerCase() ?? '';

        this.data = this.leakedData.filter(item =>
            item?.[header]?.valor != null &&
            String(item[header].valor).toLowerCase().startsWith(search)
        );
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
        const fileUrl = encodeURI('/assets/documents/Formato ajustes masivos - bloqueos.xlsx');
        this.commonService.downloadFile(fileUrl, 'Formato ajustes masivos - bloqueos.xlsx');
    }

    private buildRowObject(arr: any[], index: number): any {
        const obj: any = { id: index };
        let msgError = '<ul>';
        let flagBloqueoCuenta = false;
        let codigoEstadoCuenta = '';

        for (const key in this.headers) {
            const element = this.headers[key];
            const keyNum = Number.parseInt(key);

            switch (keyNum) {
                case 0:
                    this.validateAndSetUUIDCliente(obj, element, arr[key], msgError);
                    break;
                case 1:
                    this.validateAndSetUUIDCuenta(obj, element, arr[key], msgError);
                    break;
                case 2:
                    flagBloqueoCuenta = this.setTokenField(obj, element, arr[key]);
                    break;
                case 3:
                    codigoEstadoCuenta = arr[key];
                    this.validateAndSetCodigoBloqueo(obj, element, arr[key], flagBloqueoCuenta, msgError);
                    break;
                case 4:
                    this.validateAndSetMotivoBloqueo(obj, element, arr[key], flagBloqueoCuenta, codigoEstadoCuenta, msgError);
                    break;
                case 5:
                    this.validateAndSetDescripcion(obj, element, arr[key], msgError);
                    break;
            }
        }

        return obj;
    }

    private validateAndSetUUIDCliente(obj: any, element: string, value: string, msgError: string): void {
        let error = false;
        if (this.ejecucionBloqueosService.validateUUIDCliente(value)) {
            this.counter++;
            error = true;
            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El UUID de cliente es requerido.</li>';
        }
        obj[element] = {
            valor: value.trim(),
            error: error ? msgError : ''
        };
    }

    private validateAndSetUUIDCuenta(obj: any, element: string, value: string, msgError: string): void {
        let error = false;
        if (this.ejecucionBloqueosService.validateUUIDCuenta(value)) {
            this.counter++;
            error = true;
            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El UUID de cuenta es requerido.</li>';
        }
        obj[element] = {
            valor: value.trim(),
            error: error ? msgError : ''
        };
    }

    private setTokenField(obj: any, element: string, value: any): boolean {
        const flagBloqueoCuenta = value == null || value === undefined;
        obj[element] = {
            valor: value != null && value !== undefined ? value.trim() : '',
            error: ''
        };
        return flagBloqueoCuenta;
    }

    private validateAndSetCodigoBloqueo(obj: any, element: string, value: string, flagBloqueoCuenta: boolean, msgError: string): void {
        const codigosBloqueo = flagBloqueoCuenta ? this.codigosBloqueoCuenta : this.codigosBloqueoTarjeta;
        let error = false;

        if (this.ejecucionBloqueosService.validateCodigoBloqueo(value, codigosBloqueo)) {
            this.counter++;
            error = true;
            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El código de bloqueo es incorrecto.</li>';
        }

        obj[element] = {
            valor: value.trim(),
            error: error ? msgError : ''
        };

        if (!error) {
            const codigo = codigosBloqueo.find(item => item.codigo === value);
            obj['DESCRIPCIONBLOQUEO'] = {
                valor: codigo.descripcion,
                error: ''
            };
        }
    }

    private validateAndSetMotivoBloqueo(obj: any, element: string, value: string, flagBloqueoCuenta: boolean, codigoEstadoCuenta: string, msgError: string): void {
        const motivosBloqueo = flagBloqueoCuenta ? this.motivosBloqueoCuenta : this.motivosBloqueoTarjeta;
        let error = false;

        if (this.ejecucionBloqueosService.validateCodigoBloqueo(value, motivosBloqueo)) {
            this.counter++;
            error = true;
            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El motivo de bloqueo es incorrecto.</li>';
        }

        if (!flagBloqueoCuenta && this.ejecucionBloqueosService.validateRelacionBloqueoTarjeta(value, codigoEstadoCuenta, motivosBloqueo)) {
            this.counter++;
            error = true;
            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El motivo de bloqueo no corresponde al estado de bloqueo.</li>';
        }

        if (flagBloqueoCuenta && this.ejecucionBloqueosService.validateRelacionBloqueoCuenta(value, codigoEstadoCuenta, this.codigosMotivosBloqueoCuenta)) {
            this.counter++;
            error = true;
            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El motivo de bloqueo no corresponde al estado de bloqueo.</li>';
        }

        obj[element] = {
            valor: value.trim(),
            error: error ? msgError : ''
        };

        if (!error) {
            const motivo = motivosBloqueo.find(item => item.codigo === value);
            obj['DESCRIPCIONMOTIVO'] = {
                valor: motivo.descripcion,
                error: ''
            };
        }
    }

    private validateAndSetDescripcion(obj: any, element: string, value: any, msgError: string): void {
        let error = false;
        if (this.ejecucionBloqueosService.validateDescripcion(value)) {
            this.counter++;
            error = true;
            msgError = msgError + '<li><i class="pi pi-times-circle" style="color: red;"></i>El tamaño máximo del mensaje es de 255 caracteres.</li>';
        }

        obj[element] = {
            valor: value != null && value !== undefined ? value.trim() : '',
            error: error ? msgError : ''
        };
    }

    private setErrorField(arr: any): void {
        let count = 0;
        let valor = '';

        for (const key in arr) {
            const element = arr[key];
            if (element.error !== undefined && element.error) {
                count++;
                valor = element.error;
            }
        }

        arr['ERROR'] = {
            valor: valor,
            error: count > 0
        };
    }
}
