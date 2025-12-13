import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RegistrarBloqueoCuentaService } from './registrar-bloqueo-cuenta.service';
import { ROLES } from '@/layout/Utils/constants/aba.constants';
import { CommonService } from '@/pages/service/commonService';
import { SecurityEncryptedService } from '@/layout/service/SecurityEncryptedService';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { UtilService } from '@/utils/util.services';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-registrar-bloqueo-cuenta',
    templateUrl: './registrar-bloqueo-cuenta.component.html',
    styleUrls: ['./registrar-bloqueo-cuenta.component.scss'],
    standalone: true,
    imports: [MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    //animations: fuseAnimations,
    providers: [MessageService],
    encapsulation: ViewEncapsulation.None
})
export class RegistrarBloqueoCuentaComponent implements OnInit {

    uidCliente: any = '';
    uidCuenta: any = '';
    datosCuenta: any;
    datosCliente: any;
    formBloqueo: FormGroup;
    tipo: any = '';
    //SMCCB
    showCancelButton: any = false;
    files: File[] = [];
    filteredElementMotivo: any[] = [];
    filteredElementEstado: any[] = [];
    estadosBloqueoCuenta: any[] = [];
    motivosBloqueoCuenta: any[] = [];
    estadosMotivosBloqueoCuenta: any[] = [];
    opcionesEstadoBloqueoCuenta: any[] = [];
    opcionesMotivoBloqueoCuenta: any[] = [];
    loadingFile = false;
    disableButton = false;

    roles: any = ROLES;

