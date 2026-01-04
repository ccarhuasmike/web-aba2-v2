import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CommonService } from '@/pages/service/commonService';

@Component({
    selector: 'app-ver-info-solicitud',
    templateUrl: './detalle.component.html',
    styleUrls: ['./detalle.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, DividerModule, ButtonModule]
})
export class DetalleInfoSolicitudComponent implements OnInit {

    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly commonService: CommonService
    ) { }

    ngOnInit(): void {
        this.getDepartamento();
        this.getProvincias();
        this.getDistritos();
    }

    cerrarModal(): void {
        this.dialogRef.close();
    }

    private getDepartamento(): void {
        this.commonService.getDepartamento().subscribe((resp: any) => {
            const departamento = resp.data.find((e: any) => e.id.dptUbigeo === this.config.data.departamento);
            this.config.data.descDepartamento = departamento?.desUbigeo;
        });
    }

    private getProvincias(): void {
        const prvUbigeo = String(this.config.data.provincia).slice(2);
        this.commonService.getProvincia(this.config.data.departamento).subscribe((resp: any) => {
            const provincia = resp.data.find((e: any) => e.id.prvUbigeo === prvUbigeo);
            this.config.data.descProvincia = provincia?.desUbigeo;
        });
    }

    private getDistritos(): void {
        const codDpt = this.config.data.departamento;
        const codPrv = String(this.config.data.provincia).slice(2);
        const dstUbigeo = String(this.config.data.distrito).slice(4);
        this.commonService.getDistrito(codDpt, codPrv).subscribe((resp: any) => {
            const distrito = resp.data.find((e: any) => e.id.dstUbigeo === dstUbigeo);
            this.config.data.descDistrito = distrito?.desUbigeo;
        });
    }
}
