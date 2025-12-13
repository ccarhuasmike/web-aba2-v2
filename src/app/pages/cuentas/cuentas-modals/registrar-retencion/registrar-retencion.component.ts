import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RegistrarRetencionService } from './registrar-retencion.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { CommonService } from '@/pages/service/commonService';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { UtilService } from '@/utils/util.services';
@Component({
    standalone: true,
    selector: 'app-registrar-retencion',
    templateUrl: './registrar-retencion.component.html',
    styleUrls: ['./registrar-retencion.component.scss'],
    imports: [InputNumberModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService],
    encapsulation: ViewEncapsulation.None
})
export class RegistrarRetencionComponent implements OnInit {

    uidCuenta: string;
    uidCliente: string;
    saldoDisponible: any;
    formRetencion: FormGroup;
    tipoRetencion: any[] = [];
    files: File[] = [];
    filteredElement: any[] = [];
    loadingFile = false;
    disableButton = false;
    constructor(
        private readonly commonService: CommonService,
        private readonly registrarRetencionService: RegistrarRetencionService,
        private readonly fb: FormBuilder,
        private readonly toastr: MessageService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.uidCuenta = config.data.uidCuenta;
        this.uidCliente = config.data.uidCliente;
        this.saldoDisponible = config.data.saldoDisponible;
        this.formRetencion = this.fb.group({
            tipoRetencion: new FormControl(null, Validators.required),
            importe: new FormControl(null, Validators.required),
            nombreArchivo: new FormControl(null),
            archivosAdjuntos: new FormControl(null)
        });
    }

    ngOnInit() {
        this.getCombos();
    }

    getCombos() {
        let resp: any = {
            "codigo": 0,
            "mensaje": "OK",
            "data": [
                {
                    "codParametro": 81,
                    "codTabla": 6,
                    "nomTabla": "TIPO_RETENCION",
                    "codTablaElemento": 1,
                    "desElemento": "TIPO RETENCION",
                    "valCadCorto": null,
                    "valCadLargo": "SUNAT",
                    "valNumEntero": 0,
                    "valNumDecimal": 0,
                    "estParametro": 1,
                    "usuarioCreacion": "BLUP.Esteban.Castillo@somosoh.pe",
                    "fechaCreacion": "2022-09-26T12:10:49.571",
                    "usuarioModificacion": null,
                    "fechaModificacion": null
                },
                {
                    "codParametro": 82,
                    "codTabla": 6,
                    "nomTabla": "TIPO_RETENCION",
                    "codTablaElemento": 2,
                    "desElemento": "TIPO RETENCION",
                    "valCadCorto": null,
                    "valCadLargo": "JUZGADO",
                    "valNumEntero": 0,
                    "valNumDecimal": 0,
                    "estParametro": 1,
                    "usuarioCreacion": "BLUP.Esteban.Castillo@somosoh.pe",
                    "fechaCreacion": "2022-09-26T12:11:11.778",
                    "usuarioModificacion": null,
                    "fechaModificacion": null
                },
                {
                    "codParametro": 83,
                    "codTabla": 6,
                    "nomTabla": "TIPO_RETENCION",
                    "codTablaElemento": 3,
                    "desElemento": "TIPO RETENCION",
                    "valCadCorto": null,
                    "valCadLargo": "SAT",
                    "valNumEntero": 0,
                    "valNumDecimal": 0,
                    "estParametro": 1,
                    "usuarioCreacion": "BLUP.Esteban.Castillo@somosoh.pe",
                    "fechaCreacion": "2022-09-26T12:11:39.41",
                    "usuarioModificacion": null,
                    "fechaModificacion": null
                },
                {
                    "codParametro": 84,
                    "codTabla": 6,
                    "nomTabla": "TIPO_RETENCION",
                    "codTablaElemento": 4,
                    "desElemento": "TIPO RETENCION",
                    "valCadCorto": null,
                    "valCadLargo": "MUNICIPIOS",
                    "valNumEntero": 0,
                    "valNumDecimal": 0,
                    "estParametro": 1,
                    "usuarioCreacion": "BLUP.Esteban.Castillo@somosoh.pe",
                    "fechaCreacion": "2022-09-26T12:11:59.578",
                    "usuarioModificacion": null,
                    "fechaModificacion": null
                },
                {
                    "codParametro": 85,
                    "codTabla": 6,
                    "nomTabla": "TIPO_RETENCION",
                    "codTablaElemento": 5,
                    "desElemento": "TIPO RETENCION",
                    "valCadCorto": null,
                    "valCadLargo": "OTROS",
                    "valNumEntero": 0,
                    "valNumDecimal": 0,
                    "estParametro": 1,
                    "usuarioCreacion": "BLUP.Esteban.Castillo@somosoh.pe",
                    "fechaCreacion": "2022-09-26T12:12:30.527",
                    "usuarioModificacion": null,
                    "fechaModificacion": null
                }
            ]
        }
        this.tipoRetencion = resp['data'];      
    }

    registrarRetencion() {
        this.disableButton = true;

        const formValue = this.formRetencion.value;

        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        const object = {
            archivoSustento: formValue.archivosAdjuntos,
            nombreSustento: formValue.nombreArchivo,
            monto: Number(formValue.importe),
            tipoRetencion: formValue.tipoRetencion.codTablaElemento.toString(),
            saldoDisponible: this.saldoDisponible,
            uidCliente: this.uidCliente,
            uidCuenta: this.uidCuenta,
            codigoComercio: 4000,
            nombreComercio: 'comercio:test',
            idTerminal: 10001,
            idTransaccionTerminal: 1,
            usuarioCreacion: usuario.email
        };

        this.registrarRetencionService.postRegistrarRetencion(object)
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

    removeAll() {
        this.files = [];
    }

    uploader(event: any) {
        this.loadingFile = true;
        this.files = event.files;
        const filereader = new FileReader();
        filereader.readAsDataURL(this.files[0]);
        filereader.onload = () => {
            this.formRetencion.get('archivosAdjuntos')!.setValue(filereader.result);
            this.formRetencion.get('nombreArchivo')!.setValue(this.files[0].name);
            this.toastr.add({ severity: 'info', summary: 'Carga exitosa', detail: `${this.files.length} archivos listos para enviar` });
            this.loadingFile = false;
        };
        filereader.onerror = () => {
            this.toastr.add({ severity: 'error', summary: 'Carga fallida', detail: `No se pudo cargar los archivos` });
            this.loadingFile = false;
        };
    }

    changeModelImporte(event: any) {
        const element = document.getElementById('buttonConfirm')
        if (event.value === null) {
            element!.classList.add('mat-button-disabled');
            this.formRetencion.get('importe')!.markAsDirty();
        } else {
            element!.classList.remove('mat-button-disabled');
            this.formRetencion.get('importe')!.markAsPristine();
        }
    }



    removeElement(event: any) {
        if (this.files.length > 0) {
            this.formRetencion.get('archivosAdjuntos')!.setValue(null);
            this.formRetencion.get('nombreArchivo')!.setValue(null);
            this.files = this.files.filter((element) => {
                return element !== event.file;
            });
        }
    }


    filterElementTipoRetencion(event: any, data: any) {
        this.filteredElement = [];
         const query = event?.query ?? '';
        this.filteredElement = UtilService.filterByField(data, query, 'valCadLargo');
    }
}
