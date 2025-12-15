import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Campania } from '../../../layout/models/campania';
import { ListarCampania } from '../../../layout/models/listarCampania';
import { CAMPAIGN_TYPES, CAMPAIGN_VALIDATION_TYPES, ROLES } from '@/layout/Utils/constants/aba.constants';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AddCambioMonedaComponent } from './modals/add-cambiomoneda/add-cambiomoneda.component';
import { DetailCambioMonedaComponent } from './modals/detail-cambiomoneda/detail-cambiomoneda.component';
import { LogCampaniaCambiomonedaComponent } from './modals/log-campania-cambiomoneda/log-campania-cambiomoneda.component';
import { CambioMonedaService } from './cambiomoneda.service';
import { CommonService } from '@/pages/service/commonService';

@Component({
    selector: 'app-cambiomoneda',
    templateUrl: './cambiomoneda.component.html',
    styleUrls: ['./cambiomoneda.component.scss'],
    standalone: true,
    imports: [InputGroupModule, SelectModule, ConfirmDialogModule, TooltipModule, TabsModule, MenuModule, DividerModule, InputNumberModule, DatePickerModule, TableModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [CurrencyPipe, DatePipe, MessageService, DialogService, ConfirmationService],
    encapsulation: ViewEncapsulation.None,
})
export class CambioMonedaComponent implements OnInit {

    rows = 20;
    rowsPerPageOptions: any[] = [];
    estadosTipoCambio: any[] = [];
    data: ListarCampania[] = [];
    campania!: Campania;
    loading: boolean = false;
    roles: any = ROLES;

    constructor(
        public dialog: DialogService,
        public datepipe: DatePipe,
        public currencyPipe: CurrencyPipe,
        private readonly toastr: MessageService,
        private readonly commonService: CommonService,
        private readonly cambioMonedaService: CambioMonedaService,
        private readonly confirmationService: ConfirmationService,
    ) { }

    ngOnInit(): void {
        this.getEstadosTipoCambio();
        this.getCampanias();
    }

    getEstadosTipoCambio() {
        this.commonService.getEstadosTipoCambio().subscribe((resp: any) => {
            this.estadosTipoCambio = resp['data'];
        }, (_error: any) => {
            this.toastr.add({ severity: 'error', summary: 'Error getEstadosTipoCambio', detail: 'Error en el servicio de obtener estados tipo de cambio' });
        })
    }
    menuItems: any[] = [];
    onButtonClick(event: Event, rowData: any, menu: any) {
        this.menuItems = this.getMenuItems(rowData);
        menu.toggle(event);
    }
    // ✅ Este método devuelve el menú según la fila + rol
    getMenuItems(rowData: any, menu?: any): MenuItem[] {

        const actions: { label: string; icon: string; action: () => void }[] = [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                action: () => {
                    this.openDialogEditar(rowData); // evita retornar la Promise
                    menu?.hide();
                }
            },
            { label: 'Ver Detalle', icon: 'pi pi-eye', action: () => { this.openDialogDetalle(rowData) } },
            { label: 'Aprobar', icon: 'pi pi-check', action: () => { this.openDialogAprobar(rowData) } },
            { label: 'Vigente', icon: 'pi pi-check', action: () => { this.openDialoVigente(rowData) } },
            { label: 'Cancelar', icon: 'pi pi-minus-circle', action: () => { this.openDialogCancelar(rowData) } },
            { label: 'Ver Logs', icon: 'pi pi-eye', action: () => { this.openDialogLogs(rowData) } }
        ];

        return actions.map(a => ({
            label: a.label,
            icon: a.icon,
            command: () => a.action() // siempre retorna void
        }));
    }

    getCampanias() {
        this.loading = true;

        const service$ =  this.cambioMonedaService.getCampanias();

        service$.subscribe({
            next: (resp: any) => {
                this.loading = false;

                if (resp?.codigo !== 0) {
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error getCampanias',
                        detail: resp?.mensaje ?? 'Error inesperado'
                    });
                    return;
                }

                this.data = resp.data.map((item: any) => this.mapCampania(item));
                this.rowsPerPageOptions = this.commonService.getRowsPerPageOptions(this.rows, this.data.length);
            },
            error: () => {
                this.loading = false;
                this.toastr.add({
                    severity: 'error',
                    summary: 'Error getCampanias',
                    detail: 'Error en el servicio de obtener campañas'
                });
            }
        });
    }



    private mapCampania(item: any) {
        const findName = (arr: any[], id: number) =>
            arr.find(e => e.id === id)?.nombre;

        const formatMoney = (value: number, digits: string) =>
            this.currencyPipe.transform(value || 0, ' ', 'symbol', digits);

        const formatDate = (date: any, format: string) =>
            this.datepipe.transform(date, format);

        return {
            ...item,
            tipoCampanaDesc: findName(CAMPAIGN_TYPES, item.tipoCampana),
            tipoValidacionDesc: findName(CAMPAIGN_VALIDATION_TYPES, item.tipoValidacion),
            tipoCambioCompraOhFormat: formatMoney(item.tipoCambioCompraOh, '1.2-4'),
            tipoCambioVentaOhFormat: formatMoney(item.tipoCambioVentaOh, '1.2-4'),
            tasaCompraOhFormat: formatMoney(item.tasaCompraOh, '1.2-4'),
            tasaVentaOhFormat: formatMoney(item.tasaVentaOh, '1.2-4'),
            montoValidacionFormat: formatMoney(item.montoValidacion, '1.2-2'),

            fechaInicioFormat: formatDate(item.fechaInicio, 'dd/MM/yyyy'),
            fechaFinFormat: formatDate(item.fechaFin, 'dd/MM/yyyy'),
            fechaRegistroFormat: formatDate(item.fechaRegistro, 'dd/MM/yyyy HH:mm:ss'),
            fechaHoraAprobacionFormat: formatDate(item.fechaHoraAprobacion, 'dd/MM/yyyy HH:mm:ss'),
            fechaCancelacionFormat: formatDate(item.fechaCancelacion, 'dd/MM/yyyy HH:mm:ss'),
            fechaHoraVencimientoFormat: formatDate(item.fechaHoraVencimiento, 'dd/MM/yyyy HH:mm:ss'),
            fechaActualizacionFormat: formatDate(item.fechaActualizacion, 'dd/MM/yyyy HH:mm:ss')
        };
    }


    openDialogAgregar() {
        this.dialog.open(AddCambioMonedaComponent, {
            header: 'REGISTRAR CAMPAÑA',
            width: '40vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            //data: data,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            }
        });


    }

    openDialogEditar(data: any) {
        const dialogRef = this.dialog.open(AddCambioMonedaComponent, {
            header: data ? 'MODIFICAR DATOS CAMPAÑA' : 'REGISTRAR CAMPAÑA',
            width: '40vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            data: data,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            }
        });
        if (dialogRef) {
            dialogRef.onClose.subscribe((res: any) => {
                this.getCampanias();
            });
        }

    }
    openDialogDetalle(data: any = null) {
        this.dialog.open(DetailCambioMonedaComponent, {
            header: 'Detalle Campaña',
            width: '45vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            data: data,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            }
        });
    }
    openDialogLogs(data: any = null) {
        this.dialog.open(LogCampaniaCambiomonedaComponent, {
            header: 'Logs Campañas',
            width: '60vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            data: data,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            }
        });
    }

    async openDialogAprobar(data: any) {

        const estadoTipoCambio = this.estadosTipoCambio.find((item: any) => item.idCambioMonedaEstado === data.idCambioMonedaEstado);
        if (
            !estadoTipoCambio ||
            (estadoTipoCambio.tipoEstado === 4 && estadoTipoCambio.codigoEstado !== '01')
        ) {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'No se puede aprobar la campaña ya que el estado es diferente a REGISTRO' });
            return;
        }

        const idCambioMonedaEstado = this.estadosTipoCambio.find((item: any) => item.tipoEstado === 4 && item.codigoEstado === '02')?.idCambioMonedaEstado;

        if (!idCambioMonedaEstado) {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'No se puede aprobar la campaña ya que el estado es inválido' });
            return;
        }

        const respuestaListadoDetalleCampania = await this.cambioMonedaService.getListarDetalleCampania(data.idCambioMonedaCampana);

        if (respuestaListadoDetalleCampania.codigo === 0 && respuestaListadoDetalleCampania.data.length <= 0) {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'No se puede aprobar la campaña ya que no tiene días registrados' });
            return;
        }

        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        const campania = { ...data };
        campania.usuarioAprobacion = usuario.email;
        campania.idCambioMonedaEstado = idCambioMonedaEstado;
        this.campania = campania;


        this.confirmationService.confirm({
            header: 'Aprobar Campaña',
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
                this.cambioMonedaService.postActualizarCabeceraCampania(this.campania)
                    .subscribe((resp: any) => {
                        if (resp['codigo'] == 0) {
                            this.toastr.add({ severity: 'success', summary: '', detail: 'Se aprobó correctamente la campaña' });
                            this.getCampanias();
                        } else {
                            this.toastr.add({ severity: 'error', summary: 'Error openDialogAprobar', detail: resp['mensaje'] });
                        }
                    }, (_error: any) => {
                        this.toastr.add({ severity: 'error', summary: 'Error openDialogAprobar', detail: 'Error en el servicio de actualizar campaña' });
                    });
            },
            reject: () => {
                this.toastr.add({ severity: 'error', summary: 'Error openDialogAprobar', detail: 'Error en el servicio de actualizar campaña' });
            }
        });
    }
    async openDialoVigente(data: any) {
        const estadoTipoCambio = this.estadosTipoCambio.find((item: any) => item.idCambioMonedaEstado === data.idCambioMonedaEstado);

        if (
            !estadoTipoCambio ||
            (estadoTipoCambio.tipoEstado === 4 && estadoTipoCambio.codigoEstado !== '02')
        ) {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'No se puede pasar a vigente la campaña ya que el estado es diferente a APROBADO' });
            return;
        }

        const idCambioMonedaEstado = this.estadosTipoCambio.find((item: any) => item.tipoEstado === 4 && item.codigoEstado === '03')?.idCambioMonedaEstado;

        if (!idCambioMonedaEstado) {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'No se puede pasar a vigente la campaña ya que el estado es inválido' });
            return;
        }

        const respuestaListadoDetalleCampania = await this.cambioMonedaService.getListarDetalleCampania(data.idCambioMonedaCampana);

        if (respuestaListadoDetalleCampania.codigo === 0 && respuestaListadoDetalleCampania.data.length <= 0) {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'No se puede aprobar la campaña ya que no tiene días registrados' });
            return;
        }

        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        const campania = { ...data };
        campania.usuarioAprobacion = usuario.email;
        campania.idCambioMonedaEstado = idCambioMonedaEstado;
        this.campania = campania;


        this.confirmationService.confirm({
            header: 'Vigente Campaña',
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

                this.cambioMonedaService.postActualizarCabeceraCampania(this.campania)
                    .subscribe((resp: any) => {
                        if (resp['codigo'] == 0) {
                            this.toastr.add({ severity: 'success', summary: '', detail: 'Se paso a vigente correctamente la campaña' });
                            this.getCampanias();
                        } else {
                            this.toastr.add({ severity: 'error', summary: '', detail: resp['mensaje'] });
                        }
                    }, (_error: any) => {
                        this.toastr.add({ severity: 'error', summary: 'Error openDialoVigente', detail: 'Error en el servicio de actualizar campaña' });
                    });
            },
            reject: () => {
                this.toastr.add({ severity: 'error', summary: 'Error openDialoVigente', detail: 'Error en el servicio de actualizar campaña' });

            }
        });


    }

    async openDialogCancelar(data: any) {
        const estadoTipoCambio = this.estadosTipoCambio.find((item: any) => item.idCambioMonedaEstado === data.idCambioMonedaEstado);

        if (
            !estadoTipoCambio ||
            (estadoTipoCambio.tipoEstado === 4 && estadoTipoCambio.codigoEstado == '04')
        ) {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'No se puede cancelar la campaña ya que el estado tiene que ser diferente a VENCIDO' });
            return;
        }
        const idCambioMonedaEstado = this.estadosTipoCambio.find((item: any) => item.tipoEstado === 4 && item.codigoEstado === '05')?.idCambioMonedaEstado;

        if (!idCambioMonedaEstado) {
            this.toastr.add({ severity: 'warn', summary: '', detail: 'No se puede cancelar la campaña ya que el estado es inválido' });
            return;
        }

        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        const campania = { ...data };
        campania.usuarioCancelacion = usuario.email
        campania.idCambioMonedaEstado = idCambioMonedaEstado;
        this.campania = campania;

        this.confirmationService.confirm({
            header: 'Cancelar Campaña',
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
                this.cambioMonedaService.postActualizarCabeceraCampania(this.campania).subscribe((resp: any) => {
                    if (resp['codigo'] == 0) {
                        this.toastr.add({ severity: 'success', summary: '', detail: 'Se canceló correctamente la campaña' });
                        this.getCampanias();
                    } else {
                        this.toastr.add({ severity: 'error', summary: 'Error openDialogCancelar', detail: resp['mensaje'] });
                    }
                }, (_error: any) => {
                    this.toastr.add({ severity: 'error', summary: 'Error openDialogCancelar', detail: 'Error en el servicio de actualizar campaña' });
                });
            },
            reject: () => {
                this.toastr.add({ severity: 'error', summary: 'Error openDialogCancelar', detail: 'Error en el servicio de actualizar campaña' });
            }
        });
    }
}