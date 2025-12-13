import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CobroComisionService } from './cobro-comision.service';
import { CommonService } from '@/pages/service/commonService';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UtilService } from '@/utils/util.services';

@Component({
    selector: 'app-cobro-comision',
    templateUrl: './cobro-comision.component.html',
    styleUrls: ['./cobro-comision.component.scss'],
    standalone: true,
    imports: [InputNumberModule, DatePickerModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService],
    encapsulation: ViewEncapsulation.None
})
export class CobroComisionComponent implements OnInit {

    uidCliente: any = '';
    uidCuenta: any = '';
    codigoGrupo: any = '';
    glosa: any = '';
    importe: any = 0;
    saldoDisponible: any = 0;
    formAjustar: FormGroup;
    files: File[] = [];
    filteredElementTipoAjuste: any[] = [];
    filteredElementCodigoComercio: any[] = [];
    tiposAjuste: any[] = [];
    codigosComercio: any[] = [];
    loadingFile = false;
    disableButton = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly commonService: CommonService,
        private readonly cobroComisionService: CobroComisionService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly toastr: MessageService,
    ) {

        this.uidCliente = config.data.uidCliente;
        this.uidCuenta = config.data.uidCuenta;
        this.saldoDisponible = config.data.saldoDisponible;
        this.formAjustar = this.fb.group({
            tipoAjuste: new FormControl(null, [Validators.required, this.requireMatch]),
            codigoComercio: new FormControl(null, [Validators.required, this.requireMatch]),
            importe: new FormControl(null, [Validators.required]),
            glosa: new FormControl(null, [Validators.required]),
            referencia: new FormControl(null),
            nombreArchivo: new FormControl(null),
            archivosAdjuntos: new FormControl(null)
        });
    }

    ngOnInit(): void {
        this.getCombos();
    }

    getCombos() {
        this.commonService.getMultipleCombosPromise([
            'TRANSACCION_ORIGINAL_AJUSTE',
            'CODIGO_COMERCIO_AJUSTE'
        ]).then(resp => {
            this.tiposAjuste = resp[0]['data'];
            this.tiposAjuste = this.tiposAjuste.filter((e: any) =>
                e.desElemento === 'Cargo Comisión envío EECC físico'
            );

            const tipoAjuste = this.tiposAjuste[0];
            this.importe = tipoAjuste.valNumDecimal;
            this.glosa = tipoAjuste.valCadLargo;

            this.formAjustar.get('tipoAjuste')!.patchValue(tipoAjuste);
            this.formAjustar.get('importe')!.setValue(this.importe);
            this.formAjustar.get('glosa')!.setValue(this.glosa);
            this.formAjustar.get('importe')!.disable();
            this.formAjustar.get('glosa')!.disable();
            this.codigoGrupo = '96';

            this.codigosComercio = resp[1]['data'];
        })
    }

    ajustarSaldo() {
        this.disableButton = true;

        const formValue = this.formAjustar.value;

        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        const object = {
            uidCliente: this.uidCliente,
            uidCuenta: this.uidCuenta,
            saldoDisponible: this.saldoDisponible,
            glosa: this.glosa,
            monto: this.importe,
            codigoGrupo: this.codigoGrupo,
            nombreSustento: formValue.nombreArchivo,
            archivoSustento: formValue.archivosAdjuntos,
            referencia: formValue.referencia,
            tipoAjuste: formValue.tipoAjuste.valNumEntero,
            tipoFactura: formValue.tipoAjuste.codTablaElemento.toString(),
            codigoComercio: formValue.codigoComercio.valCadLargo,
            nombreComercio: formValue.codigoComercio.valCadCorto,
            idTerminal: 10001,
            idTransaccionTerminal: 1,
            usuarioCreacion: usuario.email
        };

        this.cobroComisionService.postAjusteSaldoRetiro(object)
            .pipe(
                finalize(() => {
                    this.disableButton = false;
                })
            ).subscribe((resp: any) => {
                this.dialogRef.close({
                    event: 'close', data: resp
                });
            }, (_error) => {
                this.dialogRef.close();
            });
    }

    uploader(event: any) {
        this.loadingFile = true;
        this.files = event.files;
        const filereader = new FileReader();
        filereader.readAsDataURL(this.files[0]);
        filereader.onload = () => {
            this.formAjustar.get('archivosAdjuntos')!.setValue(filereader.result);
            this.formAjustar.get('nombreArchivo')!.setValue(this.files[0].name);
            this.toastr.add({ severity: 'info', summary: 'Carga exitosa', detail: `${this.files.length} archivos listos para enviar` });
            this.loadingFile = false;
        };
        filereader.onerror = () => {
            this.toastr.add({ severity: 'error', summary: 'Carga fallida', detail: `No se pudo cargar los archivos` });            
            this.loadingFile = false;
        };
    }

    removeAll() {
        this.files = [];
    }

    removeElement(event: any) {
        if (this.files.length > 0) {
            this.formAjustar.get('archivosAdjuntos')!.setValue(null);
            this.formAjustar.get('nombreArchivo')!.setValue(null);
            this.files = this.files.filter((element) => {
                return element !== event.file;
            });
        }
    }

    filterElementTipoAjuste(event: any, data: any) {
        this.filteredElementTipoAjuste = [];
         const query = event?.query ?? '';
        this.filteredElementTipoAjuste = UtilService.filterByField(data, query, 'desElemento');
        
    }

    filterElementCodigoComercio(event: any, data: any) {
        this.filteredElementCodigoComercio = [];
        const query = event?.query ?? '';
        this.filteredElementCodigoComercio = UtilService.filterByField(data, query, 'valCadLargo');        
    }

    requireMatch(control: FormControl): ValidationErrors | null {
        const selection: any = control.value;
        if (typeof selection === 'string') {
            return { requireMatch: true };
        }
        return null;
    }
}