    constructor(
        private readonly commonService: CommonService,
        private readonly securityEncryptedService: SecurityEncryptedService,
        private readonly toastr: MessageService,
        private readonly fb: FormBuilder,
        private readonly registrarBloqueoCuentaService: RegistrarBloqueoCuentaService,
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig

    ) {
        this.uidCliente = config.data.uidCliente;
        this.uidCuenta = config.data.uidCuenta;
        this.datosCuenta = config.data.datosCuenta;
        this.datosCliente = config.data.datosCliente;
        this.tipo = config.data.tipo;
        //SMCCB
        this.showCancelButton = config.data.showCancelButton;

        this.formBloqueo = this.fb.group({
            tipoBloqueo: new FormControl(null, [Validators.required]),
            estadoBloqueo: new FormControl(null, [Validators.required]),
            descripcion: new FormControl(null, [Validators.maxLength(255)]),
            nombreArchivo: new FormControl(null),
            archivosAdjuntos: new FormControl(null)
        });
    }
    ngOnInit() {
        this.getCombos();
    }
    getCombos() {


        this.commonService
            .getMultipleCombosPromiseCuenta(['motivo-bloqueo-cuenta', 'estado-cuenta'])
            .then(resp => this.handleCombosResponse(resp))
            .catch(() => this.handleCombosError());

    }
    private handleCombosError() {
        this.toastr.add({
            severity: 'error',
            summary: 'Error getMultipleCombosPromiseCuenta',
            detail: 'Error en el servicio de obtener parámetros'
        });
    }
    private mapEstados(data: any) {
        return data?.data?.listaEstadoCuenta?.map((item: any) => ({
            codigo: item.codigo,
            descripcion: item.descripcion,
            motivosBloqueoCuenta: []
        })) || [];
    }
    private handleCombosResponse(resp: any) {
        this.estadosBloqueoCuenta = this.mapEstados(resp[1]);
        this.motivosBloqueoCuenta = this.mapMotivos(resp[0]);
        this.getEstadosMotivosBloqueoCuenta();
    }
    private mapMotivos(data: any) {
        return data?.data?.listaMotivoBloqueoCuenta?.map((item: any) => ({
            codigo: item.codigo,
            descripcion: item.descripcion
        })) || [];
    }
    role: any;
    getEstadosMotivosBloqueoCuenta() {

        this.role = this.securityEncryptedService.getRolesDecrypted();

        this.registrarBloqueoCuentaService.getEstadosMotivosBloqueoCuenta()
            .subscribe({
                next: (resp: any) => {
                    if (resp.codigo !== 0) {
                        return this.toastr.add({
                            severity: 'error',
                            summary: 'Error getEstadosMotivosBloqueoCuenta',
                            detail: resp.mensaje
                        });
                    }
                    let lista = resp.data.content;

                    lista = this.mapearEstadosMotivos(lista);
                    lista = this.filtrarPorTipo(lista);
                    lista = this.filtrarPorRol(lista);
                    this.vincularMotivosConEstados(lista);
                    this.opcionesMotivoBloqueoCuenta = this.obtenerOpcionesMotivo(lista);

                    this.estadosMotivosBloqueoCuenta = lista;
                },
                error: () => {
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error getEstadosMotivosBloqueoCuenta',
                        detail: 'Error en el servicio de obtener motivos de bloqueo'
                    });
                }
            });

    }

    private mapearEstadosMotivos(lista: any[]) {
        return lista
            .map(element => ({
                ...element,
                estado: this.estadosBloqueoCuenta.find(e => e.codigo === element.id.codigoEstadoCuenta),
                motivo: this.motivosBloqueoCuenta.find(m => m.codigo === element.id.codigoRazonCuenta)
            }))
            .filter(item => item.estado.descripcion !== 'CIERRE');
    }



    private readonly motivosCancelacionPermitidos = [
        'DECISIÓN DE CLIENTE',
        'DECISIÓN DE LA FOH',
        'FRAUDE',
        'INACTIVIDAD',
        'MANDATO LEGAL',
        'FALLECIMIENTO',
        'AFIL NO RECONOCIDA'
    ];

    private readonly motivosBloqueoExclusion = [
        'DECISIÓN DE CLIENTE',
        'DECISIÓN DE LA FOH'
    ];

    private readonly ESTADO_BLOQUEO = 'BLOQUEO PERMANENTE';
    private readonly ESTADO_ACTIVO = 'ACTIVA';

    private filtrarPorTipo(lista: any[]) {
        if (this.tipo === 'cancelacion') {
            return this.filtrarCancelacion(lista);
        }

        if (this.tipo === 'bloqueo') {
            return this.filtrarBloqueo(lista);
        }

        return this.procesarActiva(lista);
    }

    private filtrarCancelacion(lista: any[]) {
        return lista.filter(item =>
            item?.estado?.descripcion === this.ESTADO_BLOQUEO &&
            this.motivosCancelacionPermitidos.includes(item?.motivo?.descripcion)
        );
    }

    private filtrarBloqueo(lista: any[]) {
        return lista.filter(item =>
            !(
                item?.estado?.descripcion === this.ESTADO_BLOQUEO &&
                this.motivosBloqueoExclusion.includes(item?.motivo?.descripcion)
            )
        );
    }

    private procesarActiva(lista: any[]) {
        const activa = lista.find(item =>
            item?.estado?.descripcion === this.ESTADO_ACTIVO &&
            item?.motivo?.descripcion === this.ESTADO_ACTIVO
        );

        if (activa) {
            this.formBloqueo.patchValue({
                estadoBloqueo: activa.estado,
                tipoBloqueo: activa.motivo
            });
        }

        return lista;
    }


    private filtrarPorRol(lista: any[]) {

        switch (this.role) {
            case this.roles.PLAFT:
                return lista.filter(e =>
                    e.estado.descripcion === 'BLOQUEO TEMPORAL' &&
                    e.motivo.descripcion === 'ALERTA PLAFT'
                );

            case this.roles.FRAUDE:
                return lista.filter(e =>
                    (e.estado.descripcion === 'ACTIVA' && e.motivo.descripcion === 'ACTIVA') ||
                    (e.estado.descripcion === 'BLOQUEO TEMPORAL' && e.motivo.descripcion === 'ALERTA FRAUDE')
                );

            case this.roles.ATENCION_CLIENTE:
            case this.roles.ATENCION_CLIENTE_TD:
                return lista.filter(e =>
                    (e.estado.descripcion === 'ACTIVA' && e.motivo.descripcion === 'ACTIVA') ||
                    (e.estado.descripcion === 'BLOQUEO TEMPORAL' && e.motivo.descripcion === 'TEMPORAL CONTRATO')
                );

            default:
                return lista;
        }
    }

    private vincularMotivosConEstados(lista: any[]) {
        lista.forEach(element => {
            const idx = this.estadosBloqueoCuenta.findIndex(e => e.codigo === element.id.codigoEstadoCuenta);
            if (idx > -1) {
                const motivo = this.motivosBloqueoCuenta.find(m => m.codigo === element.id.codigoRazonCuenta);
                if (motivo) {
                    this.estadosBloqueoCuenta[idx].motivosBloqueoCuenta.push(motivo);
                }
            }
        });
    }
    private obtenerOpcionesMotivo(lista: any[]) {
        const motivos = lista
            .filter(item =>
                item.estado.codigo !== this.datosCuenta.codigoEstadoBloqueo &&
                item.motivo.codigo !== this.datosCuenta.codigoMotivoBloqueo
            )
            .map(item => item.motivo);

        return Array.from(new Set(motivos));
    }
    registrarBloqueo() {
        this.disableButton = true;
        const formValue = this.formBloqueo.value;
        console.log(formValue);
        //SMCCB
        if (formValue.tipoBloqueo.codigo == "02"
            //|| formValue.tipoBloqueo.codigo == "04") && formValue.estadoBloqueo.codigo == "03"
        ) {
            // 02-INACTIVIDAD
            // 03-MANDATO LEGAL
            // 04-DECISIÓN DE CLIENTE
            if (this.tipo == 'cancelacion' && !this.showCancelButton) {
                this.toastr.add({ severity: 'warn', summary: 'Error getEstadosMotivosBloqueoCuenta', detail: 'No se puede realizar la cancelación ya que la cuenta registra saldos mayores a 0.00' });
                return;
            }
        }
        const usuario = JSON.parse(localStorage.getItem('userABA')!);

        let flagActivacion = this.tipo == 'desbloqueo';

        const object = {
            archivoSustento: formValue.archivosAdjuntos,
            nombreSustento: formValue.nombreArchivo,
            descripcion: formValue.descripcion,
            parametros: {
                codigoMotivo: formValue.tipoBloqueo.codigo,
                estado: formValue.estadoBloqueo.codigo,
                flagActivacion: flagActivacion,
                origen: 'BO ABA',
                uIdCliente: this.uidCliente,
                uIdCuenta: this.uidCuenta
            },
            usuario: usuario.email
        }

        this.registrarBloqueoCuentaService.postBloqueoCuenta(object)
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
            this.toastr.add({ severity: 'info', summary: 'Carga exitosa', detail: `${this.files.length} archivos listos para enviar` });
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

    filterElementMotivo(event: any, data: any) {
        this.filteredElementMotivo = [];
        const query = event?.query ?? '';
        this.filteredElementMotivo = UtilService.filterByField(data, query, 'descripcion');

    }

    filterElementEstado(event: any, data: any) {
        this.filteredElementEstado = [];
        const query = event?.query ?? '';
        this.filteredElementEstado = UtilService.filterByField(data, query, 'descripcion');
    }

    onElementSelect(event: any) {
        this.opcionesEstadoBloqueoCuenta = [];

        this.formBloqueo.get('estadoBloqueo')!.patchValue(null);

        const estadoMotivos = this.estadosMotivosBloqueoCuenta.filter((item: any) => item.id.codigoRazonCuenta === event.codigo);

        for (const element of estadoMotivos) {

            const estadoCuenta = this.estadosBloqueoCuenta.find((item: any) => item.codigo == element.id.codigoEstadoCuenta);

            if (estadoCuenta) {
                this.opcionesEstadoBloqueoCuenta.push(estadoCuenta);
            }
        }

        if (this.opcionesEstadoBloqueoCuenta.length === 1) {
            this.formBloqueo.get('estadoBloqueo')!.patchValue(this.opcionesEstadoBloqueoCuenta[0]);
        }
    }
}
