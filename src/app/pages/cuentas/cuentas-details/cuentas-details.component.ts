import { Component, OnInit, } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { CustomerService } from '../../service/customer.service';
import { ProductService } from '../../service/product.service';
import { CommonService } from '../../service/commonService';
import { DatetzPipe } from '@/layout/Utils/pipes/datetz.pipe';
import { Cliente } from '@/layout/models/cliente';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { CALENDAR_DETAIL, FILE_TYPE, MERGE_DOCUMENT_TYPES_ABA_PUC, ROLES, TYPE_TRANSACTION } from '@/layout/Utils/constants/aba.constants';
import { SecurityEncryptedService } from '@/layout/service/SecurityEncryptedService';
import { ActivatedRoute } from '@angular/router';
import { Cuenta } from '@/layout/models/cuenta';
import { FieldsetModule } from 'primeng/fieldset';
import { CuentasDetailsService } from './cuentas-details.service';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogRef, DynamicDialogModule } from 'primeng/dynamicdialog';
import { TabsModule } from 'primeng/tabs';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuModule } from 'primeng/menu';
import { RegistrarBloqueoCuentaComponent } from '../cuentas-modals/registrar-bloqueo-cuenta/registrar-bloqueo-cuenta.component';
import { RegistrarBloqueoTarjetaComponent } from '../cuentas-modals/registrar-bloqueo-tarjeta/registrar-bloqueo-tarjeta.component';
import { DetalleBotoneraComponent } from '../cuentas-modals/detalle-botonera/detalle-botonera.component';
import { VerCuentaRelacionadaComponent } from '../cuentas-modals/ver-cuenta-relacionada/ver-cuenta-relacionada.component';
import { SplitButton } from 'primeng/splitbutton';
import { RegistrarRetencionComponent } from '../cuentas-modals/registrar-retencion/registrar-retencion.component';
import { CalcularCuentaAhorroComponent } from '../cuentas-modals/calcular-cuenta-ahorro/calcular-cuenta-ahorro.component';
import { CobroComisionComponent } from '../cuentas-modals/cobro-comision/cobro-comision.component';
import { DisableContentByRoleDirective } from '@/layout/Utils/directives/disable-content-by-role.directive';
import { DetalleMovimientoComponent } from '../cuentas-modals/detalle-movimiento/detalle-movimiento.component';
import { DatePicker } from 'primeng/datepicker';
import moment from 'moment';
import { ExcelService } from '@/pages/service/excel.service';
import { VerArchivoComponent } from '../cuentas-modals/ver-archivo/ver-archivo.component';
@Component({
    selector: 'app-cuentas-details',
    standalone: true,
    templateUrl: './cuentas-details.component.html',
    styleUrls: ['./cuentas-details.component.scss'],
    imports: [
        DatePicker,
        DisableContentByRoleDirective,
        SplitButton,
        TabsModule,
        DynamicDialogModule,
        TableModule,
        MultiSelectModule,
        SelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        SliderModule,
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        MessageModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        IconFieldModule,
        FieldsetModule,
        MenuModule,
        TooltipModule,
        Breadcrumb
    ],
    providers: [DatePipe, DialogService, ConfirmationService, MessageService, CustomerService, ProductService, DatetzPipe]
})
export class CuentasDetailsComponent implements OnInit {
    items: MenuItem[] = [{ label: 'Consulta', routerLink: '/uikit/cuenta' }, { label: 'Detalle Cuenta' }];
    home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
    bin: string = '';
    listaRed: any[] = [];
    listProductos: any[] = [];
    listaTipoRentecion: any[] = [];

    uidCliente: any = '';
    uidCuenta: any = '';
    tipoDoc: any = '';
    numDoc: any = '';

    disableActions = true;
    showCancelButton = false;
    showCardContainer = false;
    showCceButton = false;

    rows = 10;

    //fechaRangoMovimientos: [Date | null, Date | null] = [null, null];
    fechaRangoMovimientos: Date[] | undefined;
    finiMovimientos: any = null;
    ffinMovimientos: any = null;

    //fechaSaldoMes: Date = null;
    finiSaldoMes: any = null;
    ffinSaldoMes: any = null;

    es = CALENDAR_DETAIL

    // Client
    datosCliente: Cliente = new Cliente();

    // Account
    datosCuenta: Cuenta = new Cuenta();

    // Balance
    saldoAutorizado: any = [];
    datosSaldoPorPlan: any = null;
    loadingSaldos!: boolean;

    // Consulta
    datosTarjetas: any[] = [];
    loadingTarjetas!: boolean;

    // Movements
    datosMovimientos: any[] = [];
    loadingMovimientos!: boolean;

    datosSaldosMes: any[] = [];
    loadingSaldosMes!: boolean;

    // Blocks
    datosCuentaBloqueos = [];
    loadingCuentaBloqueos!: boolean;

    datosTarjetaBloqueos: any[] = [];
    loadingTarjetaBloqueos!: boolean;

    datosPagosPorBloqueo = [];
    loadingPagosPorBloqueo!: boolean;

    // Holdbacks
    datosPagoRetencion = [];
    loadingPagoRetencion!: boolean;

    datosRetenciones: any[] = [];
    loadingRetenciones!: boolean;

    // Intereses
    datosInteresTarifario: any;

    roles: any = ROLES;


