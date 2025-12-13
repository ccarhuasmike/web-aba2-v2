import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {  FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

import { FeriadoService } from "../../feriado.service";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputGroupModule } from "primeng/inputgroup";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { FileUploadModule } from "primeng/fileupload";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { ToastModule } from "primeng/toast";
import { CALENDAR_DETAIL } from "@/layout/Utils/constants/aba.constants";
import { MessageService, ConfirmationService } from "primeng/api";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { Select } from 'primeng/select';  // 👈 import correcto
import { DatePickerModule } from "primeng/datepicker";
import { ToggleSwitchModule } from "primeng/toggleswitch";
@Component({
    selector: 'app-add-feriado',
    templateUrl: './add-feriado.component.html',
    styleUrls: ['./add-feriado.component.scss'],
    imports: [ToggleSwitchModule, DatePickerModule, Select, InputGroupAddonModule, InputGroupModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],

    encapsulation: ViewEncapsulation.None,
    providers: [MessageService, DialogService, ConfirmationService],
})
export class AddFeriadoComponent implements OnInit {

    form: FormGroup;
    es = CALENDAR_DETAIL;
    comboTipoFecha: any[] = [];
    labelHeader: string = "";
    tipoFecha: any[] = [
        { tipoFecha: 0, descripcionTipoFecha: 'FERIADO' }, { tipoFecha: 1, descripcionTipoFecha: 'FERIADO - PUBLICO' }
    ]
    usuario: any;

    constructor(       
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly toastr: MessageService,    
        private readonly datePipe: DatePipe,
        private readonly feriadoService: FeriadoService,
    ) {
            const fechaFeriado = config.data?.isEdit ? new Date(config.data?.datosFeriado?.fecha) : null;
            this.form = new FormGroup({
                descripcion: new FormControl(config.data?.datosFeriado?.descripcion, [Validators.required]),
                tipoFecha: new FormControl((config.data) ? config.data?.datosFeriado?.tipoFecha.toString() : '', [Validators.required]),
                fecha: new FormControl(fechaFeriado, [Validators.required]),
                isRepeat: new FormControl(config.data?.datosFeriado?.indRepetir ?? 0)
            });
            console.log("datos feriado: ", config.data);
            this.labelHeader = (config.data.isEdit) ? "Editar feriado" : "Registrar nuevo feriado";

    }
    close() {
        this.dialogRef.close({
            event: 'cerrar'
        });
    }
    ngOnInit(): void {
  
        this.usuario = JSON.parse(localStorage.getItem('userABA')!);
    }

    getComboTipoFecha() {
        //Llamada servicio
        this.comboTipoFecha = [
            { tipoFecha: 1, descripcionTipoFecha: 'FERIADO' },
            { tipoFecha: 2, descripcionTipoFecha: 'FERIADO - PUBLICO' }
        ];
    }

    addFeriado() {
        console.log("form: ", this.form);
        const repetir = this.form.get('isRepeat')!.value ? 1 : 0
        const data = {
            codigo: "string",
            descripcion: this.form.get('descripcion')!.value,
            fecha: this.form.get('fecha')!.value,
            indRepetir: repetir,
            tipoFecha: Number(this.form.get('tipoFecha')!.value),
            usuarioRegistro: this.usuario.email
        }
        this.feriadoService.postRegistrarFeriado(data).subscribe((resp: any) => {
            if (resp['codigo'] == 0) {
                this.dialogRef.close({
                    event: 'close', data: resp, accion: 'create'
                })
            } else {
                this.toastr.add({ severity: 'error', summary: 'Registro fallido', detail: `No se pudo registrar el feriado` });
             
            }
        }, (_error) => {
            this.toastr.add({ severity: 'error', summary: 'Registro fallido', detail: `No se pudo registrar el feriado` });
           
        })

    }

    updateFeriado() {
        console.log(this.form)
        const fecha = this.datePipe.transform(this.form.get('fecha')!.value, 'yyyy-MM-dd')
        const repetir = this.form.get('isRepeat')!.value ? 1 : 0
        const data = {
            codigo: "string",
            descripcion: this.form.get('descripcion')!.value,
            fecha: fecha,
            idCalendario: this.config.data.datosFeriado.idCalendario,
            indRepetir: repetir,
            tipoFecha: Number(this.form.get('tipoFecha')!.value),
            usuarioActualizacion: this.usuario.email
        };
        this.feriadoService.putActualizarFeriado(data).subscribe((resp: any) => {
            if (resp['codigo'] == 0) {
                this.dialogRef.close({
                    event: 'close', data: resp, accion: 'update'
                })
            } else {
                this.toastr.add({ severity: 'error', summary: 'Actualizacion fallida', detail: `No se pudo actualizar el feriado` });
              
            }
        }, (_error) => {
            this.toastr.add({ severity: 'error', summary: 'Actualizacion fallida', detail: `No se pudo actualizar el feriado` });
           
        })
    }
}
