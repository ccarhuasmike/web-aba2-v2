import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DetalleBotoneraService } from './detalle-botonera.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { ROLES } from '@/layout/Utils/constants/aba.constants';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { DisableContentByRoleDirective } from '@/layout/Utils/directives/disable-content-by-role.directive';
import { TableModule } from 'primeng/table';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { environment } from 'src/environments/environment.qa';
@Component({
    selector: 'app-detalle-botonera',
    templateUrl: './detalle-botonera.component.html',
    standalone: true,
    styleUrls: ['./detalle-botonera.component.scss'],
    imports: [FormsModule, ToggleSwitchModule, TableModule, DisableContentByRoleDirective, MessageModule, TabsModule, ToastModule, ButtonModule, ReactiveFormsModule, CommonModule],
    providers: [MessageService],
    encapsulation: ViewEncapsulation.None
})
export class DetalleBotoneraComponent implements OnInit {

    uidCliente: any = '';
    uidCuenta: any = '';
    tarjeta: any;

    rowsEstadoActual: any[] = [];
    rowsHistorial: any[] = [];

    roles: any = ROLES;

    constructor(
        private readonly detalleBotoneraService: DetalleBotoneraService,
        private readonly toastr: MessageService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.uidCliente = config.data.uidCliente;
        this.uidCuenta = config.data.uidCuenta;
        this.tarjeta = config.data.tarjeta;
    }

    ngOnInit(): void {
        this.getConfiguracion();
        this.getHistorial();
    }

    getConfiguracion() {
        const uidCliente = this.uidCliente;
        const uidCuenta = this.uidCuenta;
        const token = this.tarjeta.token;

   
            this.detalleBotoneraService.getConfiguracion(uidCliente, uidCuenta, token)
                .subscribe(
                    (resp: any) => {
                        if (resp['codigo'] == 0) {
                            const data = resp['data'];
                            let rows = this.getRows();
                            this.rowsEstadoActual = rows;
                            this.rowsEstadoActual[0].cliente = data.habilitacionUsoGeneral;
                            this.rowsEstadoActual[1].cliente = data.comprasInternet;
                            this.rowsEstadoActual[2].cliente = data.comprasInternacionales;
                            this.rowsEstadoActual[3].cliente = data.disposicionEfectivo;
                            console.log('ESTADO ACTUAL...', this.rowsEstadoActual);
                        } else if (resp['codigo'] == -1) {
                            this.toastr.add({ severity: 'error', summary: 'Error getConfiguracion', detail: resp['mensaje'] });
                        }
                    },
                    (_error) => {
                        this.toastr.add({ severity: 'error', summary: 'Error getConfiguracion', detail: 'Error en el servicio de obtener configuración de botonera' });
                    }
                );
        
    }

    getHistorial() {
        const uidCliente = this.uidCliente;
        const uidCuenta = this.uidCuenta;
        const token = this.tarjeta.token;

            this.detalleBotoneraService.getHistorial(uidCliente, uidCuenta, token)
                .subscribe(
                    (resp: any) => {
                        console.log('getHistorial()...', resp);
                        if (resp['codigo'] == 0) {
                            let data = resp['data'];
                            for (const element of data) {
                                let object = {
                                    rowsEstadoActual: this.getRows(),
                                    fechaRegistro: element.fechaRegistro
                                }
                                object.rowsEstadoActual[0].cliente = element.habilitacionUsoGeneral;
                                object.rowsEstadoActual[1].cliente = element.comprasInternet;
                                object.rowsEstadoActual[2].cliente = element.comprasInternacionales;
                                object.rowsEstadoActual[3].cliente = element.disposicionEfectivo;
                                this.rowsHistorial.push(object);
                            }
                            console.log('HISTORIAL...', this.rowsHistorial);
                        } else if (resp['codigo'] == -1) {
                            this.toastr.add({ severity: 'error', summary: 'Error getHistorial', detail: resp['mensaje'] });
                        }
                    },
                    (_error) => {
                        this.toastr.add({ severity: 'error', summary: 'Error getHistorial', detail: 'Error en el servicio de obtener historial de botonera' });
                    }
                );
        
    }

    getRows() {
        return [
            {
                field: 'BOTÓN GENERAL',
                icon: 'pi-wrench',
                cs: false,
                riesgo: false,
                cliente: false
            },
            {
                field: 'COMPRAS POR INTERNET',
                icon: 'pi-globe',
                cs: false,
                riesgo: false,
                cliente: false
            },
            {
                field: 'COMPRAS EN EL EXTERIOR',
                icon: 'airplanemode_active',
                cs: false,
                riesgo: false,
                cliente: false
            },
            {
                field: 'DISPOSICIÓN DE EFECTIVO',
                icon: 'pi-dollar',
                cs: false,
                riesgo: false,
                cliente: false
            }
        ];
    }
}
