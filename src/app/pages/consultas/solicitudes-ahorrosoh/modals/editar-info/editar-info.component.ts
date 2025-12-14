import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { CALENDAR_DETAIL } from '@/layout/Utils/constants/aba.constants';
import { SolicitudesAhorrosohService } from '../../solicitudes-ahorrosoh.service';

@Component({
    selector: 'app-editar-info-solicitud',
    templateUrl: './editar-info.component.html',
    styleUrls: ['./editar-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, DatePickerModule, InputTextModule, DividerModule],
    providers: [MessageService, DatePipe]
})
export class EditarInfoSolicitudComponent implements OnInit {

    formEditar!: FormGroup;
    es = CALENDAR_DETAIL;
    data: any = {};

    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private datePipe: DatePipe,
        private messageService: MessageService,
        private solicitudesAhorrosohService: SolicitudesAhorrosohService
    ) {
        this.data = this.config.data || {};
        this.createForm();
    }

    ngOnInit(): void { }

    private createForm(): void {
        let fechaNacimientoDate = new Date(this.data.fechaNacimiento);
        fechaNacimientoDate = new Date(fechaNacimientoDate.setHours(fechaNacimientoDate.getHours() + 5));

        this.formEditar = new FormGroup({
            fechaNacimiento: new FormControl(fechaNacimientoDate, [Validators.required]),
            celular: new FormControl(this.data.celular, [Validators.required, Validators.minLength(9), Validators.maxLength(9)]),
            email: new FormControl(this.data.email, [Validators.required, Validators.email]),
            primerNombre: new FormControl(this.data.primerNombre, [Validators.required]),
            segundoNombre: new FormControl(this.data.segundoNombre),
            apellidoPaterno: new FormControl(this.data.apellidoPaterno, [Validators.required]),
            apellidoMaterno: new FormControl(this.data.apellidoMaterno, [Validators.required])
        });
    }

    actualizarDatosSolicitud(): void {
        if (this.formEditar.invalid) {
            return;
        }

        const form = this.formEditar.value;
        const usuario = JSON.parse(localStorage.getItem('userABA') ?? '{}');
        const fechaNacimiento = this.datePipe.transform(form.fechaNacimiento, 'yyyy-MM-dd');

        const request = {
            tipoDocumento: this.data.tipoDoc,
            numeroDocumento: this.data.numeroDoc,
            tipoProducto: this.data.tipoProducto,
            paso: this.data.paso,
            codMoneda: Number(this.data.moneda),
            celular: Number(form.celular),
            email: form.email,
            fechaNacimiento,
            primerNombre: form.primerNombre,
            segundoNombre: form.segundoNombre,
            apellidoPaterno: form.apellidoPaterno,
            apellidoMaterno: form.apellidoMaterno,
            usuarioActualizacion: usuario?.email
        };

        this.solicitudesAhorrosohService.putActualizarDatosSolicitud(request).subscribe({
            next: (resp: any) => {
                if (resp?.codigo === 0) {
                    this.dialogRef.close({ resp });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error actualizarDatosSolicitud',
                        detail: resp?.mensaje || 'Error inesperado'
                    });
                }
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error actualizarDatosSolicitud',
                    detail: 'Error en el servicio de editar solicitud ahorros oh'
                });
            }
        });
    }

    cerrarModal(): void {
        this.dialogRef.close();
    }
}
