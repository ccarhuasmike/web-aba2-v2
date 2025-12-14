import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { LiquidacionesService } from '../../liquidaciones.service';

@Component({
    selector: 'app-regularizar-liquidacion',
    templateUrl: './regularizar-liquidacion.component.html',
    styleUrls: ['./regularizar-liquidacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputNumberModule, ButtonModule],
    providers: [MessageService]
})
export class RegularizarLiquidacionComponent implements OnInit {

    formRegularizarLiquidacion!: FormGroup;
    datoLiquidacion: any;
    disableButton = false;

    constructor(
        public dialogRef: DynamicDialogRef,
        private readonly config: DynamicDialogConfig,
        private readonly liquidacionesService: LiquidacionesService,
        private readonly messageService: MessageService
    ) {
        this.datoLiquidacion = this.config.data;
    }

    ngOnInit(): void {
        this.createForm();
    }

    createForm(): void {
        this.formRegularizarLiquidacion = new FormGroup({
            idCambioMonedaLiqDiariaDet: new FormControl(this.datoLiquidacion.idCambioMonedaLiqDiariaDet, [Validators.required]),
            tipoOperacion: new FormControl(this.datoLiquidacion.tipoOperacionOh, [Validators.required]),
            importeOrigen: new FormControl(null, [Validators.required])
        });
    }

    regularizarLiquidacion(): void {
        this.disableButton = true;

        if (this.formRegularizarLiquidacion.invalid) {
            this.disableButton = false;
            return;
        }

        const form = this.formRegularizarLiquidacion.value;
        const usuario = JSON.parse(localStorage.getItem('userABA') || '{}');

        const object = {
            idCambioMonedaLiqDiariaDet: form.idCambioMonedaLiqDiariaDet,
            tipoOperacion: form.tipoOperacion,
            importeOrigen: form.importeOrigen,
            usuario: usuario.email
        };

        this.liquidacionesService.postRegularizarLiquidacion(object).subscribe({
            next: (resp: any) => {
                this.disableButton = false;
                this.dialogRef.close({
                    data: resp
                });
            },
            error: () => {
                this.disableButton = false;
                this.messageService.add({ severity: 'error', summary: 'Error regularizar', detail: 'No se pudo regularizar' });
                this.dialogRef.close();
            }
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
