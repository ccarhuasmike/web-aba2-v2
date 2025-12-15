import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators,FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { DetalleAutorizacionComponent } from './modals/detalle-autorizacion/detalle-autorizacion.component';
import { LiberacionManualAutorizacionComponent } from './modals/liberacion-manual-autorizacion/liberacion-manual-autorizacion.component';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Cliente } from '@/layout/models/cliente';
import { ACCOUNT_TYPES, CALENDAR_DETAIL, DOCUMENT, ROLES } from '@/layout/Utils/constants/aba.constants';
import { DatetzPipe } from '@/layout/Utils/pipes/datetz.pipe';
import { ExcelService } from '@/pages/service/excel.service';
import { CommonService } from '@/pages/service/commonService';
import { SecurityEncryptedService } from '@/layout/service/SecurityEncryptedService';
import { AutorizacionesService } from './autorizaciones.service';
import { DisableContentByRoleDirective } from '@/layout/Utils/directives/disable-content-by-role.directive';
import { AccordionModule } from 'primeng/accordion';
import { UtilService } from '@/utils/util.services';
import { finalize } from 'rxjs/operators';

interface AutorizacionFilters {
    codigoOperacion?: string;
    codigoGrupo?: string;
    codigoEntrada?: string;
}

type ToastSeverity = 'success' | 'info' | 'warn' | 'error';
@Component({
    selector: 'app-autorizaciones',
    templateUrl: './autorizaciones.component.html',
    styleUrls: ['./autorizaciones.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [AccordionModule, DisableContentByRoleDirective, FormsModule, ConfirmDialogModule, TooltipModule, TabsModule, MenuModule, DividerModule, InputNumberModule, DatePickerModule, TableModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService, ConfirmationService, DatetzPipe, DatePipe],
})
export class AutorizacionesComponent implements OnInit {
    private static readonly TARJETA_DEBITO_BIN = '457339';
    private static readonly TAMANIO_AUTORIZACIONES = 999_999_000;
    private static readonly RANGO_FECHA_MESES = 2;

    mostrarFiltro = false;
    panelOpenState: number | null = 0;

    datosCuenta: any;
    datosCliente: Cliente = new Cliente();

    filteredElementRed: any[] = [];
    filteredElementEstadoConfirmacion: any[] = [];
    filteredElementTipoDocumento: any[] = [];

    first = 0;
    rows = 15;
    nroCaracter: number = 0;

    formBusqueda!: FormGroup;
    formBusquedaAutorizaciones!: FormGroup;
    tipoDocIdent: string = '';
    numeroDocIdent: string = '';
    numeroCuenta: string = '';
    showSearchCard = false;

    tipoRedes: any[] = [];
    tipoDocumento: any[] = [];

    uidCliente: any = '';
    uidCuenta: any = '';

    datosCuentas: any[] = []
    loadingCuentas: boolean = false;

    datosAutorizaciones: any[] = [];
    loadingAutorizaciones: boolean = false;

    finiAutorizaciones: string = moment().format('YYYY-MM-DD');
    ffinAutorizaciones: string = moment().format('YYYY-MM-DD');
    fechaRangoAutorizaciones: [Date, Date] = [new Date(), new Date()];
    es = CALENDAR_DETAIL;
    roles: any = ROLES;

    cols: any[] = [
        { field: 'producto', header: 'Producto' },
        { field: 'nombresApellidos', header: 'Nombre titular' },
        { field: 'numeroCuenta', header: 'Nro de cuenta' },
        { field: 'motivoBloqueo', header: 'Estado de cuenta' },
        { field: 'fechaApertura', header: 'Fecha apertura' },
        { field: 'fechaBaja', header: 'Fecha Baja' },
        { field: 'desCodTipoDoc', header: 'Tipo documento' },
        { field: 'numDocIdentidad', header: 'Documento identidad' }
    ];

    constructor(
        private readonly dialog: DialogService,
        private readonly toastr: MessageService,
        public readonly datepipe: DatePipe,
        private readonly dateTzPipe: DatetzPipe,
        private readonly excelService: ExcelService,
        private readonly commonService: CommonService,
        private readonly securityEncryptedService: SecurityEncryptedService,
        private readonly autorizacionesService: AutorizacionesService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router
    ) {
        const primerDia = new Date();
        primerDia.setMonth(primerDia.getMonth() - 1);
        this.finiAutorizaciones = this.datepipe.transform(primerDia, 'yyyy-MM-dd')!;
        this.ffinAutorizaciones = this.datepipe.transform(new Date(), 'yyyy-MM-dd')!;
        this.fechaRangoAutorizaciones = [primerDia, new Date()];

        this.createForm();

        this.activatedRoute.params.subscribe(
            params => {
                if (Object.keys(params).length !== 0) {
                    this.formBusqueda.patchValue({
                        tipoDocumento: {
                            id: params['tipoDocumento'],
                            descripcion: params['descDocumento']
                        },
                        nroDocumento: params['nroDocumento']
                    });

                    this.searchCuenta().then(
                        (_data) => {
                            const cuenta = this.datosCuentas.find((item: any) => item.numeroCuenta === params['numeroCuenta']);
                            if (cuenta) {
                                this.datosCuenta = cuenta;
                                this.uidCuenta = cuenta.uIdCuenta;
                                this.numeroCuenta = cuenta.numeroCuenta;
                                this.searchCuentaAutorizaciones();
                            }
                        }
                    ).catch((error) => {
                        console.error('ERROR EN LA BÚSQUEDA DE DATOS...', error);
                    });
                }
            }
        );
    }

    ngOnInit() {
        this.getCombos();
        const role = this.securityEncryptedService.getRolesDecrypted();
        if (
            role == this.roles.ADMINISTRADOR ||
            role == this.roles.FRAUDE ||
            role == this.roles.OPERACION_PASIVA ||
            role == this.roles.OPERACION_CONTABLE
        ) {
            this.showSearchCard = true;
        }
    }

    getCombos() {
        this.commonService.getMultipleCombosPromiseCliente(['documentos/tipos']).then(resp => {
            this.tipoDocumento = resp[0].data.content.filter((item: any) => item['nombre'] !== DOCUMENT.RUC)
                .map((item: any) => {
                    return {
                        id: item['codigo'],
                        descripcion: item['nombre']
                    }
                });
        });

        this.commonService.getTipoOrigenTransaccion().subscribe((resp: any) => {
            if (resp['codigo'] == 0) {
                this.tipoRedes = resp['data'].listaOrigenTransaccion.map((item: any) => {
                    return {
                        id: item['codigo'],
                        descripcion: item['descripcion']
                    }
                });
            }
        });
    }

    createForm() {
        this.formBusqueda = new FormGroup({
            tipoDocumento: new FormControl(null, [Validators.required]),
            nroDocumento: new FormControl(null, [Validators.required]),
            nroTarjeta: new FormControl()
        });

        this.formBusquedaAutorizaciones = new FormGroup({
            numeroCuenta: new FormControl(),
            codigoOperacion: new FormControl(),
            codigoGrupo: new FormControl(),
            codigoEntrada: new FormControl(),
            fechaRangoAutorizaciones: new FormControl(this.fechaRangoAutorizaciones)
        });
    }

    onInputChangeNumeroDocumento() {
        this.formBusqueda.patchValue({
            nroTarjeta: ''
        });

        this.changeValidacionControles();
    }

    onInputChangeNumeroTarjeta() {
        this.formBusqueda.patchValue({
            tipoDocumento: '',
            nroDocumento: ''
        });

        this.changeValidacionControles();
    }

    changeValidacionControles() {
        this.tipoDocIdent = '';
        this.numeroDocIdent = '';
        this.numeroCuenta = '';

        if (this.formBusqueda.get('nroTarjeta')!.value) {
            this.formBusqueda.get('tipoDocumento')!.clearValidators();
            this.formBusqueda.get('nroDocumento')!.clearValidators();
            this.formBusqueda.get('nroTarjeta')!.setValidators([Validators.minLength(16), Validators.maxLength(16), Validators.required]);
        } else {
            this.formBusqueda.get('tipoDocumento')!.setValidators(Validators.required);
            this.formBusqueda.get('nroDocumento')!.setValidators(Validators.required);
            this.formBusqueda.get('nroTarjeta')!.clearValidators();
        }

        this.formBusqueda.get('tipoDocumento')!.updateValueAndValidity();
        this.formBusqueda.get('nroDocumento')!.updateValueAndValidity();
        this.formBusqueda.get('nroTarjeta')!.updateValueAndValidity();
    }

    async searchCuenta() {
        const nroTarjeta = this.formBusqueda.get('nroTarjeta')!.value;

        if (nroTarjeta) {

            const bin = nroTarjeta.slice(0, 6);
            if (bin !== AutorizacionesComponent.TARJETA_DEBITO_BIN) {
                this.showMessage('warn', '', 'Solo se puede realizar la búsqueda por tarjetas de débito');
                return;
            }

            await this.getClientePorNumeroTarjeta();
        } else {
            this.tipoDocIdent = this.formBusqueda.get('tipoDocumento')!.value.id;
            this.numeroDocIdent = this.formBusqueda.get('nroDocumento')!.value;
        }

        await this.getCliente();
        await this.getCuenta();
    }

    async getClientePorNumeroTarjeta() {
        const datosIdTarjeta = await this.commonService.getIdTarjetaPorNumeroTarjeta(this.formBusqueda.get('nroTarjeta')!.value)
        if (datosIdTarjeta.codigo == 0) {
            const datosCliente = await this.commonService.getClientePorIdTarjeta(datosIdTarjeta.data.idTarjeta.slice(3))
            if (datosCliente.codigo == 0) {
                this.tipoDocIdent = datosCliente.data.tipoDocIdent;
                this.numeroDocIdent = datosCliente.data.numeroDocIdent;
                this.numeroCuenta = datosCliente.data.numeroCuenta;
            } else {
                this.showMessage('error', 'Error getCuenta', 'Error en el servicio de obtener cliente de la tarjeta');                
            }
        } else {
            this.showMessage('error', 'Error getCuenta', 'Error en el servicio de obtener token de la tarjeta');            
        }
    }

    getCliente(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.uidCuenta = '';
            this.datosCuenta = null;
            this.datosCuentas = [];
            this.datosAutorizaciones = [];
            this.commonService.getCliente(this.tipoDocIdent, this.numeroDocIdent)
                .subscribe(
                    (resp: any) => {
                        if (resp['codigo'] == 0) {
                            this.datosCliente = resp['data'];
                            this.uidCliente = resp['data'].uIdCliente;
                        } else if (resp['codigo'] == -1) {
                            this.showMessage('error', 'Error getCliente', resp['mensaje']);
                        } else if (resp['codigo'] == 1) {
                            this.showMessage('error', 'Error getCliente', 'El cliente que se intenta buscar no existe');
                        }
                        resolve(true);
                    }, (_error) => {
                        this.showMessage('error', 'Error getCliente', 'Error en el servicio de obtener datos del cliente');                        
                    }
                );
        });
    }

    getCuenta(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.loadingCuentas = true;
            const clienteUid = this.uidCliente;
            this.commonService.getCuenta(clienteUid)
                .subscribe((resp: any) => {

                    this.loadingCuentas = false;

                    if (resp['codigo'] == 0) {
                        this.datosCuentas = resp['data'].content;

                        this.datosCuentas = this.datosCuentas.map((row: any) => {
                            return {
                                ...row,
                                nombresApellidos: this.datosCliente.nombresApellidos,
                                desCodTipoDoc: this.datosCliente.desCodTipoDoc,
                                numDocIdentidad: this.datosCliente.numDocIdentidad
                            }
                        });

                        if (this.numeroCuenta) {
                            this.datosCuentas = this.datosCuentas.filter((row: any) => row.numeroCuenta == this.numeroCuenta);
                        }
                    } else if (resp['codigo'] == -1) {
                        this.showMessage('error', 'Error getCuenta', resp['mensaje']);
                    }
                    resolve(true);
                }, (_error) => {
                    this.loadingCuentas = false;
                    this.showMessage('error', 'Error getCuenta', 'Error en el servicio de obtener datos de la cuenta');                    
                });
        });
    }

    changeModelTipoDocumento(event: any) {
        if (!event) { return; }

        this.tipoDocIdent = '';
        this.numeroDocIdent = '';
        this.numeroCuenta = '';
        this.formBusqueda.get('nroTarjeta')!.clearValidators();
        this.formBusqueda.get('tipoDocumento')!.setValidators(Validators.required);

        this.formBusqueda.patchValue({
            nroTarjeta: ''
        });

        const tipoDocumento = event.id;

        if (tipoDocumento == 1) {
            this.nroCaracter = 8;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required])
        } else if (tipoDocumento == 2) {
            this.nroCaracter = 9;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required])
        } else if (tipoDocumento == 3) {
            this.nroCaracter = 11;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required])
        } else {
            this.nroCaracter = 0;
            this.formBusqueda.get('nroDocumento')!.clearValidators();
        }

        this.formBusqueda.get('nroTarjeta')!.updateValueAndValidity();
        this.formBusqueda.get('tipoDocumento')!.updateValueAndValidity();
        this.formBusqueda.get('nroDocumento')!.updateValueAndValidity();
    }

    filterElementTipoDocumento(event: any, data: any) {
        this.filteredElementTipoDocumento = [];
        const query = event?.query ?? '';
        this.filteredElementTipoDocumento = UtilService.filterByField(data, query, 'descripcion');
    }

    selectCuenta(data: any) {
        this.datosCuenta = data;
        this.uidCuenta = data.uIdCuenta;
        this.formBusquedaAutorizaciones.patchValue({
            codigoOperacion: '',
            codigoGrupo: '',
            codigoEntrada: ''
        });
        this.searchCuentaAutorizaciones();
    }

    searchCuentaAutorizaciones() {
        this.first = 0;
        this.rows = 15;
        this.datosAutorizaciones = [];
        this.loadingAutorizaciones = true;

        const fechaInicio = this.commonService.dateFormatISO8601(this.finiAutorizaciones);
        const fechaFin = this.buildFechaFinIso();
        const filtros = this.getAutorizacionFilters();

        this.autorizacionesService.getCuentaAutorizaciones(
            this.uidCliente,
            this.uidCuenta,
            fechaInicio,
            fechaFin,
            0,
            AutorizacionesComponent.TAMANIO_AUTORIZACIONES
        ).pipe(
            finalize(() => {
                this.loadingAutorizaciones = false;
            })
        ).subscribe({
            next: (resp: any) => this.handleAutorizacionesResponse(resp, filtros),
            error: () => this.showMessage('error', 'Error searchCuentaAutorizaciones', 'Error en el servicio de obtener autorizaciones de la cuenta')
        });
    }

    clearFilterCuentaAutorizaciones() {
        this.formBusquedaAutorizaciones.patchValue({
            codigoOperacion: '',
            codigoGrupo: '',
            codigoEntrada: ''
        });

        this.searchCuentaAutorizaciones();
    }

    visibilidadTarjeta(autorizacion: any) {
        const tarjeta = autorizacion.tarjeta;
        if (!tarjeta) {
            return;
        }

        if (tarjeta.numTarjetaVisible) {
            this.updateTarjetaVisibility(tarjeta.idTarjeta, false);
            return;
        }

        if (tarjeta?.desenmascarado) {
            this.updateTarjetaVisibility(tarjeta.idTarjeta, true);
            return;
        }

        const token = tarjeta.token;
        if (!token) {
            return;
        }

        this.commonService.getCardNumberFullEncrypted(token).subscribe({
            next: (resp: any) => {
                if (resp['codigo'] == 0) {
                    const datosTarjetaDecrypted = this.commonService.decryptResponseCardNumber(resp);
                    const desenmascarado = datosTarjetaDecrypted.tarjeta.slice(3);
                    this.updateTarjetaVisibility(tarjeta.idTarjeta, true, desenmascarado);
                } else {
                    this.showMessage('error', 'Error visibilidadTarjeta()', resp['mensaje']);
                }
            },
            error: () => {
                this.showMessage('error', 'Error visibilidadTarjeta()', 'Error en el servicio de obtener tarjeta desencriptada');
            }
        });
    }

    clearFilterCuenta() {
        this.formBusqueda.reset();
        this.datosCuentas = [];
        this.datosAutorizaciones = [];
        this.datosCuenta = null;
        this.datosCliente = new Cliente();
        this.uidCliente = '';
        this.uidCuenta = '';
        this.router.navigate(['/apps/consultas/autorizaciones']);
    }

    changeModelFechaRangoAutorizaciones(event: any) {
        this.first = 0;
        this.rows = 15;
        this.finiAutorizaciones = '';
        this.ffinAutorizaciones = '';
        if (event[0] !== null && event[1] !== null) {
            this.finiAutorizaciones = moment(event[0]).format('YYYY-MM-DD');
            this.ffinAutorizaciones = moment(event[1]).format('YYYY-MM-DD');

            const ffinAutorizaciones = new Date(this.ffinAutorizaciones);
            ffinAutorizaciones.setMonth(ffinAutorizaciones.getMonth() - AutorizacionesComponent.RANGO_FECHA_MESES);
            const finiAutorizacionesAux = new Date(this.finiAutorizaciones)
            if (finiAutorizacionesAux < ffinAutorizaciones) {
                this.showMessage('warn', 'Validacion de Fechas:', 'El intervalo de rango de fechas es 2 meses como maximo');
                return;
            }
            this.searchCuentaAutorizaciones();
        }
    }

    openDialogDetalleAutorizacion(data: any) {
        this.dialog.open(DetalleAutorizacionComponent, {
            header: 'Detalle Autorización',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                datosAutorizaciones: data,
                datosCliente: this.datosCliente,
                datosCuenta: this.datosCuenta,
            }
        });
    }

    openDialogLiberarManualAutorizacion(data: any) {
        const dialogRef = this.dialog.open(LiberacionManualAutorizacionComponent, {
            header: 'Liberación Manual de Autorización',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            data: {
                datosAutorizacion: data,
                datosCliente: this.datosCliente,
                datosCuenta: this.datosCuenta,
            },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            }
        });

        if (dialogRef) {
            dialogRef.onClose.subscribe((resp: any) => {
                if (resp && resp !== undefined) {
                    if (resp.data['codigo'] == 0) {
                        this.showMessage('success', '', 'Liberacion Manual de Autorizacion registrada');
                        this.searchCuentaAutorizaciones();
                    } else {
                        this.showMessage('error', 'Error openDialogLiberarManualAutorizacion', 'Error en el servicio de liberacion manual de autorizacion');
                    }
                }
            })
        }
    }

    private handleAutorizacionesResponse(resp: any, filtros: AutorizacionFilters): void {
        if (resp['codigo'] == 0) {
            const content = resp?.data?.content ?? [];
            this.datosAutorizaciones = content
                .filter((dato: any) => this.cumpleFiltrosAutorizacion(dato, filtros))
                .sort((a: any, b: any) => b.idTransaccion - a.idTransaccion)
                .map((dato: any) => this.mapAutorizacion(dato));
        } else if (resp['codigo'] == -1) {
            this.showMessage('error', 'Error searchCuentaAutorizaciones', resp['mensaje']);
        }
    }

    private getAutorizacionFilters(): AutorizacionFilters {
        const formValue = this.formBusquedaAutorizaciones.value ?? {};
        return {
            codigoOperacion: formValue.codigoOperacion ?? '',
            codigoGrupo: formValue.codigoGrupo ?? '',
            codigoEntrada: formValue.codigoEntrada ?? ''
        };
    }

    private buildFechaFinIso(): string {
        const fechaFin = new Date(this.ffinAutorizaciones);
        fechaFin.setDate(fechaFin.getDate() + 1);
        fechaFin.setMinutes(fechaFin.getMinutes() - 1);
        return fechaFin.toISOString();
    }

    private cumpleFiltrosAutorizacion(dato: any, filtros: AutorizacionFilters): boolean {
        const esValidoOperacion = !filtros.codigoOperacion || dato.codigoOperacion == filtros.codigoOperacion;
        const esValidoGrupo = !filtros.codigoGrupo || dato.transaccionProcesada?.groupingCode == filtros.codigoGrupo;
        const esValidoEntrada = !filtros.codigoEntrada || dato.transaccionProcesada?.entryCode == filtros.codigoEntrada;
        return esValidoOperacion && esValidoGrupo && esValidoEntrada;
    }

    private mapAutorizacion(dato: any): any {
        const referencia = dato.transaccionRequest?.dataElements?.retrievalReferenceNumber ?? dato.uIdreferenciaExterna;
        const mapped: any = {
            ...dato,
            fechaTransaccion: this.dateTzPipe.transform(dato.fechaTransaccion, 'DD/MM/YYYY HH:mm:ss'),
            fechaConfirmacion: this.dateTzPipe.transform(dato.fechaConfirmacion, 'DD/MM/YYYY'),
            referencia,
            estadoReversado: dato.reversado ? 'SI' : 'NO',
            descOrigenInt: this.getDescripcionRed(dato.descOrigen),
            tarjeta: {
                ...dato.tarjeta,
                numTarjetaVisible: false
            }
        };

        if (dato.estadoAutorizacion == 'REJECTED') {
            const request = dato.transaccionRequest ?? {};
            const ftcCode = `${request.messageType ?? ''}${request.operationCode ?? ''}${request.groupingCode ?? ''}${request.entryCode ?? ''}`;
            mapped.codigoRechazo = dato.codigoEstadoOrigen ?? dato.codEstadoTransaccion;
            mapped.transaccionResponse = {
                ...dato.transaccionResponse,
                ftcCode
            };
        }

        return mapped;
    }

    private getDescripcionRed(descOrigen: any): string {
        const red = this.tipoRedes.find((x: any) => x.id == descOrigen);
        return red?.descripcion ?? '';
    }

    private updateTarjetaVisibility(idTarjeta: any, visible: boolean, desenmascarado?: string): void {
        this.datosAutorizaciones = this.datosAutorizaciones.map((item: any) => {
            if (item.tarjeta?.idTarjeta !== idTarjeta) {
                return item;
            }

            const tarjetaActualizada: any = {
                ...item.tarjeta,
                numTarjetaVisible: visible
            };

            if (desenmascarado) {
                tarjetaActualizada['desenmascarado'] = desenmascarado;
            }

            return {
                ...item,
                tarjeta: tarjetaActualizada
            };
        });
    }

    private showMessage(severity: ToastSeverity, summary: string, detail: string): void {
        this.toastr.add({ severity, summary, detail });
    }

    exportExcel(): void {
        if (!this.datosCuenta?.numeroCuenta || !this.datosAutorizaciones?.length) {
            return;
        }

        const numeroCuenta: string = this.datosCuenta.numeroCuenta;
        const bin: string = numeroCuenta.substring(0, 2);

        const moneda: string =
            ACCOUNT_TYPES.find(type => type.bin === bin)?.moneda ?? '';

        const fechaReporte: Date = new Date();

        // ❗ Evitar "/" en nombres de archivo
        const excelName: string =
            `Reporte_Autorizaciones_${this.formatDate(fechaReporte)}.xlsx`;

        const sheetName = 'Datos';
        const filterLabel = 'Fecha de Reporte';

        const header: readonly string[] = [
            'Id Transacción',
            'Fecha Transacción',
            'Fecha Proceso',
            'Cuenta',
            'Cod. Descripción',
            'Descripción',
            'Referencia',
            'Código Autorización',
            'Importe',
            'Moneda',
            'Red',
            'Estado Confirmación',
            'Estado Autorización',
            'Estado Reversado',
            'Cod. Rechazo',
            'Num. Tarjeta',
            'Token',
            'Id Transacción Original',
            'Razón Estado'
        ];

        const datos: (string | number | null)[][] = [];
        const isCurrency: number[] = [];

        for (const x of this.datosAutorizaciones) {
            datos.push([
                x.idTransaccion ?? null,
                x.fechaTransaccion ?? null,
                x.fechaConfirmacion ?? null,
                numeroCuenta,
                x.transaccionResponse?.ftcCode ?? '',
                x.transaccionResponse?.ftcDescription ?? '',
                x.transaccionRequest?.dataElements?.retrievalReferenceNumber
                ?? x.uIdreferenciaExterna
                ?? '',
                x.codigoAutorizacion ?? '',
                Number(x.transaccionProcesada?.monto ?? 0),
                moneda,
                x.descOrigenInt ?? '',
                x.estadoAutorizacion === 'REJECTED'
                    ? ''
                    : x.estadoConfirmacion ?? '',
                x.estadoAutorizacion ?? '',
                x.estadoReversado ?? '',
                x.codigoRechazo ?? '',
                x.tarjeta?.enmascarado ?? '',
                x.tarjeta?.token ?? '',
                x.transaccionResponse?.financialTransaction?.parentTransactionId ?? '',
                x.motivoTransaccion ?? ''
            ]);
        }

        this.excelService.generateExcel(
            [...header],
            excelName,
            sheetName,
            isCurrency,
            datos,
            fechaReporte,
            filterLabel
        );
    }
    private formatDate(date: Date): string {
        const pad = (n: number): string => n.toString().padStart(2, '0');
        return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
    }
}
