import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { ButtonModule } from "primeng/button";
import { CommonService } from "@/pages/service/commonService";

@Component({
    selector: 'app-solicitud-observada-detalle',
    templateUrl: './solicitud-observada-detalle.component.html',
    styleUrls: ['./solicitud-observada-detalle.component.scss'],    
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [ButtonModule, CommonModule]
})
export class SolicitudObservadaDetalleComponent implements OnInit {

    departamentos: any[] = [];
    provincias: any[] = [];
    distritos: any[] = [];
    data: any = {};

    constructor(
        public dialogRef: DynamicDialogRef,
        private readonly commonService: CommonService,
        private readonly config: DynamicDialogConfig
    ) { }

    ngOnInit() {
        this.data = this.config.data || {};
        this.getDepartamento();
        this.getProvincias();
        this.getDistritos();
    }

    getDepartamento() {
        this.commonService.getDepartamento()
            .subscribe((resp: any) => {
                const departamento = resp.data.find((e:any) => e.id.dptUbigeo === this.data.departamento);
                this.data.descDepartamento = departamento.desUbigeo;
            });
    }

    getProvincias() {
        const prvUbigeo = String(this.data.provincia).slice(2);
        this.commonService.getProvincia(this.data.departamento)
            .subscribe((resp: any) => {
                const provincia = resp.data.find((e:any) => e.id.prvUbigeo === prvUbigeo);
                this.data.descProvincia = provincia.desUbigeo;
            });
    }

    getDistritos() {
        const codDpt = this.data.departamento;
        const codPrv = String(this.data.provincia).slice(2);
        const dstUbigeo = String(this.data.distrito).slice(4);
        this.commonService.getDistrito(codDpt, codPrv)
            .subscribe((resp: any) => {
                const distrito = resp.data.find((e:any) => e.id.dstUbigeo === dstUbigeo);
                this.data.descDistrito = distrito.desUbigeo;
            });
    }

    cerrarModal() {
        this.dialogRef.close();
    }
}
