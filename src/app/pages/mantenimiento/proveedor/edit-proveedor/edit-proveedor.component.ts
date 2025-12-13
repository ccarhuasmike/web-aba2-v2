import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ProveedorService } from "../proveedor.service";
import { forkJoin } from "rxjs";
import { CommonModule } from "@angular/common";
import { MessageService, ConfirmationService } from "primeng/api";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { FileUploadModule } from "primeng/fileupload";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { KeyFilterModule } from "primeng/keyfilter";
import { MessageModule } from "primeng/message";
import { StepperModule } from "primeng/stepper";
import { ToastModule } from "primeng/toast";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { TYPE_PARTNER } from "@/layout/Utils/constants/aba.constants";
import { CommonService } from "@/pages/service/commonService";
import { TabsModule } from 'primeng/tabs';
import { environment } from "src/environments/environment";
import { UtilService } from "@/utils/util.services";
@Component({
    selector: 'app-edit-proveedor',
    templateUrl: './edit-proveedor.component.html',
    styleUrls: ['./edit-proveedor.component.scss'],
    imports: [TabsModule, KeyFilterModule, ToggleSwitchModule, StepperModule, InputGroupAddonModule, InputGroupModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService, ConfirmationService],
    encapsulation: ViewEncapsulation.None
})
export class EditProveedorComponent implements OnInit {

