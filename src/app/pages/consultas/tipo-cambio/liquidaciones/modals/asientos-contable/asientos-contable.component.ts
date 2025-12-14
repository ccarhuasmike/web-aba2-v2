import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { CommonService } from '@/pages/service/commonService';
import { LiquidacionesService } from '../../liquidaciones.service';

@Component({
    selector: 'app-asientos-contable',
    templateUrl: './asientos-contable.component.html',
    styleUrls: ['./asientos-contable.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule],
    providers: [MessageService]
})
export class AsientosContableComponent implements OnInit {

    rows = 10;
    rowsPerPageOptions: number[] = [];
    datosAsientosContables: any[] = [];
    loadingAsientosContables = false;
    idCambioMonedaLiqDiariaRes = '';

    constructor(
        private readonly dialogRef: DynamicDialogRef,
        private readonly config: DynamicDialogConfig,
        private readonly commonService: CommonService,
        private readonly liquidacionesService: LiquidacionesService,
        private readonly messageService: MessageService
    ) {
        this.idCambioMonedaLiqDiariaRes = this.config.data.idCambioMonedaLiqDiariaRes;
    }

    ngOnInit(): void {
        this.getAsientosContables();
    }

    getAsientosContables(): void {
        this.loadingAsientosContables = true;

        this.liquidacionesService.getAsientosContables(this.idCambioMonedaLiqDiariaRes).subscribe({
            next: (resp: any) => {
                this.loadingAsientosContables = false;

                if (resp['codigo'] === 0) {
                    this.datosAsientosContables = resp['data'] || [];
                    this.rowsPerPageOptions = this.commonService.getRowsPerPageOptions(this.rows, this.datosAsientosContables.length);
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error getAsientosContables', detail: resp['mensaje'] });
                }
            },
            error: () => {
                this.loadingAsientosContables = false;
                this.messageService.add({ severity: 'error', summary: 'Error getAsientosContables', detail: 'Error en el servicio de obtener asientos contables' });
            }
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
