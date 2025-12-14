import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { FormsModule } from '@angular/forms';
import { DisableContentByRoleDirective } from '@/layout/Utils/directives/disable-content-by-role.directive';
import { AccordionModule } from 'primeng/accordion';
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
        public datepipe: DatePipe,
        private dateTzPipe: DatetzPipe,
        private excelService: ExcelService,
        private commonService: CommonService,
        private securityEncryptedService: SecurityEncryptedService,
        private autorizacionesService: AutorizacionesService,
        private activatedRoute: ActivatedRoute,
        private router: Router
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
            if (bin !== '457339') {


                this.toastr.add({
                    severity: 'warn',
                    summary: '',
                    detail: 'Solo se puede realizar la búsqueda por tarjetas de débito'
                });
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
                this.toastr.add({
                    severity: 'error',
                    summary: 'Error getCuenta',
                    detail: 'Error en el servicio de obtener cliente de la tarjeta'
                });
                return;
            }
        } else {
            this.toastr.add({
                severity: 'error',
                summary: 'Error getCuenta',
                detail: 'Error en el servicio de obtener token de la tarjeta'
            });
            return;
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
                        console.log('getCliente()...', resp);

                        if (resp['codigo'] == 0) {
                            this.datosCliente = resp['data'];
                            this.uidCliente = resp['data'].uIdCliente;
                        } else if (resp['codigo'] == -1) {

                            this.toastr.add({
                                severity: 'error',
                                summary: 'Error getCliente',
                                detail: resp['mensaje']
                            });

                        } else if (resp['codigo'] == 1) {
                            this.toastr.add({
                                severity: 'error',
                                summary: 'Error getCliente',
                                detail: 'El cliente que se intenta buscar no existe'
                            });
                        }
                        resolve(true);
                    }, (_error) => {
                        this.toastr.add({
                            severity: 'error',
                            summary: 'Error getCliente',
                            detail: 'Error en el servicio de obtener datos del cliente'
                        });
                        reject();
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

                    console.log('getCuenta()...', resp);

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
                        this.toastr.add({
                            severity: 'error',
                            summary: 'Error getCuenta',
                            detail: resp['mensaje']
                        });
                    }
                    resolve(true);
                }, (_error) => {
                    this.loadingCuentas = false;

                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error getCuenta',
                        detail: 'Error en el servicio de obtener datos de la cuenta'
                    });
                    reject();
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
        const query = event.query;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.descripcion.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                this.filteredElementTipoDocumento.push(element);
            }
        }
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

        let ffin = new Date(this.ffinAutorizaciones);
        ffin.setDate(ffin.getDate() + 1);
        ffin.setMinutes(ffin.getMinutes() - 1);

        const form = this.formBusquedaAutorizaciones.value;

        const uidCliente = this.uidCliente;
        const uidCuenta = this.uidCuenta;
        const fechaInicio = this.commonService.dateFormatISO8601(this.finiAutorizaciones);
        const fechaFin = ffin.toISOString();
        const tamanio = 999999000;
        const pagina = 0;

        this.autorizacionesService.getCuentaAutorizaciones(
            uidCliente,
            uidCuenta,
            fechaInicio,
            fechaFin,
            pagina,
            tamanio
        ).subscribe((resp: any) => {
            this.loadingAutorizaciones = false;

            if (resp['codigo'] == 0) {

                this.datosAutorizaciones = resp.data.content.filter((dato: any) => {
                    const esValidoOperacion = !form.codigoOperacion || dato.codigoOperacion == form.codigoOperacion;
                    const esValidoGrupo = !form.codigoGrupo || dato.transaccionProcesada.groupingCode == form.codigoGrupo;
                    const esValidoEntrada = !form.codigoEntrada || dato.transaccionProcesada.entryCode == form.codigoEntrada;

                    return esValidoOperacion && esValidoGrupo && esValidoEntrada;
                }).sort((a: any, b: any) => { return b.idTransaccion - a.idTransaccion });

                this.datosAutorizaciones = this.datosAutorizaciones.map((dato: any) => {

                    dato['fechaTransaccion'] = this.dateTzPipe.transform(dato.fechaTransaccion, 'DD/MM/YYYY HH:mm:ss');

                    dato['fechaConfirmacion'] = this.dateTzPipe.transform(dato.fechaConfirmacion, 'DD/MM/YYYY');

                    if (dato.transaccionRequest.dataElements) {
                        dato['referencia'] = (dato.transaccionRequest.dataElements.retrievalReferenceNumber) ? dato.transaccionRequest.dataElements.retrievalReferenceNumber : dato.uIdreferenciaExterna;
                    } else {
                        dato['referencia'] = dato.uIdreferenciaExterna;
                    }

                    if (dato.estadoAutorizacion == 'REJECTED') {
                        dato['codigoRechazo'] = dato.codigoEstadoOrigen ? dato.codigoEstadoOrigen : dato.codEstadoTransaccion;
                        dato.transaccionResponse['ftcCode'] = `${dato.transaccionRequest.messageType ?? ''}${dato.transaccionRequest.operationCode ?? ''}${dato.transaccionRequest.groupingCode ?? ''}${dato.transaccionRequest.entryCode ?? ''}`;
                    }

                    dato['estadoReversado'] = !dato.reversado ? 'NO' : 'SI';

                    const red = this.tipoRedes.find((x: any) => x.id == dato.descOrigen);
                    dato.descOrigenInt = red ? red.descripcion : ''

                    dato.tarjeta['numTarjetaVisible'] = false;

                    return dato;
                });
            } else if (resp['codigo'] == -1) {
                this.toastr.add({
                    severity: 'error',
                    summary: 'Error searchCuentaAutorizaciones',
                    detail: resp['mensaje']
                });

            }
        }, (_error) => {
            this.loadingAutorizaciones = false;
            this.toastr.add({
                severity: 'error',
                summary: 'Error searchCuentaAutorizaciones',
                detail: 'Error en el servicio de obtener autorizaciones de la cuenta'
            });
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
        if (autorizacion.tarjeta.numTarjetaVisible) {
            this.datosAutorizaciones = this.datosAutorizaciones.map((item: any) => {
                if (item.tarjeta.idTarjeta == autorizacion.tarjeta.idTarjeta) {
                    item.tarjeta.numTarjetaVisible = false;
                }
                return item;
            })
        } else if (autorizacion.tarjeta?.desenmascarado) {
            this.datosAutorizaciones = this.datosAutorizaciones.map((item: any) => {
                if (item.tarjeta.idTarjeta == autorizacion.tarjeta.idTarjeta) {
                    item.tarjeta.numTarjetaVisible = true;
                }
                return item;
            })
        } else {
            const token = autorizacion.tarjeta.token
            this.commonService.getCardNumberFullEncrypted(token).subscribe((resp: any) => {
                if (resp['codigo'] == 0) {
                    const body = resp;
                    const datosTarjetaDecrypted = this.commonService.decryptResponseCardNumber(body);
                    this.datosAutorizaciones = this.datosAutorizaciones.map((item: any) => {
                        if (item.tarjeta.idTarjeta == autorizacion.tarjeta.idTarjeta) {
                            item.tarjeta.numTarjetaVisible = true;
                            const desenmascarado = datosTarjetaDecrypted.tarjeta.slice(3);
                            item.tarjeta['desenmascarado'] = desenmascarado;
                        }
                        return item;
                    })
                } else {
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error visibilidadTarjeta()',
                        detail: resp['mensaje']
                    });
                }
            }, (_error) => {
                this.toastr.add({
                    severity: 'error',
                    summary: 'Error visibilidadTarjeta()',
                    detail: 'Error en el servicio de obtener tarjeta desencriptada'
                });

            })
        }
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
            ffinAutorizaciones.setMonth(ffinAutorizaciones.getMonth() - 2);
            const finiAutorizacionesAux = new Date(this.finiAutorizaciones)
            if (finiAutorizacionesAux < ffinAutorizaciones) {
                return this.toastr.add({
                    severity: 'warn',
                    summary: 'Validacion de Fechas:',
                    detail: 'El intervalo de rango de fechas es 2 meses como maximo'
                });
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
                        this.toastr.add({
                            severity: 'success',
                            summary: '',
                            detail: 'Liberacion Manual de Autorizacion registrada'
                        });
                        this.searchCuentaAutorizaciones();
                    } else {
                        this.toastr.add({
                            severity: 'error',
                            summary: 'Error openDialogLiberarManualAutorizacion',
                            detail: 'Error en el servicio de liberacion manual de autorizacion'
                        });
                    }
                }
            })
        }
    }

    exportExcel() {
        const numeroCuenta = this.datosCuenta.numeroCuenta;
        const bin = numeroCuenta.slice(0, 2);
        const moneda = ACCOUNT_TYPES.find(type => type.bin === bin)?.moneda;

        const fechaReporte = new Date();
        const excelName = 'Reporte autorizaciones ' + moment(fechaReporte).format('DD/MM/YYYY') + '.xlsx';
        const sheetName = 'Datos';
        const datos: any[] = [];
        const header = [];
        const isCurrency: any[] = [];
        const filterLavel = 'Fecha de Reporte';

        header.push('Id Transacción');
        header.push('Fecha Transacción');
        header.push('Fecha Proceso');
        header.push('Cuenta');
        header.push('Cod. Descripción');
        header.push('Descripción');
        header.push('Referencia');
        header.push('Código Autorización');
        header.push('Importe');
        header.push('Moneda');
        header.push('Red');
        header.push('Estado Confirmación');
        header.push('Estado Autorización');
        header.push('Estado Reversado');
        header.push('Cod. Rechazo');
        header.push('Num. Tarjeta');
        header.push('Token');
        header.push('Id Transacción Original');
        header.push('Razón Estado');

        this.datosAutorizaciones.forEach(x => {
            const list = [];

            list.push(x.idTransaccion);
            list.push(x.fechaTransaccion);
            list.push(x.fechaConfirmacion);
            list.push(numeroCuenta);
            list.push(x.transaccionResponse.ftcCode);
            list.push(x.transaccionResponse.ftcDescription);
            list.push(x.transaccionRequest.dataElements ? x.transaccionRequest.dataElements.retrievalReferenceNumber : x.uIdreferenciaExterna);
            list.push(x.codigoAutorizacion);
            list.push(parseFloat(x.transaccionProcesada.monto));
            list.push(moneda);
            list.push(x.descOrigenInt);
            list.push(x.estadoAutorizacion == 'REJECTED' ? '' : x.estadoConfirmacion)
            list.push(x.estadoAutorizacion)
            list.push(x.estadoReversado)
            list.push(x.codigoRechazo);
            list.push(x.tarjeta.enmascarado);
            list.push(x.tarjeta.token);
            list.push(x.transaccionResponse.financialTransaction.parentTransactionId);
            list.push(x.motivoTransaccion)

            datos.push(list);
        });

        this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, fechaReporte, filterLavel);
    }
}
