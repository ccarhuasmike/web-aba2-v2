import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

export abstract class ParametroEditBaseComponent {

  codParametro: any = null;
  parametro: any = null;
  groups: any[] = [];
  filteredElement: any[] = [];
  formEdit!: FormGroup;

  constructor(
    protected fb: FormBuilder,
    protected toastr: MessageService
  ) {
    this.createForm();
  }

  // Métodos que cada hijo debe implementar
  abstract getParametroService(id: any): any;
  abstract getGrupoParametrosService(): any;
  abstract updateParametroService(data: any): any;

  createForm() {
    this.formEdit = this.fb.group({
      grupoParametro: new FormControl({ value: null, disabled: true }, [Validators.required]),
      desElemento: new FormControl(null, [Validators.required, Validators.maxLength(1000)]),
      valNumEntero: new FormControl(null, [Validators.pattern(/^\d+(,\d+)?$/)]),
      valNumDecimal: new FormControl(null, [Validators.pattern(/^\d{0,2}(\.\d{1,2})?$/)]),
      valCadCorto: new FormControl(null, [Validators.maxLength(10)]),
      valCadLargo: new FormControl(null, [Validators.maxLength(50)]),
      estParametro: new FormControl(null, [Validators.required])
    });
  }

  loadParametro(id: any) {
    this.getParametroService(id).subscribe((resp: any) => {
      if (resp.codigo === 0) {
        this.parametro = resp.data;

        this.formEdit.setValue({
          grupoParametro: {
            codTabla: this.parametro.codTabla,
            nomTabla: this.parametro.nomTabla,
          },
          desElemento: this.parametro.desElemento,
          valNumEntero: this.parametro.valNumEntero,
          valNumDecimal: this.parametro.valNumDecimal,
          valCadCorto: this.parametro.valCadCorto,
          valCadLargo: this.parametro.valCadLargo,
          estParametro: 1
        });

      } else {
        this.toastr.add({ severity: 'error', summary: 'Error', detail: resp.mensaje });
      }
    });
  }

  loadGrupos() {
    this.getGrupoParametrosService().subscribe((resp: any) => {
      if (resp.codigo === 0) {
        this.groups = resp.data.map((item: any) => ({
          codTabla: item.codTabla,
          nomTabla: item.nomTabla
        }));
      }
    });
  }

  editParametro() {
    const val = this.formEdit.value;

    if (!val.valCadCorto && !val.valCadLargo && !val.valNumDecimal && !val.valNumEntero) {
      this.toastr.add({ severity: 'warn', summary: 'Falta valor', detail: 'Debe ingresar al menos un valor.' });
      return;
    }

    const usuario = JSON.parse(localStorage.getItem('userABA')!);

    const obj = {
      ...this.parametro,
      desElemento: val.desElemento,
      valCadCorto: val.valCadCorto,
      valCadLargo: val.valCadLargo,
      valNumDecimal: Number(val.valNumDecimal),
      valNumEntero: Number(val.valNumEntero),
      estParametro: val.estParametro,
      usuarioModificacion: usuario.email
    };

    this.updateParametroService(obj).subscribe((resp: any) => {
      if (resp.codigo === 0) {
        this.toastr.add({ severity: 'success', summary: 'Actualizado', detail: 'Parámetro actualizado correctamente' });
      } else {
        this.toastr.add({ severity: 'error', summary: 'Error', detail: resp.mensaje });
      }
    });
  }

  filterElement(event: any, data: any) {
    const query = event.query.toLowerCase();
    this.filteredElement = data.filter((x: any) =>
      x.nomTabla.toLowerCase().includes(query)
    );
  }
}
