import { SecurityEncryptedService } from '@/layout/service/SecurityEncryptedService';
import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import {  TableModule } from 'primeng/table';
export interface CuentaRelacionada {
    uidCuenta?: string;
    uidCliente?: string;
    tipoDoc?: string;
    numDoc?: string;
    producto?: string;
    numCuenta?: string;
    estadoCuenta?: string;
    fechaApertura?: Date;
    fechaBaja?: Date;
}

@Component({
    selector: 'app-ver-cuenta-relacionada',
    standalone: true,
    templateUrl: './ver-cuenta-relacionada.component.html',
    styleUrls: ['./ver-cuenta-relacionada.component.scss'],
    imports: [ButtonModule,CommonModule,TableModule],
})

export class VerCuentaRelacionadaComponent  {

    cuentaRelacionada: CuentaRelacionada[] = [];

    constructor(
        private readonly router: Router,
        private readonly securityEncryptedService: SecurityEncryptedService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.cuentaRelacionada = config.data;
    }

    

    goToAccount(data: any) {
        
        const uidCuenta = this.securityEncryptedService.encrypt(data.uidCuenta);
        const uidCliente = this.securityEncryptedService.encrypt(data.uidCliente);         

        this.router.navigate(['/cuenta/detalle', {
            cuenta: uidCuenta,
            cliente: uidCliente,
            tipoDoc: data.tipoDoc,
            numDoc: data.numDoc,
            numCuenta: data.numCuenta,
        }]);

        this.close();
    }

    close() {
        this.dialogRef.close({
            event: 'close'
        });
    }
}
