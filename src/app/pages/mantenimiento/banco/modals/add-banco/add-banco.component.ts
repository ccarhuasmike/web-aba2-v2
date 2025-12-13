import { Component } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { BancoService } from "../../banco.service";
import { finalize } from "rxjs/operators";
import { CommonModule } from "@angular/common";
import { MessageService, ConfirmationService } from "primeng/api";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { FileUploadModule } from "primeng/fileupload";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { ToastModule } from "primeng/toast";

@Component({
    selector: 'app-add-banco',
    templateUrl: './add-banco.component.html',
    styleUrls: ['./add-banco.component.scss'],
    standalone: true,
    imports: [InputGroupAddonModule, InputGroupModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService, ConfirmationService],
})
export class AddBancoComponent  {

    titleModal: string = '';
    isUpdate: boolean = false;
    disableButtonAdd: boolean = false;
    disableButtonUpdate: boolean = false;

    formAddBanco!: FormGroup;

    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly bancoService: BancoService,
        private readonly toastr: MessageService,
        private readonly fb: FormBuilder,

    ) {
        this.titleModal = (config.data) ? 'MODIFICAR DATOS BANCO' : 'REGISTRAR BANCO'
        this.isUpdate = !(config.data);
        this.createformAddBanco();
    }
    createformAddBanco() {
        this.formAddBanco = this.fb.group({
            codBanco: new FormControl(((this.config.data) ? this.config.data.codigo : null), [Validators.required]),
            nombreBanco: new FormControl(((this.config.data) ? this.config.data.nombre : null), [Validators.required]),
        })
    }
    
    close() {
        this.dialogRef.close({
            event: 'cerrar'
        });
    }
    addBanco() {
        this.disableButtonAdd = true;
        console.log(this.formAddBanco.valid);

        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        let data = {
            codigo: this.formAddBanco.get('codBanco')!.value,
            nombre: this.formAddBanco.get('nombreBanco')!.value,
            usuarioRegistro: usuario.email
        }
        // this.formAddBanco.valid
        console.log(data);
        this.bancoService.postRegistrarBanco(data)
            .pipe(
                finalize(() => {
                    this.disableButtonAdd = false;
                })
            )
            .subscribe((resp: any) => {
                console.log(resp);
                if (resp['codigo'] == 0) {
                    this.dialogRef.close({
                        event: 'close', data: resp, accion: 'create'
                    })
                } else {
                    this.toastr.add({ severity: 'error', summary: 'Registro fallido', detail: `No se pudo registrar el banco` });
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Registro fallido', detail: `No se pudo registrar el banco` });
            })

    }

    updateBanco() {
        this.disableButtonUpdate = true;        
        let data = {
            codigo: this.formAddBanco.get('codBanco')!.value,
            idBanco: this.config.data.idBanco,
            nombre: this.formAddBanco.get('nombreBanco')!.value,
        }
        this.bancoService.putActualizarBanco(data)
            .pipe(
                finalize(() => {
                    this.disableButtonUpdate = false;
                })
            )
            .subscribe((resp: any) => {
                console.log(resp);
                if (resp['codigo'] == 0) {
                    this.dialogRef.close({
                        event: 'close', data: resp, accion: 'update'
                    })
                } else {
                    this.toastr.add({ severity: 'error', summary: 'Actualización fallida', detail: `No se pudo actualizar el banco` });                    
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Actualización fallida', detail: `No se pudo actualizar el banco` });
            })
    }
}