    itemsOpciones: MenuItem[] = [
        {
            label: 'Registrar retención',
            icon: 'pi pi-undo',
            command: () => this.openDialogRegistrarRetencion(),
            //disabled: this.shouldDisableForRoles([roles.PLAFT, roles.FRAUDE, roles.ATENCION_CLIENTE, roles.ATENCION_CLIENTE_TD]) || this.disableActions
        },
        {
            label: 'Bloqueo/Desbloqueo Cuenta',
            icon: 'pi pi-lock',
            command: () => this.openDialogRegistrarBloqueoCuenta('bloqueo'),
            ///disabled: this.disableActions
        },
        {
            label: 'Cancelación Cuenta',
            icon: 'pi pi-ban',
            command: () => this.openDialogRegistrarBloqueoCuenta('cancelacion'),
            //disabled: this.shouldDisableForRoles([roles.PLAFT, roles.ATENCION_CLIENTE, roles.ATENCION_CLIENTE_TD]) || this.disableActions
        },
        {
            label: 'Desbloqueo de Cuenta',
            icon: 'pi pi-unlock',
            command: () => this.openDialogRegistrarBloqueoCuenta('desbloqueo'),
            //disabled: this.shouldDisableForRoles([roles.PLAFT, roles.ATENCION_CLIENTE, roles.ATENCION_CLIENTE_TD]) || !this.disableActions
        },
        {
            label: 'Envío de EECC',
            icon: 'pi pi-file',
            command: () => this.openDialogEnvioEstadoCuenta(),
            //visible: this.bin === '41',
            //disabled: this.shouldDisableForRoles([roles.PLAFT, roles.FRAUDE, roles.ATENCION_CLIENTE]) || this.disableActions
        },
        {
            label: 'Ajustes Saldo',
            icon: 'pi pi-cog',
            command: () => this.openDialogCalcularCuentaAhorro(),
            //disabled: this.shouldDisableForRoles([roles.PLAFT, roles.FRAUDE, roles.ATENCION_CLIENTE]) || this.disableActions
        }



    ];
    constructor(
        private readonly excelService: ExcelService,
        private readonly cuentasDetailsService: CuentasDetailsService,
        private readonly toastr: MessageService,
        public datepipe: DatePipe,
        private readonly commonService: CommonService,
        private readonly securityEncryptedService: SecurityEncryptedService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly dialog: DialogService
    ) {
        this.activatedRoute.params.subscribe((params: any) => {
            this.uidCuenta = params.cuenta ? this.securityEncryptedService.decrypt(params.cuenta) : this.uidCuenta;
            this.uidCliente = params.cliente ? this.securityEncryptedService.decrypt(params.cliente) : this.uidCliente;
            this.tipoDoc = params.tipoDoc ? params.tipoDoc : this.tipoDoc;
            this.numDoc = params.numDoc ? params.numDoc : this.numDoc;
            this.loadPage();
        });
    }

    descargarExcelMovimientosMes(): void {
        if (!this.datosMovimientos || this.datosMovimientos.length === 0) {
            this.toastr.add({
                severity: 'warn',
                summary: 'Sin datos',
                detail: 'No existen movimientos para exportar'
            });
            return;
        }

        const fechaReporte = new Date();
        const excelName = `Reporte Movimientos ${moment(fechaReporte).format('DD/MM/YYYY')}.xlsx`;
        const sheetName = 'Datos';
        const filterLabel = 'Fecha de Reporte';

        const header: string[] = [
            'Fecha Movimiento',
            'Fecha Proceso',
            'Num. Tarjeta',
            'Cod. Descripción',
            'Descripción',
            'Tipo de Movimiento',
            'Importe',
            'Estado Confirmación',
            'Red(descripción)',
            'Reversado'
        ];

        const datos = this.datosMovimientos.map((x: any) => [
            this.datepipe.transform(x.fechaTransaccion, 'dd/MM/yyyy HH:mm:ss'),
            this.datepipe.transform(x.fechaContable, 'dd/MM/yyyy'),
            x.enmascarado,
            x.codigoClasificacionTransaccion,
            x.descripcion,
            x.tipoMovimiento,
            x.monto,
            x.estadoConfirmacion,
            x.descOrigenInt,
            x.reversado ? 'Si' : 'No'
        ]);

        this.excelService.generateExcel(
            header,
            excelName,
            sheetName,
            [],
            datos,
            fechaReporte,
            filterLabel
        );
    }


