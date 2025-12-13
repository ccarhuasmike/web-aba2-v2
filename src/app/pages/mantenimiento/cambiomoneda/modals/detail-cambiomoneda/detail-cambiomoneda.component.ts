import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DAYS } from '@/layout/Utils/constants/aba.constants';
import { CambioMonedaService } from '../../cambiomoneda.service';
import { CommonModule } from '@angular/common';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { LogCampaniaDiaCambiomonedaComponent } from '../log-campania-dia-cambiomoneda/log-campania-dia-cambiomoneda.component';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';

@Component({
    selector: 'app-detail-cambiomoneda',
    templateUrl: './detail-cambiomoneda.component.html',
    styleUrls: ['./detail-cambiomoneda.component.scss'],
    imports: [MenuModule, TableModule, InputGroupAddonModule, InputGroupModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService, ConfirmationService],
    encapsulation: ViewEncapsulation.None
})

export class DetailCambioMonedaComponent implements OnInit {

    formDetalle: FormGroup;
    dataCampania: any;
    detalleCampania: any[] = [];

    constructor(
        public dialog: DialogService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly cambioMonedaService: CambioMonedaService
    ) {

        this.dataCampania = config.data;

        const fechaInicioFormat = config.data.fechaInicioFormat?.slice(0, 10);
        const fechaFinFormat = config.data.fechaFinFormat?.slice(0, 10);

        this.formDetalle = new FormGroup({
            codigoCampana: new FormControl(config.data.codigoCampana),
            descripcion: new FormControl(config.data.descripcion),
            fechaInicioFormat: new FormControl(fechaInicioFormat),
            fechaFinFormat: new FormControl(fechaFinFormat),
            tipoCampanaDesc: new FormControl(config.data.tipoCampanaDesc),
            tipoCambioCompraOhFormat: new FormControl(config.data.tipoCambioCompraOhFormat),
            tipoCambioVentaOhFormat: new FormControl(config.data.tipoCambioVentaOhFormat),
            tasaCompraOhFormat: new FormControl(config.data.tasaCompraOhFormat),
            tasaVentaOhFormat: new FormControl(config.data.tasaVentaOhFormat),
            tipoValidacionDesc: new FormControl(config.data.tipoValidacionDesc),
            montoValidacionFormat: new FormControl(config.data.montoValidacionFormat),
            descripcionLarga: new FormControl(config.data.descripcionLarga),
            usuarioRegistro: new FormControl(config.data.usuarioRegistro),
            fechaRegistroFormat: new FormControl(config.data.fechaRegistroFormat),
            usuarioAprobacion: new FormControl(config.data.usuarioAprobacion),
            fechaHoraAprobacionFormat: new FormControl(config.data.fechaHoraAprobacionFormat),
            usuarioCancelacion: new FormControl(config.data.usuarioCancelacion),
            fechaCancelacionFormat: new FormControl(config.data.fechaCancelacionFormat),
            usuarioVencimiento: new FormControl(config.data.usuarioVencimiento),
            fechaHoraVencimientoFormat: new FormControl(config.data.fechaHoraVencimientoFormat),
            usuarioActualizacion: new FormControl(config.data.usuarioActualizacion),
            fechaActualizacionFormat: new FormControl(config.data.fechaActualizacionFormat)
        });

        this.formDetalle.disable();
    }
    close() {
        this.dialogRef.close({
            event: 'cerrar'
        });
    }
    ngOnInit(): void {
        this.getListarDetalleCampania();
    }

    async getListarDetalleCampania() {
        const respuestaListadoDetalleCampania = await this.cambioMonedaService.getListarDetalleCampania(this.config.data.idCambioMonedaCampana);

        if (respuestaListadoDetalleCampania.codigo === 0) {
            this.detalleCampania = respuestaListadoDetalleCampania.data.map((item: any) => {
                const dias: any[] = DAYS;
                const dia = dias.find(e => e.id == Number.parseInt(item.codigoDia)).nombre;
                const estado = (item.indActivo == 1 || item.indActivo == null) ? 'Activo' : 'Inactivo';
                return {
                    ...item,
                    dia: dia,
                    estado: estado
                }
            });
        }
    }
    openDialogLogs(data: any) {
        this.dialog.open(LogCampaniaDiaCambiomonedaComponent, {
            header: 'Logs Campañas - Días',
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

    menuItems: any[] = [];
    onButtonClick(event: Event, rowData: any, menu: any) {
        this.menuItems = this.getMenuItems(rowData);
        menu.toggle(event);
    }
    // ✅ Este método devuelve el menú según la fila + rol
    getMenuItems(rowData: any, menu?: any): MenuItem[] {
        return [
            {
                label: 'Ver Logs',
                icon: 'pi pi-eye',
                command: () => this.openDialogLogs(rowData)
            }
        ];
    }
}