    data: any;
    filteredElement: any[] = [];
    proveedor: any = null;
    proveedores: any[] = [];
    proveedoresListado: any[] = [];
    formInfoBasicaProveedor!: FormGroup;
    formInfoContactoProveedor!: FormGroup;
    formDatosDireccion!: FormGroup;
    formCuentas!: FormGroup;
    departamento: any[] = [];
    departamentoSelected: any;
    provincia: any[] = [];
    provinciaSelected: any;
    distrito: any[] = [];
    distritoSelected: any;
    tipoDocumentoProveedor: any[] = [];
    tipoDocumentoProveedorSelected: any;
    banco: any[] = [{ id: '01', descripcion: 'INTERBANK' }, { id: '02', descripcion: 'BCP', }];
    tipoCuenta: any[] = [{ id: 1, descripcion: 'SOLES' }, { id: 2, descripcion: 'DOLARES' }]
    tipoMoneda: any[] = [{ id: 1, descripcion: 'USD' }, { id: 2, descripcion: 'PEN' }];
    tipoDocumentoOriginal: any[] = [];
    nroCaracterProveedor: number = 0;
    datosCuentas: any[] = [];
    tipoProveedor: any[] = TYPE_PARTNER;
    partnertRelacionado: any;
    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly router: Router,
        public activatedRoute: ActivatedRoute,
        private readonly commonService: CommonService,
        private readonly proveedorService: ProveedorService,
        private readonly toastr: MessageService,
    ) {
    }
    ngOnInit(): void {

        this.activatedRoute.params.subscribe(params => {
            this.data = params;
            this.commonService.getMultipleCombosPromiseCliente(['documentos/tipos']).then(resp => {
                this.tipoDocumentoProveedor = resp[0]['data']['content'].map((item: any) => {
                    return {
                        id: item['codigo'],
                        descripcion: item['nombre']
                    }
                });
            }).then(_resp => {
                this.getProveedor();
            })
        })

    }
    getProveedor(): void {
        let servicio;
        servicio = this.proveedorService.getObtenerProveedor();
        servicio.subscribe(
            (resp: any) => {
                if (resp?.codigo === 0) {
                    this.procesarProveedor(resp.data);
                    return;
                }

                this.toastr.add({
                    severity: 'error',
                    summary: 'Error getObtenerProveedor',
                    detail: resp?.mensaje || 'No se pudo obtener el proveedor'
                });
            },
            () => {
                this.toastr.add({
                    severity: 'error',
                    summary: 'Error getApoderado',
                    detail: 'Error en el servicio de obtener datos del apoderado'
                });
            }
        );
    }

    private procesarProveedor(lista: any[]): void {
        this.proveedores = lista;

        this.proveedor = this.proveedores.find(
            e => e.numeroDocIdentidad === this.data.doc &&
                e.tipoDocIdentidad === this.data.tipo
        );

        this.proveedoresListado = this.proveedores
            .filter(item => item.numeroDocIdentidad !== this.data.doc)
            .filter(item =>
                !item.idPartnerRelacionado ||
                item.idPartnerRelacionado === this.proveedor?.idPartner
            )
            .map(item => this.mapearProveedor(item));

        this.proveedor.cuentas = this.datosCuentas;

        this.createFormInfoBasicaProveedor();
        this.createFormInfoContactoProveedor();
        this.createFormDatosDireccion();
        this.getCombosUbigeo();
        this.getBancoCuentaProveedor();
    }

    private mapearProveedor(item: any): any {
        const nombreGenerico =
            item.razonSocial ||
            `${item.primerNombre} ${item.segundoNombre || ''} ${item.apellidoPaterno} ${item.apellidoMaterno}`.trim();

        return {
            ...item,
            nombreGenerico
        };
    }
    getCombosUbigeo() {
        const source$ = this.commonService.getUbigeo(this.proveedor.dptUbigeo, this.proveedor.prvUbigeo);

        source$.subscribe((resp: any) => {
            this.cargarDepartamentos(resp[0]);
            this.cargarProvincias(resp[1]);
            this.cargarDistritos(resp[2]);

            this.formDatosDireccion.get('direccion')!.setValue(this.proveedor.direccion);
        });
    }

    private cargarDepartamentos(resp: any) {
        if (!resp?.data) return;

        this.departamento = resp.data.map((item: any) => ({
            id: item.id.dptUbigeo,
            descripcion: item.desUbigeo
        }));

        this.departamentoSelected = this.departamento
            .find(d => d.id === this.proveedor.dptUbigeo);

        this.formDatosDireccion.get('departamento')!
            .patchValue(this.departamentoSelected);
    }

    private cargarProvincias(resp: any) {
        if (resp?.codigo !== 0) return;

        this.provincia = resp.data.map((item: any) => ({
            id: item.id.prvUbigeo,
            descripcion: item.desUbigeo
        }));

        this.provinciaSelected = this.provincia
            .find(p => p.id === this.proveedor.prvUbigeo);

        this.formDatosDireccion.get('provincia')!
            .patchValue(this.provinciaSelected);
    }

    private cargarDistritos(resp: any) {
        if (resp?.codigo !== 0) return;

        this.distrito = resp.data.map((item: any) => ({
            id: item.id.dstUbigeo,
            descripcion: item.desUbigeo
        }));

        this.distritoSelected = this.distrito
            .find(d => d.id === this.proveedor.dstUbigeo);

        this.formDatosDireccion.get('distrito')!
            .patchValue(this.distritoSelected);
    }
    getBancoCuentaProveedor() {

        this.proveedorService.getBancoCuentaProveedor(this.proveedor.idPartner).subscribe((resp: any) => {
            if (resp['codigo'] == 0) {
                this.proveedor.cuentas = resp.data;
                this.createFormCuentas();
                this.proveedor.cuentas.forEach((cuenta: any) => {
                    this.setCuentas(cuenta);
                });
            } else {
                this.toastr.add({ severity: 'error', summary: 'Error getBancoCuentaProveedor', detail: resp['mensaje'] });
            }
        }, (_error) => {
            this.toastr.add({ severity: 'error', summary: 'Error getBancoCuentaProveedor', detail: 'Error en el servicio de obtener datos de las cuentas del proveedor' });
        })

    }
    createFormInfoBasicaProveedor() {
        const tipoProveedor = this.tipoProveedor.find(item => item.id === this.proveedor.tipoPartner)
        const isPartnerRelacionado = !!(this.proveedor?.idPartnerRelacionado);
        if (isPartnerRelacionado) {
            this.partnertRelacionado = this.proveedoresListado.find(item => item.idPartner === this.proveedor?.idPartnerRelacionado);
        }
        this.tipoDocumentoProveedorSelected = this.tipoDocumentoProveedor.find(e => e.id == this.proveedor.tipoDocIdentidad)
        this.formInfoBasicaProveedor = new FormGroup({
            tipoProveedor: new FormControl(),
            tipoDocumento: new FormControl(null, [Validators.required]),
            nroDocumento: new FormControl(null, [Validators.required]),
            idc: new FormControl(this.proveedor.idc),
            primerNombre: new FormControl(this.proveedor.primerNombre),
            segundoNombre: new FormControl(this.proveedor.segundoNombre),
            primerApellido: new FormControl(this.proveedor.apellidoPaterno),
            segundoApellido: new FormControl(this.proveedor.apellidoMaterno),
            razonSocial: new FormControl(this.proveedor.razonSocial),
            isPartner: new FormControl(isPartnerRelacionado),
            proveedor: new FormControl(this.partnertRelacionado),
        })
        this.formInfoBasicaProveedor.get('tipoProveedor')!.setValue(tipoProveedor);
        this.formInfoBasicaProveedor.get('tipoDocumento')!.setValue(this.tipoDocumentoProveedorSelected);
        if (this.tipoDocumentoProveedorSelected.id == '01') {
            this.nroCaracterProveedor = 8;
            this.formInfoBasicaProveedor.get('nroDocumento')!.setValue(this.proveedor.numeroDocIdentidad);
            this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
            this.formInfoBasicaProveedor.get('nroDocumento')!.updateValueAndValidity()
        } else if (this.tipoDocumentoProveedorSelected.id == '02') {
            this.nroCaracterProveedor = 9;
            this.formInfoBasicaProveedor.get('nroDocumento')!.setValue(this.proveedor.numeroDocIdentidad);
            this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
            this.formInfoBasicaProveedor.get('nroDocumento')!.updateValueAndValidity()
        } else if (this.tipoDocumentoProveedorSelected.id == '03') {
            this.nroCaracterProveedor = 11;
            this.formInfoBasicaProveedor.get('nroDocumento')!.setValue(this.proveedor.numeroDocIdentidad);
            this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
            this.formInfoBasicaProveedor.get('nroDocumento')!.updateValueAndValidity()
        }
    }
    createFormInfoContactoProveedor() {
        this.formInfoContactoProveedor = new FormGroup({
            telefono: new FormControl(this.proveedor.telefono),
            celular: new FormControl(this.proveedor.celular),
            anexo: new FormControl(this.proveedor.anexo),
            nombre: new FormControl(this.proveedor.nombreContacto),
            correo: new FormControl(this.proveedor.correoContacto),
        })
    }
    createFormDatosDireccion() {
        this.formDatosDireccion = new FormGroup({
            direccion: new FormControl(null, [Validators.required]),
            departamento: new FormControl(null, [Validators.required]),
            provincia: new FormControl(null, [Validators.required]),
            distrito: new FormControl(null, [Validators.required])
        })
    }
    createFormCuentas() {
        this.formCuentas = new FormGroup({
            cuentas: new FormArray([])
        })
    }
    cuentaFormGroup(data: any = null): FormGroup {
        if (data) {
            return new FormGroup({
                idCuenta: new FormControl(data.idCuenta, [Validators.required]),
                banco: new FormControl(data.banco, [Validators.required]),
                tipoCuenta: new FormControl(data.tipoCuenta, [Validators.required]),
                numCuenta: new FormControl(data.numCuenta, [Validators.required]),
                tipoMoneda: new FormControl(data.tipoMoneda, [Validators.required]),
            })
        }
        return new FormGroup({
            idCuenta: new FormControl(null, [Validators.required]),
            banco: new FormControl(null, [Validators.required]),
            tipoCuenta: new FormControl(null, [Validators.required]),
            numCuenta: new FormControl(null, [Validators.required]),
            tipoMoneda: new FormControl(null, [Validators.required]),
        })
    }
    get cuentas(): FormArray {
        return this.formCuentas.get('cuentas') as FormArray;
    }

    setCuentas(cuentaPartner: any) {
        this.cuentas.push(
            this.cuentaFormGroup({
                idCuenta: cuentaPartner.idBancoCuentaPartner, banco: { idBanco: cuentaPartner.idBanco, descripcion: cuentaPartner.idBanco }, tipoCuenta: { id: cuentaPartner.tipoCuenta, descripcion: cuentaPartner.tipoCuenta }
                , numCuenta: cuentaPartner.nroCuenta, tipoMoneda: { id: cuentaPartner.moneda, descripcion: cuentaPartner.moneda }
            })
        )
    }

    agregarCuenta() {
        this.cuentas.push(
            this.cuentaFormGroup()
        )
    }

    changeModelTipoProveedor(event: any, type: any) {
        console.log(event, type);
        if (event) {
            if (event.id == 2) {//PersJuridica
                this.formInfoBasicaProveedor.get('tipoDocumento')!.enable();
                const tipoDocu = this.tipoDocumentoProveedor.find(e => e.id == '03')
                this.formInfoBasicaProveedor.get('tipoDocumento')!.setValue(tipoDocu);
            } else {//PersNatu
                this.formInfoBasicaProveedor.get('tipoDocumento')!.enable();
            }
        }
    }

    changeModelDepartamento() {
        this.provincia = [];
        this.distrito = [];
        this.formDatosDireccion.get('provincia')!.setValue(null);
        this.formDatosDireccion.get('distrito')!.setValue(null);
        this.commonService.getProvincia(this.formDatosDireccion.get('departamento')!.value['id'])
            .subscribe((resp: any) => {
                resp['data'].forEach((item: any) => {
                    this.provincia.push({
                        id: item['id'].prvUbigeo,
                        descripcion: item['desUbigeo']
                    });
                })
            });
    }

    changeModelProvincia() {
        this.distrito = [];
        this.formDatosDireccion.get('distrito')!.setValue(null);
        this.commonService.getDistrito(this.formDatosDireccion.get('departamento')!.value['id'], this.formDatosDireccion.get('provincia')!.value['id'])
            .subscribe((resp: any) => {
                resp['data'].forEach((item: any) => {
                    this.distrito.push({
                        id: item['id'].dstUbigeo,
                        descripcion: item['desUbigeo']
                    });
                })
            });
    }

    changeModelTipoDocumento(event: any, type: any) {
        if (event !== null) {
            this.formInfoBasicaProveedor.get('nroDocumento')!.reset();
            if (event.id == '01') {
                this.nroCaracterProveedor = 8;
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValue(this.proveedor.numeroDocIdentidad);
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
                this.formInfoBasicaProveedor.get('nroDocumento')!.updateValueAndValidity();
            } else if (event.id == '02') {
                this.nroCaracterProveedor = 9;
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValue(this.proveedor.numeroDocIdentidad);
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
                this.formInfoBasicaProveedor.get('nroDocumento')!.updateValueAndValidity();
            } else if (event.id == '03') {
                this.nroCaracterProveedor = 11;
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValue(this.proveedor.numeroDocIdentidad);
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
                this.formInfoBasicaProveedor.get('nroDocumento')!.updateValueAndValidity();
            } else {
                this.nroCaracterProveedor = 1;
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
            }
        }
    }

    changeModelBanco(event: any, index: number) {
        const cuenta = (this.cuentas.controls[index]) as FormGroup;
        cuenta.get('tipoCuenta')?.setValue(null);
        cuenta.get('tipoMoneda')?.setValue(null);
        cuenta.get('numCuenta')?.setValue(null);
    }
    changeModelTipoCuenta(event: any, index: any) {
        if (event) {
            const cuenta = this.cuentas.at(index);
            const tipoMoneda = cuenta.get('tipoMoneda')?.value;
            cuenta.get('tipoMoneda')?.setValue(tipoMoneda);
            cuenta.get('numCuenta')?.setValue(null);
        }
    }
    changeModelTipoMoneda(event: any, index: any) {
        this.cuentas.at(index).get('numCuenta')?.setValue(null);
    }
    onChangeSwitch(event: any) {
        if (event?.checked) {
            this.formInfoBasicaProveedor.get('proveedor')!.setValidators(Validators.required)
        } else {
            this.formInfoBasicaProveedor.get('proveedor')!.clearValidators()
        }
    }

    filterElementProveedor(event: any, data: any) {
        this.filteredElement = [];
        const query = event?.query ?? '';
        this.filteredElement = UtilService.filterByField(data, query, 'nombreGenerico');
    }

    changeModelProveedor(event: any, type: any) {
        console.log(event, type);
    }

    quitarCuenta(index: any) {
        this.cuentas.removeAt(index);
    }


    putProveedor() {
        const usuario = JSON.parse(localStorage.getItem('userABA')!);
        let idPartnerRelacionado;
        if (this.formInfoBasicaProveedor.get('isPartner')!.value) {
            idPartnerRelacionado = this.formInfoBasicaProveedor.get('proveedor')!.value?.idPartner || 0;
        }


        const proveedorUpdated = {
            anexo: this.formInfoContactoProveedor.get('anexo')!.value,
            apellidoMaterno: this.formInfoBasicaProveedor.get('segundoApellido')!.value,
            apellidoPaterno: this.formInfoBasicaProveedor.get('primerApellido')!.value,
            celular: this.formInfoContactoProveedor.get('celular')!.value,
            correoContacto: this.formInfoContactoProveedor.get('correo')!.value,
            direccion: this.formDatosDireccion.get('direccion')!.value,
            dptUbigeo: this.formDatosDireccion.get('departamento')!.value?.id ?? null,
            dstUbigeo: this.formDatosDireccion.get('distrito')!.value?.id ?? null,
            estado: 1,
            idPartnerRelacionado: idPartnerRelacionado,
            idPartner: this.proveedor.idPartner,
            numeroDocIdentidad: this.formInfoBasicaProveedor.get('nroDocumento')!.value,
            idc: this.formInfoBasicaProveedor.get('idc')!.value,
            primerNombre: this.formInfoBasicaProveedor.get('primerNombre')!.value,
            prvUbigeo: this.formDatosDireccion.get('provincia')!.value?.id ?? null,
            razonSocial: this.formInfoBasicaProveedor.get('razonSocial')!.value,
            segundoNombre: this.formInfoBasicaProveedor.get('segundoNombre')!.value,
            telefono: this.formInfoContactoProveedor.get('telefono')!.value,
            tipoDocIdentidad: this.formInfoBasicaProveedor.get('tipoDocumento')!.value.id,
            tipoPartner: +this.formInfoBasicaProveedor.get('tipoProveedor')!.value.id,
            usuarioActualizacion: usuario.email,
        }
        this.proveedorService.putActualizarPartner(proveedorUpdated).subscribe((resp: any) => {
            if (resp) {
                if (resp['codigo'] == 0) {
                    this.toastr.add({ severity: 'success', summary: 'Actualizacion exitosa', detail: 'Proveedor actualizado correctamente' });
                    this.router.navigate(['/apps/mantenimiento/proveedor']);
                } else {
                    this.toastr.add({ severity: 'error', summary: 'Error crearProveedor', detail: 'Error en el servicio de registro de proveedor' });
                }
            }
        }, (_error) => {
            this.toastr.add({ severity: 'error', summary: 'Error crearProveedor', detail: 'Error en el servicio de registro de proveedor - no controlado' });
        })
    }
    postBancoCuentaProveedor() {
        const usuario = JSON.parse(localStorage.getItem('userABA')!);
        const cuentas = this.cuentas.value
        const cuentasArray = cuentas.map((cuenta: any) => {
            return {
                idBanco: cuenta.banco.id,
                idPartner: this.proveedor.idPartner,
                indActivo: "1",
                moneda: cuenta.tipoMoneda.id,
                nroCuenta: cuenta.numCuenta,
                tipoCuenta: cuenta.tipoCuenta,
                usuarioRegistro: usuario.email
            }
        });
        const requests = cuentasArray.map((request: any) => this.proveedorService.postRegistrarBancoCuentaPartner(request));
        forkJoin(requests).subscribe((resp: any) => {
            resp.forEach((response: any) => {
                console.log(response);
            });
        });
    }

    filterElement(event: any, data: any) {
        this.filteredElement = [];
        const query = event?.query ?? '';
        this.filteredElement = UtilService.filterByField(data, query, 'descripcion');
    }
    regresar() {
        this.router.navigate(['/apps/mantenimiento/proveedor']);
    }
    requireMatch(control: FormControl): ValidationErrors | null {
        const selection: any = control.value;
        if (typeof selection === 'string') {
            return { requireMatch: true };
        }
        return null;
    }
}