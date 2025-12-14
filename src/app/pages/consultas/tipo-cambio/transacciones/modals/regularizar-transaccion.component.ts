import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TransaccionesService } from '../transacciones.service';

@Component({
    selector: 'app-regularizar-transaccion',
    templateUrl: './regularizar-transaccion.component.html',
    styleUrls: ['./regularizar-transaccion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AutoCompleteModule, InputTextModule, ButtonModule, ToastModule],
    providers: [MessageService]
})
export class RegularizarTransaccionComponent implements OnInit {

    formRegularizarTrx!: FormGroup;

    datosTrx: any;
    estadoTipoCambio: any;
    estadosTipoCambio: any[] = [];

    filteredElementEstadoTipoCambio: any[] = [];

    disableButton = false;

    constructor(
        public dialogRef: DynamicDialogRef,
        private readonly config: DynamicDialogConfig,
        private readonly transaccionesService: TransaccionesService,
        private readonly messageService: MessageService
    ) {
        const data = this.config.data || {};
        this.datosTrx = data.datosTrx;
        this.estadosTipoCambio = data.estadosTipoCambio || [];
        this.estadoTipoCambio = this.estadosTipoCambio.find((e: any) => e.idCambioMonedaEstado == this.datosTrx.idCambioMonedaEstado);
        this.estadosTipoCambio = this.estadosTipoCambio.filter((e: any) => e.tipoEstado === 1 && (e.codigoEstado === '06' || e.codigoEstado === '07' || e.codigoEstado === '09'));
    }

    ngOnInit(): void {
        this.createForm();
    }

    createForm(): void {
        this.formRegularizarTrx = new FormGroup({
            idCambioMonedaOperacion: new FormControl(this.datosTrx?.idCambioMonedaOperacion, [Validators.required]),
            monedaEstado: new FormControl(''),
            nroOperacionCuentaOrigen: new FormControl(''),
            nroOperacionCuentaDestino: new FormControl('')
        });
    }

    regularizarTrx(): void {
        this.disableButton = true;

        if (this.formRegularizarTrx.invalid) {
            this.disableButton = false;
            return;
        }

        const form = this.formRegularizarTrx.value;

        if (
            !form.idCambioMonedaOperacion &&
            !form.nroOperacionCuentaOrigen &&
            !form.nroOperacionCuentaDestino
        ) {
            this.disableButton = false;
            return;
        }

        const usuario = JSON.parse(localStorage.getItem('userABA') || '{}');
        let idCambioMonedaEstadoOriginal = '';

        if (this.estadoTipoCambio) {
            idCambioMonedaEstadoOriginal = this.estadoTipoCambio.idCambioMonedaEstado;
        }

        const object = {
            idCambioMonedaOperacion: form.idCambioMonedaOperacion,
            cuentaOrigen: form.nroOperacionCuentaOrigen,
            cuentaDestino: form.nroOperacionCuentaDestino,
            idCambioMonedaEstado: form.monedaEstado ? form.monedaEstado.idCambioMonedaEstado : idCambioMonedaEstadoOriginal,
            usuario: usuario.email
        };

        this.transaccionesService.postRegularizarTransaccion(object)
            .subscribe({
                next: (resp: any) => {
                    this.disableButton = false;
                    this.dialogRef.close({
                        data: resp
                    });
                },
                error: () => {
                    this.disableButton = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error en el servicio de regularización de transacción' });
                    this.dialogRef.close();
                }
            });
    }

    filterElementEstadoTipoCambio(event: any, data: any): void {
        this.filteredElementEstadoTipoCambio = [];
        const query = event.query;
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.descripcionCorta.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                this.filteredElementEstadoTipoCambio.push(element);
            }
        }
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
