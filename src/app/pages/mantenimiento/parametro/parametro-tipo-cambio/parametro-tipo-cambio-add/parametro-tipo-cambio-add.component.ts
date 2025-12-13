import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ParametroTipoCambioService } from "../parametro-tipo-cambio.service";
import { Router } from "@angular/router";
import { MessageService, ConfirmationService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { ParametroAddReusableComponent } from "@/shared/components/parametro-add/parametro-add.component";
import { RegistrarGrupoDebitoComponent } from "@/shared/components/parametro-group/parametro-group.component";
import { UtilService } from "@/utils/util.services";

@Component({
    selector: 'app-parametro-tipo-cambio-add',
    templateUrl: './parametro-tipo-cambio-add.component.html',
    styleUrls: ['./parametro-tipo-cambio-add.component.scss'],
    standalone: true,
    imports: [ParametroAddReusableComponent],
    providers: [MessageService, DialogService, ConfirmationService],

})
export class ParametroTipoCambioAddComponent implements OnInit {

    groups: any[] = [];
    filteredElement: any[] = [];
    formAdd!: FormGroup;

    constructor(
        private readonly parametroTipoCambioService: ParametroTipoCambioService,
        private readonly toastr: MessageService,
        private readonly dialog: DialogService,
        private readonly fb: FormBuilder,
        private readonly router: Router
    ) {
        this.createForm();
    }
    ngOnInit(): void {
        this.getGrupoParametros();
    }

    createForm() {
        this.formAdd = this.fb.group({
            grupoParametro: new FormControl(null, [Validators.required]),
            desElemento: new FormControl(null, [Validators.required, Validators.maxLength(1000)]),
            valNumEntero: new FormControl(null, [Validators.pattern(/^\d+(,\d+)?$/)]),
            valNumDecimal: new FormControl(null, [Validators.pattern(/^\d{0,2}(\.\d{1,2})?$/)]),
            valCadCorto: new FormControl(null, [Validators.maxLength(10)]),
            valCadLargo: new FormControl(null, [Validators.maxLength(50)])
        });
    }

    getGrupoParametros() {
        this.parametroTipoCambioService.getGrupoParametros().subscribe((resp: any) => {
            if (resp['codigo'] == 0) {
                this.groups = resp['data'].map((item: any) => {
                    return {
                        codTabla: item['codTabla'],
                        nomTabla: item['nomTabla']
                    }
                });
            } else if (resp['codigo'] == -1) {
                this.toastr.add({ severity: 'error', summary: 'Error getGrupoParametros', detail: resp['mensaje'] });
            }
        }, (_error) => {
            this.toastr.add({ severity: 'error', summary: 'Error getGrupoParametros', detail: 'Error en el servicio de obtener grupos de parámetros' });
        })
    }

    addParametro() {
        const formValue = this.formAdd.value;

        if (
            !formValue.valCadCorto &&
            !formValue.valCadLargo &&
            !formValue.valNumDecimal &&
            !formValue.valNumEntero
        ) {
            this.toastr.add({ severity: 'warn', summary: 'Valor requerido', detail: 'Debe registrar al menos un valor para el parámetro' });
            return;
        }

        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        const object = {
            codTabla: formValue.grupoParametro.codTabla,
            nomTabla: formValue.grupoParametro.nomTabla,
            desElemento: formValue.desElemento,
            valCadCorto: formValue.valCadCorto,
            valCadLargo: formValue.valCadLargo,
            valNumDecimal: Number(formValue.valNumDecimal),
            valNumEntero: Number(formValue.valNumEntero),
            estParametro: 1,
            usuarioCreacion: usuario.email
        };

        this.parametroTipoCambioService.postParametro(object).subscribe(
            (resp: any) => {
                if (resp['codigo'] == 0) {
                    this.toastr.add({ severity: 'success', summary: 'Registro exitoso', detail: 'Parámetro creado correctamente' });
                    this.router.navigate(['/apps/mantenimiento/parametro/tipo-cambio']);
                } else {
                    this.toastr.add({ severity: 'error', summary: 'Error addParametro', detail: 'Error en el servicio de registro de parámetro' });
                }
            }
        )
    }

    openDialogAgregarGrupo() {
        const dialogRef = this.dialog.open(RegistrarGrupoDebitoComponent, {
            header: 'Registrar nuevo grupo',
            width: '25vw',
            modal: true,
            data: {
                groups: this.groups, // lista para validar duplicados
                item: null           // modo crear
            }
        });

        if (dialogRef) {
            dialogRef.onClose.subscribe((res: any) => {
                if (res?.event === 'ok') {
                    this.groups.push(res.data);
                    this.formAdd.get('grupoParametro')!.setValue(res.data);
                }
            });
        }
    }

    filterElement(event: any, data: any) {
        this.filteredElement = [];
        const query = event?.query ?? '';
        this.filteredElement = UtilService.filterByField(data, query, 'nomTabla');        
    }
}