    openDialogCalcularCuentaAhorro(): void {
        this.openDialogGenerico({
            component: CalcularCuentaAhorroComponent,
            header: 'Ajuste de Saldo y Cálculo de Intereses',
            width: '40vw',
            successMessage: 'Ajuste de saldo registrado',
            errorSummary: 'Error openDialogAjustarSaldo',
            dialogData: {
                uidCliente: this.uidCliente,
                uidCuenta: this.uidCuenta,
                numeroCuenta: this.datosCuenta?.numeroCuenta,
                planes: this.datosSaldoPorPlan?.planes || [],
                tasa: this.datosInteresTarifario?.tasaEquivalenteAnual,
                saldoDisponible: this.datosSaldoPorPlan?.planes?.find((p: any) => p.codigoPlan === '01')?.capital
            }
        });
    }
    private openDialogGenerico(config: {
        component: any;
        header: string;
        width: string;
        successMessage: string;
        errorSummary: string;
        dialogData: any;
    }): void {

        if (!config.dialogData?.saldoDisponible) {
            this.toastr.add({
                severity: 'error',
                summary: '',
                detail: 'No se encontró saldo disponible'
            });
            return;
        }

        const dialogRef = this.dialog.open(config.component, {
            header: config.header,
            width: config.width,
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: { '960px': '75vw', '640px': '90vw' },
            data: config.dialogData
        });

        if (dialogRef) {
            dialogRef.onClose.subscribe(({ data } = {} as any) => {
                if (!data) {
                    return;
                }

                if (data.codigo === 0) {
                    this.getCuenta();
                    this.toastr.add({
                        severity: 'success',
                        summary: '',
                        detail: config.successMessage
                    });
                    return;
                }

                this.toastr.add({
                    severity: 'error',
                    summary: config.errorSummary,
                    detail: `Error en la operación: ${data.mensaje || ''}`
                });
            });
        }
    }
    visibilidadTarjeta(tarjeta: any): void {
        const tarjetaId = tarjeta.idTarjeta;

        // Caso 1: Ya está visible → ocultar
        if (tarjeta.numTarjetaVisible) {
            this.actualizarTarjeta(tarjetaId, { numTarjetaVisible: false });
            return;
        }

        // Caso 2: Ya está desenmascarado → mostrar directamente
        if (tarjeta.desenmascarado) {
            this.actualizarTarjeta(tarjetaId, { numTarjetaVisible: true });
            return;
        }

        // Caso 3: Hay que llamar al servicio para obtenerla
        this.commonService.getCardNumberFullEncrypted(tarjeta.token).subscribe({
            next: (resp: any) => {
                if (resp.codigo !== 0) {
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error visibilidadTarjeta()',
                        detail: resp.mensaje
                    });
                    return;
                }
                const datosDesencriptados = this.commonService.decryptResponseCardNumber(resp);
                const desenmascarado = datosDesencriptados.tarjeta.slice(3);
                this.actualizarTarjeta(tarjetaId, {
                    numTarjetaVisible: true,
                    desenmascarado
                });
            },
            error: () => {
                this.toastr.add({
                    severity: 'error',
                    summary: 'Error visibilidadTarjeta()',
                    detail: 'Error en el servicio de obtener tarjeta desencriptada'
                });
            }
        });
    }

    private actualizarTarjeta(id: number, cambios: any): void {
        this.datosTarjetas = this.datosTarjetas.map((item: any) =>
            item.idTarjeta === id ? { ...item, ...cambios } : item
        );
    }
    openDialogEnvioEstadoCuenta(): void {

        const saldoDisponible = this.datosSaldoPorPlan?.planes
            .find((e: any) => e.codigoPlan === '01');

        if (!saldoDisponible) {
            this.toastr.add({
                severity: 'error',
                summary: 'Saldo no disponible',
                detail: 'No se encontró saldo disponible'
            });
            return;
        }

        const dialogRef = this.dialog.open(CobroComisionComponent, {
            header: 'Envío de EECC',
            width: '40vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                uidCuenta: this.uidCuenta,
                uidCliente: this.uidCliente,
                saldoDisponible: saldoDisponible.capital
            }
        });

        if (dialogRef) {
            dialogRef.onClose.subscribe(resp => {

                if (!resp) {
                    return;
                }

                if (resp.data?.codigo === 0) {
                    this.getCuenta();
                    this.toastr.add({
                        severity: 'success',
                        summary: 'Operación exitosa',
                        detail: 'Ajuste de saldo registrado'
                    });
                    return;
                }

                this.toastr.add({
                    severity: 'error',
                    summary: 'Error openDialogEnvioEstadoCuenta',
                    detail: 'Error en el servicio de ajustar saldo'
                });

            });
        }
    }
    openDialogDetalleMovimiento(data: any) {
        this.dialog.open(DetalleMovimientoComponent, {
            header: 'Detalle Movimiento',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                movimiento: data,
                datosCliente: this.datosCliente,
                datosCuenta: this.datosCuenta,
            }
        });
    }
    openDialogRegistrarRetencion(): void {
        const saldoDisponible = this.datosSaldoPorPlan?.planes
            ?.find((e: any) => e.codigoPlan === '01');

        if (!saldoDisponible) {
            this.toastr.add({
                severity: 'error',
                summary: '',
                detail: 'No se encontró saldo disponible'
            });
            return; // ✔ evita flujo inválido — recomendado por SonarQube
        }

        const dialogRef = this.dialog.open(RegistrarRetencionComponent, {
            header: 'Registrar retención',
            width: '30vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                uidCuenta: this.uidCuenta,
                uidCliente: this.uidCliente,
                saldoDisponible: saldoDisponible.capital
            }
        });

        if (dialogRef) {
            dialogRef.onClose.subscribe(resp => {
                if (resp?.data?.codigo === 0) {
                    this.getCuenta();
                    this.getCuentaRetenciones();
                    this.toastr.add({
                        severity: 'success',
                        summary: '',
                        detail: 'Retención registrada'
                    });
                } else if (resp) {
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error openDialogRegistrarRetencion',
                        detail: 'Error en el servicio de registrar retención'
                    });
                }
            });
        }
    }
    ngOnInit() {
        this.loadPage();
    }
    listAccounts() {
        this.dialog.open(VerCuentaRelacionadaComponent, {
            header: 'Cuentas Relacionadas',
            width: '40vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: this.listProductos
        });
    }
    loadPage() {
        this.getCuenta();
        this.getCliente();
        this.getClientePuc();
        this.getCuentaTarjetas();
        this.getCuentaRetenciones();
        this.getCuentaBloqueos();
    }
    getClientePuc(): void {
        const tipoDocumento = this.tipoDoc;
        const numeroDocumento = this.numDoc;

        const elementTemp = MERGE_DOCUMENT_TYPES_ABA_PUC.find(
            e => e.aba === tipoDocumento
        );

        if (!elementTemp) {
            this.toastr.add({
                severity: 'error',
                summary: 'Error getClientePuc',
                detail: 'Tipo de documento no reconocido'
            });
            return;
        }

        const tipoDocumentoPuc = elementTemp.puc;

        this.commonService
            .getClientePorCuentaPuc(tipoDocumentoPuc, numeroDocumento)
            .subscribe({
                next: (res: any) => {
                    if (res.codigo === 0 && res.data) {

                        const data = res.data;

                        this.datosCliente = {
                            ...this.datosCliente,
                            primerNombre: data.primerNombre ?? '',
                            segundoNombre: data.segundoNombre ?? '',
                            primerApellido: data.primerApellido ?? '',
                            segundoApellido: data.segundoApellido ?? '',
                            nombres: `${data.primerNombre ?? ''} ${data.segundoNombre ?? ''}`.trim(),
                            apellidos: `${data.primerApellido ?? ''} ${data.segundoApellido ?? ''}`.trim(),
                            correoElectronico: data.correoElectronico ?? '',
                            telefono: data.telefono ?? '',
                            direccion: data.direccion ?? ''
                        };

                    } else if (res.codigo === -1) {
                        this.toastr.add({
                            severity: 'error',
                            summary: 'Error getClientePuc',
                            detail: res.mensaje ?? 'Error desconocido'
                        });
                    }
                },
                error: () => {
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error getClientePuc',
                        detail: 'Error en el servicio de obtener datos del cliente'
                    });
                }
            });
    }
    getCuentaTarjetas() {
        this.datosTarjetas = [];
        this.loadingTarjetas = true;
        const clienteUid = this.uidCliente;
        const cuentaUid = this.uidCuenta;

        this.cuentasDetailsService.getTarjetas(clienteUid, cuentaUid)
            .subscribe((resp: any) => {
                this.loadingTarjetas = false;
                if (resp['codigo'] == 0) {
                    this.datosTarjetas = resp['data'].content;
                    this.datosTarjetas = this.datosTarjetas.map((item: any) => {
                        return {
                            ...item,
                            numTarjetaVisible: false
                        }
                    })
                } else if (resp['codigo'] == -1) {
                    this.toastr.add({ severity: 'error', summary: 'Error getTarjetas', detail: resp['mensaje'] });
                }
            }, (_error) => {
                this.loadingTarjetas = false;
                this.toastr.add({ severity: 'error', summary: 'Error getTarjetas', detail: 'Error en el servicio de obtener datos de las tarjetas' });
            });

    }

    getTarjetaBloqueos(event: any) {
        this.datosTarjetaBloqueos = [];
        this.loadingTarjetaBloqueos = true;

        const idTarjeta = event.data.idTarjeta;
        const clienteUid = this.uidCliente;
        const cuentaUid = this.uidCuenta;
        const token = event.data.token;

        this.cuentasDetailsService.getTarjetaBloqueos(idTarjeta, clienteUid, cuentaUid, token)
            .subscribe((resp: any) => {
                this.loadingTarjetaBloqueos = false;
                console.log('getTarjetaBloqueos()...', resp);

                if (resp['codigo'] == 0) {
                    this.datosTarjetaBloqueos = resp['data'].sort((a: any, b: any) => new Date(b.fechaBloqueo).getTime() - new Date(a.fechaBloqueo).getTime());
                } else if (resp['codigo'] == -1) {
                    this.toastr.add({ severity: 'error', summary: 'Error getTarjetaBloqueos', detail: resp['mensaje'] });
                }
            }, (_error) => {
                this.loadingTarjetaBloqueos = false;
                this.toastr.add({ severity: 'error', summary: 'Error getTarjetaBloqueos', detail: 'Error en el servicio de obtener bloqueos tarjeta' });
            });

    }

    getCliente() {
        const tipoDocumento = this.tipoDoc;
        const numeroDocumento = this.numDoc;

        this.commonService.getCliente(tipoDocumento, numeroDocumento)
            .subscribe(
                (resp: any) => {
                    console.log('getCliente()...', resp);
                    if (resp['codigo'] == 0) {
                        let desCodTipoDoc = resp['data'].desCodTipoDoc;
                        let numDocIdentidad = resp['data'].numDocIdentidad;
                        if (desCodTipoDoc == 'DNI' && numDocIdentidad.length < 8) {
                            const limit = 8 - numDocIdentidad.length;
                            for (let index = 0; index < limit; index++) {
                                numDocIdentidad = '0' + numDocIdentidad;
                            }
                        }
                        this.datosCliente.desCodTipoDoc = desCodTipoDoc;
                        this.datosCliente.numDocIdentidad = numDocIdentidad;
                        this.datosCliente.nombresApellidos = resp['data'].nombresApellidos;
                    } else if (resp['codigo'] == -1) {
                        this.toastr.add({ severity: 'error', summary: 'Error getCliente', detail: resp['mensaje'] });
                    }
                }, (_error) => {
                    this.toastr.add({ severity: 'error', summary: 'Error getCliente', detail: 'Error en el servicio de obtener datos del cliente' });
                }
            );

    }

    openDialogRegistrarBloqueoCuenta(tipo: any): void {

        let header = "";
        switch (tipo) {
            case 'bloqueo':
                header = 'Bloqueo de cuenta';
                break;
            case 'cancelacion':
                header = 'Cancelación de cuenta';
                break;
            default:
                header = 'Desbloqueo de cuenta';
                break;
        }
        const dialogRef = this.dialog.open(RegistrarBloqueoCuentaComponent, {
            header: header,
            width: '30vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                uidCuenta: this.uidCuenta,
                uidCliente: this.uidCliente,
                datosCuenta: this.datosCuenta,
                datosCliente: this.datosCliente,
                tipo: tipo,
                showCancelButton: this.showCancelButton
            }
        });

        if (dialogRef) {
            dialogRef.onClose.subscribe((resp: any) => {
                if (resp !== undefined) {
                    if (resp.data['codigo'] == 0) {
                        this.getCuenta();
                        this.getCuentaBloqueos();
                        this.toastr.add({ severity: 'success', summary: '', detail: 'Bloqueo de cuenta registrado' });
                    } else {
                        this.toastr.add({ severity: 'error', summary: 'Error openDialogRegistrarBloqueoCuenta', detail: 'Error en el servicio de registrar bloqueo de cuenta' });
                    }
                }
            });
        }
    }

    descargarTemplateConstanciaBloqueoTarjetaPdf(rowData: any): void {

        if (!rowData?.fechaBloqueo) {
            this.toastr.add({
                severity: 'error',
                summary: 'Fecha inválida',
                detail: 'No se pudo procesar la fecha de bloqueo'
            });
            return;
        }

        const fecha = new Date(rowData.fechaBloqueo);
        fecha.setHours(fecha.getHours() - 5);

        const day = fecha.getDate().toString().padStart(2, '0');
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const year = fecha.getFullYear();

        const hours24 = fecha.getHours();
        const minutes = fecha.getMinutes().toString().padStart(2, '0');
        const ampm = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 = (hours24 % 12 || 12).toString().padStart(2, '0');

        const fechaBloqueo = `${day}/${month}/${year} ${hours12}:${minutes} ${ampm}`;

        const data = this.replaceNulls({
            fechaBloqueo,
            origen: rowData.usuarioCreacion,
            idExternoBloqueo: rowData.idExterno,
            motivoBloqueo: rowData.descMotivoBloqueo,
            numeroTarjeta: rowData.tarjeta,
            tipoDocumento: this.datosCliente.desCodTipoDoc,
            numeroDocumento: this.datosCliente.numDocIdentidad,
            nombreCliente: this.datosCliente.nombres,
            apellidoCliente: this.datosCliente.apellidos,
            producto: this.datosCuenta.producto
        });

        this.cuentasDetailsService.templateConstanciaBloqueoTarjetaPdf(data);
    }

    menuItems: any[] = [];
    onButtonClick(event: Event, rowData: any, menu: any) {
        this.menuItems = this.getMenuItems(rowData);
        menu.toggle(event);
    }
    // ✅ Este método devuelve el menú según la fila + rol
    getMenuItems(rowData: any, menu?: any): MenuItem[] {
        const items: MenuItem[] = [];
        const role = this.securityEncryptedService.getRolesDecrypted();
        // Mostrar solo si el rol lo permite
        if (![this.roles.OPERACION_CONTABLE, this.roles.PLAFT, this.roles.CONSULTA].includes(role)) {
            items.push({
                label: 'Bloqueo/Desbloqueo Tarjeta',
                icon: 'pi pi-ban',
                disabled: this.disableActions,
                command: () => {
                    setTimeout(() => {
                        this.openDialogRegistrarBloqueoTarjeta(rowData)
                        menu?.hide();  // cerrar directamente
                    }, 5);
                }
            });
        }
        items.push({
            label: 'Botones',
            icon: 'pi pi-cog',
            command: () => this.openDialogDetalleBotonera(rowData)
        });

        return items;
    }
    dialogRef: DynamicDialogRef | null = null;
    openDialogRegistrarBloqueoTarjeta(tarjeta: any) {

        this.dialogRef = this.dialog.open(RegistrarBloqueoTarjetaComponent, {
            header: 'Registrar bloqueo de Tarjeta',
            width: '40vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                uidCuenta: this.uidCuenta,
                uidCliente: this.uidCliente,
                tarjeta: tarjeta
            }
        });
        this.dialogRef?.onClose.subscribe((resp) => {
            if (resp !== undefined) {
                if (resp.data['codigo'] == 0) {
                    this.getCuentaTarjetas();
                    this.toastr.add({ severity: 'success', summary: '', detail: 'Bloqueo de tarjeta registrada' });
                } else {
                    this.toastr.add({ severity: 'error', summary: 'Error openDialogRegistrarBloqueoTarjeta', detail: 'Error en el servicio de registrar bloqueo de tarjeta' });
                }
            }
        });
    }
    openDialogDetalleBotonera(tarjeta: any) {
        this.dialog.open(DetalleBotoneraComponent, {
            header: 'Estado de la Botonería',
            width: '30vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                uidCuenta: this.uidCuenta,
                uidCliente: this.uidCliente,
                tarjeta: tarjeta
            }

            // width: '750px',
            // data: {
            //     uidCliente: this.uidCliente,
            //     uidCuenta: this.uidCuenta,
            //     tarjeta: tarjeta
            // }
        });
    }
    getCuentaRetenciones() {
        this.datosRetenciones = [];
        this.loadingRetenciones = true;
        const cuentaUid = this.uidCuenta;

        this.cuentasDetailsService.getCuentaRetenciones(cuentaUid)
            .subscribe((resp: any) => {
                this.loadingRetenciones = false;
                if (resp['codigo'] == 0) {
                    this.datosRetenciones = resp['data'];
                    this.getMatchRetenciones();
                } else if (resp['codigo'] == -1) {
                    this.toastr.add({ severity: 'error', summary: 'Error getRetenciones', detail: resp['mensaje'] });
                }
            }, (_error) => {
                this.loadingRetenciones = false;
                this.toastr.add({ severity: 'error', summary: 'Error getCuenta', detail: 'Error en el servicio de obtener retenciones' });
            });

    }
    getMatchRetenciones() {
        if (this.listaTipoRentecion.length > 0) {
            this.datosRetenciones = this.datosRetenciones.map((x: any) => {
                const tipoRentecion = this.listaTipoRentecion.find((y: any) => y.codTablaElemento == Number.parseInt(x.tipoRetencion));
                return {
                    ...x,
                    descTipoRetencion: tipoRentecion?.valCadLargo
                }
            });
        }
    }
    getCuenta() {
        this.loadingSaldos = true;
        this.disableActions = false;

        const source$ = this.commonService.getCuenta(this.uidCliente);

        source$.subscribe({
            next: resp => this.procesarCuenta(resp),
            error: () => this.errorCuenta("Error en el servicio de obtener datos de la cuenta")
        });
    }

    private procesarCuenta(resp: any) {
        this.loadingSaldos = false;

        if (resp?.codigo === 0) {
            const datosCuenta = this.obtenerDatosCuenta(resp);

            if (!datosCuenta) {
                this.errorCuenta("La cuenta no existe en la respuesta");
                return;
            }

            this.prepararVisualCuenta(datosCuenta);
            this.cargarProductos(resp);
            this.cargarDatosCuenta(datosCuenta);

            if (datosCuenta.codEstadoCuenta === "03") {
                this.disableActions = true;
            }

            this.getSaldosMes();
            this.getCuentaMovimientos();
            this.getInteresTarifarios();
            this.getDatosSaldos(datosCuenta);

        } else if (resp?.codigo === -1) {
            this.resetCuenta();
            this.toastr.add({
                severity: "error",
                summary: "Error getCuenta",
                detail: resp.mensaje
            });
        }
    }

    private obtenerDatosCuenta(resp: any) {
        return resp?.data?.content?.find((e: any) => e.uIdCuenta === this.uidCuenta);
    }

    private prepararVisualCuenta(datosCuenta: any) {
        this.bin = datosCuenta.numeroCuenta.slice(0, 2);
        this.showCardContainer = this.bin === "41";
    }

    private cargarProductos(resp: any): void {
        if (!resp?.data?.content) {
            this.listProductos = [];
            return;
        }

        this.listProductos = resp.data.content
            .filter((p: any) => p.uIdCuenta !== this.uidCuenta)
            .map((p: any) => this.mapProducto(p));
    }

    private mapProducto(p: any): any {
        return {
            uidCuenta: p.uIdCuenta,
            uidCliente: this.uidCliente,
            tipoDoc: this.tipoDoc,
            numDoc: this.numDoc,
            producto: p.producto,
            numCuenta: p.numeroCuenta,
            codEstadoCuenta: p.codEstadoCuenta,
            motivoBloqueo: p.motivoBloqueo,
            fechaApertura: p.fechaApertura,
            fechaBaja: p.fechaBaja
        };
    }

    private cargarDatosCuenta(datosCuenta: any) {
        this.datosCuenta.numeroCuenta = datosCuenta.numeroCuenta;
        this.datosCuenta.numeroCuentaCci = datosCuenta.numeroCuentaCci;
        this.datosCuenta.estadoCuenta = datosCuenta.estadoCuenta;
        this.datosCuenta.codigoEstadoCuenta = datosCuenta.codEstadoCuenta;
        this.datosCuenta.motivoBloqueo = datosCuenta.motivoBloqueo;
        this.datosCuenta.codigoMotivoBloqueo = datosCuenta.codigoMotivo;
        this.datosCuenta.producto = datosCuenta.producto;
        this.datosCuenta.fechaApertura = datosCuenta.fechaApertura;
        this.datosCuenta.fechaBaja = datosCuenta.fechaBaja;
        this.datosCuenta.saldoDisponible = datosCuenta.saldoDisponible;
        this.datosCuenta.saldoRetenido = datosCuenta.saldoRetenido;
    }

    private resetCuenta() {
        this.saldoAutorizado = [];
        this.datosMovimientos = [];
        this.datosSaldoPorPlan = null;
        this.loadingSaldos = false;
        this.disableActions = true;
    }

    private errorCuenta(mensaje: string) {
        this.resetCuenta();
        this.toastr.add({
            severity: "error",
            summary: "Error getCuenta",
            detail: mensaje
        });
    }


    getSaldosMes(event: any = null) {
        if (event) {
            this.actualizarRangoFechas(event);
        }

        if (!this.finiSaldoMes || !this.ffinSaldoMes) return;

        this.iniciarCargaSaldosMes();

        this.cuentasDetailsService.postSaldosMes(this.construirPayloadSaldosMes())
            .subscribe({
                next: resp => this.procesarRespuestaSaldosMes(resp),
                error: () => this.errorSaldosMes("Error en el servicio de obtener saldos del mes de la cuenta")
            });
    }

    private actualizarRangoFechas(event: any) {
        this.ffinSaldoMes = moment(event).add(1, 'months').startOf('month').toISOString();
        this.finiSaldoMes = moment(this.ffinSaldoMes).subtract(1, 'months').startOf('month').toISOString();
    }

    private iniciarCargaSaldosMes() {
        this.datosSaldosMes = [];
        this.loadingSaldosMes = true;
    }

    private construirPayloadSaldosMes() {
        return {
            fechaDesde: this.finiSaldoMes,
            fechaHasta: this.ffinSaldoMes,
            pagina: 0,
            tamanio: 999999000,
            uidCliente: this.uidCliente,
            uidCuenta: this.uidCuenta,
            codigoTipoPlan: '01',
            numeroCuenta: this.datosCuenta.numeroCuenta,
            tipoDocumento: this.tipoDoc,
            numeroDocumento: this.numDoc
        };
    }

    private procesarRespuestaSaldosMes(resp: any) {
        this.loadingSaldosMes = false;

        if (resp?.codigo === 0) {
            this.datosSaldosMes = resp.data;
            return;
        }

        if (resp?.codigo === -1) {
            this.toastr.add({
                severity: 'error',
                summary: 'Error getSaldosMes',
                detail: resp.mensaje
            });
        }
    }

    private errorSaldosMes(detalle: string) {
        this.loadingSaldosMes = false;
        this.toastr.add({
            severity: 'error',
            summary: 'Error getSaldosMes',
            detail: detalle
        });
    }

    getInteresTarifarios() {
        this.loadingPagoRetencion = false;

        const servicio$ = this.cuentasDetailsService.getInteresTarifario({ accountUid: this.uidCuenta });

        servicio$.subscribe({
            next: resp => this.procesarInteresTarifario(resp),
            error: () => this.errorInteresTarifario()
        });
    }

    private procesarInteresTarifario(resp: any) {
        if (resp?.codigo === 0) {
            this.datosInteresTarifario = resp.data;
            return;
        }

        if (resp?.codigo === -1) {
            this.datosInteresTarifario = {
                ...resp.data,
                tasaEquivalenteAnual: 0
            };
        }
    }

    private errorInteresTarifario() {
        this.toastr.add({
            severity: 'error',
            summary: 'Error getInteresTarifarios',
            detail: 'Error en el servicio de obtener tarifario'
        });
    }

    getDatosSaldos(datosCuenta: any): void {


        this.cuentasDetailsService.getObtenerSaldos(datosCuenta, this.uidCliente, this.uidCuenta)
            .subscribe(resp => {
                let planes = [];
                if (resp[0].codigo == 0) {
                    for (const element of resp[0].data.content) {
                        const planMap: any = {
                            '01': 'Disponible  (Plan 1)',
                            '02': 'Retenido (Plan 2)',
                            '03': 'Garantizado (Plan 3)'
                        };
                        const plan = planMap[element.codigoPlan] ?? '';
                        planes.push({
                            plan: plan,
                            codigoPlan: element.codigoPlan,
                            capital: element.saldoDisponible,
                            interes: 0,
                            total: 0
                        });
                    }
                }
                planes = planes.sort((a, b) => a.codigoPlan.localeCompare(b.codigoPlan));
                if (resp[1].codigo == 0) {
                    for (const element of resp[1].data.planes) {
                        let index = planes.findIndex(plan => plan.codigoPlan == element.codigoPlan);
                        if (index > -1) {
                            planes[index].interes = element.interes;
                        }
                    }
                }
                planes = planes.map((plan: any) => {
                    const total = plan.capital + plan.interes;
                    return { ...plan, total }
                })
                if (resp[2].codigo == 0) {
                    this.saldoAutorizado.push({
                        saldoPendiente: datosCuenta.saldoPendiente,
                        saldoAbono: resp[2].data.saldoAbono,
                        saldoCargo: resp[2].data.saldoCargo,
                        saldoTotal: resp[2].data.saldoTotal
                    });
                }
                this.datosSaldoPorPlan = {
                    saldoCapital: planes.reduce((sum, item) => sum + item.capital, 0),
                    saldoInteres: planes.reduce((sum, item) => sum + item.interes, 0),
                    saldoTotal: planes.reduce((sum, item) => sum + item.total, 0),
                    planes: planes
                }
                const hasNotZeroValues = planes.some(plan =>
                    [plan.capital, plan.interes, plan.total].some(value => value !== 0)
                );
                if (
                    !hasNotZeroValues &&
                    datosCuenta.saldoPendiente == 0 &&
                    (this.saldoAutorizado.length > 0 && this.saldoAutorizado[0].saldoAbono == 0) &&
                    (this.saldoAutorizado.length > 0 && this.saldoAutorizado[0].saldoCargo == 0) &&
                    (this.saldoAutorizado.length > 0 && this.saldoAutorizado[0].saldoTotal == 0)
                ) {
                    this.showCancelButton = true;
                }
            }, error => {
                this.showCancelButton = false;
                this.toastr.add({ severity: 'error', summary: 'Error getCuenta', detail: "Error en el servicio de obtener saldos de la cuenta" });
            });

    }

    private formatFechaBloqueo(fecha: string): string {
        if (!fecha) { return ''; }

        const date = new Date(fecha);
        date.setHours(date.getHours() - 5); // Ajuste UTC

        const pad = (n: number) => String(n).padStart(2, '0');

        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();

        const hours = date.getHours();
        const minutes = pad(date.getMinutes());

        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = pad(hours % 12 || 12);

        return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
    }

    descargarTemplateConstanciaBloqueoCuentaPdf(rowData: any): void {

        const fechaBloqueo = this.formatFechaBloqueo(rowData.fechaBloqueo);

        const data = {
            fechaBloqueo,
            idBloqueo: rowData.idBloqueo,
            motivoBloqueo: rowData.descripcionMotivoBloqueo,
            tipoDocumento: this.datosCliente?.desCodTipoDoc,
            numeroDocumento: this.datosCliente?.numDocIdentidad,
            nombreCliente: this.datosCliente?.nombres,
            apellidoCliente: this.datosCliente?.apellidos,
            producto: this.datosCuenta?.producto,
            numeroCuenta: this.datosCuenta?.numeroCuenta
        };

        this.cuentasDetailsService.templateConstanciaBloqueoCuentaPdf(this.replaceNulls(data));
    }
    getCuentaBloqueos() {
        this.datosCuentaBloqueos = [];
        this.loadingCuentaBloqueos = true;
        const cuentaUid = this.uidCuenta;
        this.cuentasDetailsService.getCuentaBloqueos(cuentaUid)
            .subscribe((resp: any) => {
                this.loadingCuentaBloqueos = false;
                console.log('getCuentaBloqueos()...', resp);

                if (resp['codigo'] == 0) {
                    this.datosCuentaBloqueos = resp['data'].sort((a: any, b: any) => new Date(b.fechaBloqueo).getTime() - new Date(a.fechaBloqueo).getTime());
                } else if (resp['codigo'] == -1) {
                    this.toastr.add({ severity: 'error', summary: 'Error getCuentaBloqueos', detail: resp['mensaje'] });
                }
            }, (_error) => {
                this.loadingCuentaBloqueos = false;
                this.toastr.add({ severity: 'error', summary: 'Error getCuentaBloqueos', detail: 'Error en el servicio de obtener bloqueos cuenta' });
            });
    }
    changeModelFechaRango(event: any) {
        this.finiMovimientos = '';
        this.ffinMovimientos = '';
        if (event[0] !== null && event[1] !== null) {
            this.finiMovimientos = moment(this.fechaRangoMovimientos![0]).format('YYYY-MM-DD') + 'T05:00:00.000Z';
            this.ffinMovimientos = moment(this.fechaRangoMovimientos![1]).format('YYYY-MM-DD') + 'T05:00:00.000Z'
            this.getCuentaMovimientos();
        }
    }
    getCuentaMovimientos() {
        this.datosMovimientos = [];
        this.loadingMovimientos = true;

        const requestData = {
            fechaDesde: this.finiMovimientos,
            fechaHasta: this.ffinMovimientos,
            pagina: 0,
            tamanio: 999999000,
            uidCliente: this.uidCliente,
            uidCuenta: this.uidCuenta,
            codigoTipoPlan: '01',
            numeroCuenta: this.datosCuenta?.numeroCuenta,
            tipoDocumento: this.tipoDoc,
            numeroDocumento: this.numDoc
        };

        const handleResponse = (resp: any) => {
            this.loadingMovimientos = false;
            const dataMov = resp?.data ?? [];

            this.datosMovimientos = dataMov
                .filter((mov: any) => mov.estadoConfirmacion === 'CONFIRMED')
                .map((mov: any) => this.mapMovimiento(mov))
                .sort((a: any, b: any) =>
                    new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
                );
        };

        const handleError = () => {
            this.loadingMovimientos = false;
            this.toastr.add({
                severity: 'error',
                summary: 'Error getCuentaMovimientos',
                detail: 'Error en el servicio de obtener movimientos de la cuenta'
            });
        };

        this.cuentasDetailsService.postCuentaMovimientos(requestData)
            .subscribe({ next: handleResponse, error: handleError });
    }

    private mapMovimiento(mov: any) {
        const movimientoMap: any = {
            [TYPE_TRANSACTION.RETIRO]: 'CARGO',
            [TYPE_TRANSACTION.DEPOSITO]: 'ABONO'
        };
        const tipoMovimiento = movimientoMap[mov.tipoMovimiento] ?? mov.tipoMovimiento;

        const red = this.listaRed?.find((x: any) => x.codigo === mov.codigoOrigen);

        return {
            ...mov,
            tipoMovimiento,
            descOrigenInt: red?.descripcion ?? ''
        };
    }


    private replaceNulls(obj: any): any {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, value ?? ''])
        );
    }
    openDialogVerArchivo(base64File: any, fileName: any): void {
        const type = base64File.substring(base64File.indexOf('/') + 1, base64File.indexOf(';base64'));
        let displayFile = true;

        if (type !== FILE_TYPE.PDF && type !== FILE_TYPE.JPEG && type !== FILE_TYPE.PNG) {
            this.commonService.downloadFile(base64File, fileName);
            return;
        }
        this.dialog.open(VerArchivoComponent, {
            width: '40vw',
            height: displayFile ? '90vh' : '150px',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                base64File: base64File,
                fileName: fileName,
                displayFile: displayFile
            }
        });
    }
}