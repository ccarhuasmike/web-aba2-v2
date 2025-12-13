
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { Router } from "@angular/router";
import { DialogService } from "primeng/dynamicdialog";

export abstract class ParametroAddBaseComponent {

    groups: any[] = [];
    filteredElement: any[] = [];
    formAdd!: FormGroup;

    protected abstract service: any;      // el servicio cambia
    protected abstract successRedirect: string; // ruta cambia

    constructor(
        protected fb: FormBuilder,
        protected toastr: MessageService,
        protected dialog: DialogService,
        protected router: Router
    ) {
        this.createForm();
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
        this.service.getGrupoParametros().subscribe((resp: any) => {
            if (resp['codigo'] === 0) {
                this.groups = resp['data'].map((item: any) => ({
                    codTabla: item.codTabla,
                    nomTabla: item.nomTabla
                }));
            } else {
                this.toastr.add({ severity: 'error', summary: 'Error', detail: resp.mensaje });
            }
        }, () => {
            this.toastr.add({
                severity: 'error',
                summary: 'Error getGrupoParametros',
                detail: 'Error en el servicio de obtener grupos de parámetros'
            });
        });
    }

    addParametro() {
        const formValue = this.formAdd.value;

        if (!formValue.valCadCorto && !formValue.valCadLargo &&
            !formValue.valNumDecimal && !formValue.valNumEntero) {

            this.toastr.add({
                severity: 'warn',
                summary: 'Valor requerido',
                detail: 'Debe registrar al menos un valor para el parámetro'
            });
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

        this.service.postParametro(object).subscribe((resp: any) => {
            if (resp['codigo'] === 0) {
                this.toastr.add({ severity: 'success', summary: 'Registro exitoso', detail: 'Parámetro creado correctamente' });
                this.router.navigate([this.successRedirect]);
            } else {
                this.toastr.add({ severity: 'error', summary: 'Error addParametro', detail: 'Error en el servicio de registro de parámetro' });
            }
        });
    }

    filterElement(event: any, data: any) {
        const q = event.query.toLowerCase();
        this.filteredElement = data.filter((x: any) =>
            x.nomTabla.toLowerCase().includes(q)
        );
    }
}
