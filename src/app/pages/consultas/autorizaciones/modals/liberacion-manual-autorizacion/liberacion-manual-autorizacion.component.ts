import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";


import { AutorizacionesService } from "../../autorizaciones.service";
import { finalize } from "rxjs/operators";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MessageService, ConfirmationService } from "primeng/api";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { CommonModule } from "@angular/common";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { FileUploadModule } from "primeng/fileupload";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { ToastModule } from "primeng/toast";


@Component({
    selector: 'app-liberacion-manual-autorizacion',
    templateUrl: './liberacion-manual-autorizacion.component.html',
    styleUrls: ['./liberacion-manual-autorizacion.component.scss'],

    encapsulation: ViewEncapsulation.None,
    imports: [InputGroupAddonModule, InputGroupModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService, ConfirmationService],
})
export class LiberacionManualAutorizacionComponent implements OnInit {
    datosRequest: any;
    datosCliente: any;
    datosCuenta: any;
    files: File[] = [];
    datosAutorizacion: any;
    loadingFile = false;

    formLiberacion: FormGroup

    disableButton: boolean = false;
    constructor(
        private autorizacionesService: AutorizacionesService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private toastr: MessageService,

    ) {
        this.datosAutorizacion = config.data.datosAutorizacion;
        this.datosCliente = config.data.datosCliente;
        this.datosCuenta = config.data.datosCuenta;
        this.formLiberacion = new FormGroup({
            nombreArchivo: new FormControl(null),
            archivosAdjuntos: new FormControl(null)
        });
    }


    ngOnInit(): void {
    }

    postLiberarManualmenteAutorizacion() {
        this.disableButton = true;
        const formValue = this.formLiberacion.value;
        const usuario = JSON.parse(localStorage.getItem('userABA')!);
        const object = {
            idTransaccion: this.datosAutorizacion.idTransaccion,
            uidReferenciaExterna: this.datosAutorizacion.uIdreferenciaExterna,
            descOrigin: this.datosAutorizacion.descOrigen,
            fechaTransaccion: this.datosAutorizacion.fechaTransaccion,
            descRequerimiento: this.datosAutorizacion.descRequerimiento,
            codigoAutorizacion: this.datosAutorizacion.codigoAutorizacion,
            numeroCuenta: this.datosCuenta.numeroCuenta,
            usuario: usuario.email,
            archivoSustento: formValue.archivosAdjuntos,
            nombreSustento: formValue.nombreArchivo
        }

        this.autorizacionesService.postLiberarManualmenteAutorizacion(object)
            .pipe(
                finalize(() => {
                    this.disableButton = false;
                })
            ).subscribe((resp: any) => {
                this.dialogRef.close({
                    event: 'close', data: resp
                })
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
            this.formLiberacion.get('archivosAdjuntos')!.setValue(filereader.result);
            this.formLiberacion.get('nombreArchivo')!.setValue(this.files[0].name);
            this.toastr.add({ severity: 'info', summary: 'Carga exitosa', detail: `${this.files.length} archivos listos para enviar` });
            this.loadingFile = false;
        };
        filereader.onerror = () => {
            this.toastr.add({
                severity: 'error',
                summary: 'Carga fallida',
                detail: `No se pudo cargar los archivos`
            });
            this.loadingFile = false;
        };
    }

    removeAll() {
        this.files = [];
    }

    removeElement(event: any) {
        if (this.files.length > 0) {
            this.formLiberacion.get('archivosAdjuntos')!.setValue(null);
            this.formLiberacion.get('nombreArchivo')!.setValue(null);
            this.files = this.files.filter((element) => {
                return element !== event.file;
            });
        }
    }
}