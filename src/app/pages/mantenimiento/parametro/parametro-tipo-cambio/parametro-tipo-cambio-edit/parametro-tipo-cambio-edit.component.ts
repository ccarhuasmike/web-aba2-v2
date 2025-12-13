import { Component, OnInit } from "@angular/core";
import { ParametroTipoCambioService } from "../parametro-tipo-cambio.service";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { MessageService, ConfirmationService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { ParametroEditComponent } from "@/shared/components/parametro-edit/parametro-edit.component";
import { ParametroEditBaseComponent } from "@/shared/components/parametro-edit-base/parametro-edit-base.component";
@Component({
    selector: 'app-parametro-tipo-cambio-edit',
    templateUrl: './parametro-tipo-cambio-edit.component.html',
    styleUrls: ['./parametro-tipo-cambio-edit.component.scss'],
    standalone: true,
    imports: [ParametroEditComponent],
    providers: [MessageService, DialogService, ConfirmationService],
})
export class ParametroTipoCambioEditComponent extends ParametroEditBaseComponent implements OnInit {

    constructor(
        private readonly servicio: ParametroTipoCambioService,
        fb: FormBuilder,
        toastr: MessageService,
        private readonly route: ActivatedRoute
    ) {
        super(fb, toastr);
        this.codParametro = this.route.snapshot.paramMap.get('id');
        this.loadParametro(this.codParametro);
    }

    ngOnInit(): void {
        this.loadGrupos();
    }

    getParametroService(id: any) {
        return this.servicio.getParametro(id);
    }
    getGrupoParametrosService() {
        return this.servicio.getGrupoParametros();
    }
    updateParametroService(data: any) {
        return this.servicio.putParametro(data);
    }
}