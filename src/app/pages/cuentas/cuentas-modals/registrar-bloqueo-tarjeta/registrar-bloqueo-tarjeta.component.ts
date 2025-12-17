import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RegistrarBloqueoTarjetaService } from './registrar-bloqueo-tarjeta.service';
import { MessageService } from 'primeng/api';
import { ROLES } from '@/layout/Utils/constants/aba.constants';
import { CommonService } from '@/pages/service/commonService';
import { SecurityEncryptedService } from '@/layout/service/SecurityEncryptedService';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UtilService } from '@/utils/util.services';
@Component({
    selector: 'app-registrar-bloqueo-tarjeta',
    standalone: true,
    templateUrl: './registrar-bloqueo-tarjeta.component.html',
    styleUrls: ['./registrar-bloqueo-tarjeta.component.scss'],
    imports: [MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService],
    encapsulation: ViewEncapsulation.None
})
export class RegistrarBloqueoTarjetaComponent implements OnInit {
    uidCliente: any = '';
    uidCuenta: any = '';
    tarjeta: any;
    formBloqueo: FormGroup;
    files: File[] = [];
    filteredElement: any[] = [];
    estadoTarjeta: any[] = [];
    motivosBloqueoTarjeta: any[] = [];
    loadingFile = false;
    disableButton = false;
    roles: any = ROLES;
    constructor(
        private readonly commonService: CommonService,
        private readonly securityEncryptedService: SecurityEncryptedService,
        private readonly toastr: MessageService,
        private readonly registrarBloqueoTarjetaService: RegistrarBloqueoTarjetaService,
        private readonly fb: FormBuilder,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {

        this.uidCliente = config.data.uidCliente;
        this.uidCuenta = config.data.uidCuenta;
        this.tarjeta = config.data.tarjeta;

        this.formBloqueo = this.fb.group({
            tipoBloqueo: new FormControl(null, [Validators.required]),
            descripcion: new FormControl(null, [Validators.maxLength(255)]),
            nombreArchivo: new FormControl(null),
            archivosAdjuntos: new FormControl(null)
        });
    }

    ngOnInit() {
        this.getcombos();
    }

    getcombos() {
        const role = this.securityEncryptedService.getRolesDecrypted();

      
            this.commonService.getMultipleCombosPromiseCuenta(['motivo-bloqueo-tarjeta', 'estado-tarjeta'])
                .then((resp: any) => {
                    this.motivosBloqueoTarjeta = resp[0]['data']['listaMotivoBloqueoTarjeta'];
                    if (role == this.roles.FRAUDE) {
                        this.motivosBloqueoTarjeta = this.motivosBloqueoTarjeta.filter((e: any) =>
                            e.descripcion != 'DETERIORO' &&
                            e.descripcion != 'RETENIDA ATM' &&
                            e.descripcion != 'FALLECIMIENTO' &&
                            e.descripcion != 'TEMPORAL TARJETA BO' &&
                            e.descripcion != 'INACTIVA'
                        );
                    }

                    if (role == this.roles.ATENCION_CLIENTE || role == this.roles.ATENCION_CLIENTE_TD) {
                        this.motivosBloqueoTarjeta = this.motivosBloqueoTarjeta.filter((e: any) =>
                            e.descripcion != 'ACTIVA' &&
                            e.descripcion != 'INACTIVA' &&
                            e.descripcion != 'DECISIÓN DE LA FOH' &&
                            e.descripcion != 'FRAUDE' &&
                            e.descripcion != 'FALLECIMIENTO' &&
                            e.descripcion != 'TEMPORAL TARJETA BO' &&
                            e.descripcion != 'ALERTA PREVENCIÓN'
                        );
                    }

                    this.estadoTarjeta = resp[1]['data']['listaEstadoTarjeta'];
                    this.estadoTarjeta = this.estadoTarjeta.map((x: any) => {
                        const motivosBloqueoTarjeta = this.motivosBloqueoTarjeta.filter(
                            (y: any) => x.codigo === y.codigoEstadoTarjeta
                        );

                        return {
                            ...x,
                            motivosBloqueoTarjeta: motivosBloqueoTarjeta
                        }
                    }).filter((x: any) => x.motivosBloqueoTarjeta.length > 0);

                    this.motivosBloqueoTarjeta = this.motivosBloqueoTarjeta.filter((e: any) => e.codigo != this.tarjeta.codigoMotivoEstado);
                }).catch((_error: any) => {
                    this.toastr.add({ severity: 'error', summary: 'Error getParametros', detail: 'Error en el servicio de obtener parámetros' });
                })
        
    }

    registrarBloqueo() {
        this.disableButton = true;
        const formValue = this.formBloqueo.value;
        const usuario = JSON.parse(localStorage.getItem('userABA')!);
        let estado = this.motivosBloqueoTarjeta.find((e: any) => e.codigo == formValue.tipoBloqueo.codigo);
        estado = estado ? estado.codigoEstadoTarjeta : null

        const object = {
            archivoSustento: formValue.archivosAdjuntos,
            nombreSustento: formValue.nombreArchivo,
            descripcion: formValue.descripcion,
            parametros: {
                codigoMotivo: formValue.tipoBloqueo.codigo,
                estado: estado,
                token: this.tarjeta.token,
                uIdCliente: this.uidCliente,
                uIdCuenta: this.uidCuenta
            },
            usuario: usuario.email
        }

        console.log('BLOQUEO DE TARJETA...', object);

        this.registrarBloqueoTarjetaService.postBloqueoTarjeta(object)
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
            this.formBloqueo.get('archivosAdjuntos')!.setValue(filereader.result);
            this.formBloqueo.get('nombreArchivo')!.setValue(this.files[0].name);
            this.toastr.add({ severity: 'success', summary: 'Carga exitosa', detail: `${this.files.length} archivos listos para enviar` });
            this.loadingFile = false;
        };
        filereader.onerror = () => {
            this.toastr.add({ severity: 'error', summary: 'Carga fallida', detail: `No se pudo cargar los archivos` });
            this.loadingFile = false;
        };
    }

    removeElement(event: any) {
        if (this.files.length > 0) {
            this.formBloqueo.get('archivosAdjuntos')!.setValue(null);
            this.formBloqueo.get('nombreArchivo')!.setValue(null);
            this.files = this.files.filter((element) => {
                return element !== event.file;
            });
        }
    }

    filterElement(event: any, data: any) {
        this.filteredElement = [];
        const query = event?.query ?? '';
        this.filteredElement = UtilService.filterByField(data, query, 'descripcion');
    }
}
