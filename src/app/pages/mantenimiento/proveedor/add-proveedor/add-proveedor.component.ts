import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ProveedorService } from "../proveedor.service";
import { BancoService } from "../../banco/banco.service";
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
import { MessageModule } from "primeng/message";
import { ToastModule } from "primeng/toast";
import { TYPE_PARTNER } from "@/layout/Utils/constants/aba.constants";
import { CommonService } from "@/pages/service/commonService";
import { StepperModule } from 'primeng/stepper';
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { KeyFilterModule } from 'primeng/keyfilter';
import { UtilService } from "@/utils/util.services";
@Component({
    selector: 'app-add-proveedor',
    templateUrl: './add-proveedor.component.html',
    styleUrls: ['./add-proveedor.component.scss'],
    imports: [KeyFilterModule, ToggleSwitchModule, StepperModule, InputGroupAddonModule, InputGroupModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService, ConfirmationService],
    encapsulation: ViewEncapsulation.None
})
export class AddProveedorComponent implements OnInit {

    formTipoProveedor!: FormGroup;
    filteredElement: any[] = [];
    tipoProveedor: any[] = TYPE_PARTNER;
    //Seccion 2 Informacion basica de proveedor
    formInfoBasicaProveedor!: FormGroup;
    tipoDocumentoProveedor: any[] = [];
    nroCaracterProveedor: number = 0;
    //Seccion 3 Informacion de Contacto
    formInfoContactoProveedor!: FormGroup;
    //Seccion 4 Direccion de Proveedor
    formDatosDireccion!: FormGroup;
    departamento: any[] = [];
    provincia: any[] = [];
    distrito: any[] = [];
    //Seccion 5 Cuentas Bancarios
    formAddCuentas!: FormGroup;
    // banco: any[] = [{ id: '01', descripcion: 'INTERBANK' }, { id: '02', descripcion: 'BCP', }];
    banco: any[] = [];
    tipoCuenta: any[] = [{ id: '1', descripcion: 'CUENTA DE AHORROS' }, { id: '2', descripcion: 'CUENTA CORRIENTE' }]
    // tipoMoneda: any[] = [{ id: '1', descripcion: 'PEN' }, { id: '2', descripcion: 'USD' }]
    tipoMoneda: any[] = [];
    proveedores: any[] = []
    //Cuando se registre el proveedor
    idProveedor: any;

    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly router: Router,
        private readonly commonService: CommonService,
        private readonly proveedorService: ProveedorService,
        private readonly bancoService: BancoService,
        private readonly toastr: MessageService,
    ) {
        this.createFormTipoProveedor();
        this.createFormInfoBasicaProveedor();
        this.createFormInfoContactoProveedor();
        this.createFormDatosDireccion();
        this.createFormAddCuentas();
    }
    ngOnInit(): void {
        this.getCombos();
        this.getBancos();
        this.getTipoMonedas();
        this.getProveedores();
    }
    activeStep = 1;

    nextStep(formstep: FormGroup, step: number) {
        if (formstep?.valid) {
            this.activeStep = step;
        } else {
            formstep?.markAllAsTouched();
        }
    }

    prevStep(step: number) {
        this.activeStep = step;
    }
    createFormTipoProveedor() {
        this.formTipoProveedor = new FormGroup({
            tipoProveedor: new FormControl(null, [Validators.required])
        })
    }

    createFormInfoBasicaProveedor() {
        this.formInfoBasicaProveedor = new FormGroup({
            isPartner: new FormControl(),
            proveedor: new FormControl(),
            tipoDocumento: new FormControl(null, [this.requireMatch, Validators.required]),
            nroDocumento: new FormControl(),
            //Tipo proveedor == 1 PERSONA NATURAL
            primerNombre: new FormControl(),
            segundoNombre: new FormControl(),
            primerApellido: new FormControl(),
            segundoApellido: new FormControl(),
            //Tipo proveedor == 2 PERSONA JURIDICA
            razonSocial: new FormControl(),
            idc: new FormControl()
        })
    }
    createFormInfoContactoProveedor() {
        this.formInfoContactoProveedor = new FormGroup({
            telefono: new FormControl(null),
            celular: new FormControl(null, [Validators.required]),
            anexo: new FormControl(null),
            nombre: new FormControl(null, [Validators.required]),
            correo: new FormControl(null, [Validators.required, Validators.email]),

        })
    }

    createFormDatosDireccion() {
        this.formDatosDireccion = new FormGroup({
            direccion: new FormControl(null, [Validators.required]),
            departamento: new FormControl(null),
            provincia: new FormControl(null),
            distrito: new FormControl(null)
        })
    }

    createFormAddCuentas() {
        this.formAddCuentas = new FormGroup({
            cuentas: new FormArray([], [Validators.required])
        })
    }

    get cuentas(): FormArray {
        return this.formAddCuentas.get('cuentas') as FormArray;
    }

    cuentaFormGroup(): FormGroup {
        return new FormGroup({
            banco: new FormControl(null, [Validators.required]),
            tipoCuenta: new FormControl(null, [Validators.required]),
            numCuenta: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(20)]),
            tipoMoneda: new FormControl(null, [Validators.required]),
        })
    }

    getCombos(): void {
        let promesaTipoDoc;
        let observableDepartamentos;


        promesaTipoDoc = this.commonService.getMultipleCombosPromiseCliente(['documentos/tipos']);
        observableDepartamentos = this.commonService.getDepartamento();


        // Procesar tipo documento
        promesaTipoDoc.then(resp => {
            const contenido = resp[0]?.data?.content || [];
            this.tipoDocumentoProveedor = contenido.map((item: any) => ({
                id: item.codigo,
                descripcion: item.nombre
            }));
        });

        // Procesar departamentos
        observableDepartamentos.subscribe((resp: any) => {
            const contenido = resp?.data || [];
            this.departamento = contenido.map((item: any) => ({
                id: item.id?.dptUbigeo,
                descripcion: item.desUbigeo
            }));
        });
    }


    getBancos(): void {
        let servicio;
        servicio = this.bancoService.getObtenerBancos();

        servicio.subscribe(
            (resp: any) => {
                if (resp?.codigo === 0) {
                    this.banco = resp.data;
                    return;
                }
                this.mostrarErrorBancos();
            },
            () => this.mostrarErrorBancos()
        );
    }
    private mostrarErrorBancos(): void {
        this.toastr.add({
            severity: 'error',
            summary: 'Error getBancos()',
            detail: 'No se pudo obtener los bancos'
        });
    }

    getTipoMonedas(): void {
        let promesa;


        promesa = this.commonService.getMultipleCombosPromise(['TIPO_MONEDA_TRAMA']);


        promesa.then(resp => {
            const data = resp[0]?.data;

            if (!data) {
                return;
            }

            this.tipoMoneda = data.map((moneda: any) => ({
                id: moneda.valNumEntero,
                descripcion: moneda.valCadCorto
            }));
        });
    }


    getProveedores(): void {
        let servicio;


        servicio = this.proveedorService.getObtenerProveedor();


        servicio.subscribe(
            (resp: any) => {
                if (resp?.codigo === 0) {
                    this.proveedores = this.procesarProveedores(resp.data);
                    return;
                }

                this.mostrarErrorProveedores();
            },
            () => this.mostrarErrorProveedores()
        );
    }

    private procesarProveedores(lista: any[]): any[] {
        return lista
            .filter((item: any) => !item.idPartnerRelacionado)
            .map((item: any) => {
                const nombreGenerico =
                    item.razonSocial ||
                    `${item.primerNombre} ${item.segundoNombre || ''} ${item.apellidoPaterno} ${item.apellidoMaterno}`.trim();

                return {
                    ...item,
                    nombreGenerico
                };
            });
    }

    private mostrarErrorProveedores(): void {
        this.toastr.add({
            severity: 'error',
            summary: 'Error getProveedores()',
            detail: 'No se pudo obtener los proveedores'
        });
    }


    filterElementProveedor(event: any, data: any) {
        this.filteredElement = [];
        const query = event?.query ?? '';
        this.filteredElement = UtilService.filterByField(data, query, 'nombreGenerico');
    }

    filterElement(event: any, data: any) {
        this.filteredElement = [];
        const query = event?.query ?? '';
        this.filteredElement = UtilService.filterByField(data, query, 'descripcion');
    }

    filterElementBanco(event: any, data: any) {
        this.filteredElement = [];
        const query = event?.query ?? '';
        this.filteredElement = UtilService.filterByField(data, query, 'nombre');
    }

    onChangeSwitch(event: any) {
        if (event?.checked) {
            this.formInfoBasicaProveedor.get('proveedor')!.setValidators(Validators.required)
            this.formInfoBasicaProveedor.get('proveedor')!.updateValueAndValidity()
        } else {
            this.formInfoBasicaProveedor.get('proveedor')!.clearValidators()
            this.formInfoBasicaProveedor.get('proveedor')!.updateValueAndValidity()
        }

    }

    changeModelProveedor(event: any, type: any) {
        console.log(event, type);

    }

    changeModelTipoProveedor(event: any, type: any) {
        console.log(event, type);
        if (event) {
            if (event.id == 2) {//PersJuridica                
                this.formInfoBasicaProveedor.get('tipoDocumento')!.disable();
                const tipoDocu = this.tipoDocumentoProveedor.find(e => e.id == '03')
                this.formInfoBasicaProveedor.get('tipoDocumento')!.setValue(tipoDocu);
            } else {//PersNatu                
                this.formInfoBasicaProveedor.get('tipoDocumento')!.enable();
            }
        }
    }

    changeModelTipoDocumento(event: any, type: any) {
        if (event !== null) {
            this.formInfoBasicaProveedor.get('nroDocumento')!.reset();
            if (event.id == '01') {
                this.nroCaracterProveedor = 8;
                this.formInfoBasicaProveedor.get('primerNombre')!.setValidators([Validators.required])
                this.formInfoBasicaProveedor.get('primerNombre')!.updateValueAndValidity();
                this.formInfoBasicaProveedor.get('segundoNombre')!.clearValidators()
                this.formInfoBasicaProveedor.get('segundoNombre')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('primerApellido')!.setValidators([Validators.required])
                this.formInfoBasicaProveedor.get('primerApellido')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('segundoApellido')!.setValidators([Validators.required])
                this.formInfoBasicaProveedor.get('segundoApellido')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('razonSocial')!.clearValidators();
                this.formInfoBasicaProveedor.get('razonSocial')!.updateValueAndValidity();
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
            } else if (event.id == '02') {
                this.nroCaracterProveedor = 9;
                this.formInfoBasicaProveedor.get('primerNombre')!.setValidators([Validators.required])
                this.formInfoBasicaProveedor.get('primerNombre')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('segundoNombre')!.clearValidators()
                this.formInfoBasicaProveedor.get('segundoNombre')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('primerApellido')!.setValidators([Validators.required])
                this.formInfoBasicaProveedor.get('primerApellido')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('segundoApellido')!.setValidators([Validators.required])
                this.formInfoBasicaProveedor.get('segundoApellido')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('razonSocial')!.clearValidators();
                this.formInfoBasicaProveedor.get('razonSocial')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
            } else if (event.id == '03') {
                this.nroCaracterProveedor = 11;
                this.formInfoBasicaProveedor.get('primerNombre')!.clearValidators()
                this.formInfoBasicaProveedor.get('primerNombre')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('segundoNombre')!.clearValidators()
                this.formInfoBasicaProveedor.get('segundoNombre')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('primerApellido')!.clearValidators()
                this.formInfoBasicaProveedor.get('primerApellido')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('segundoApellido')!.clearValidators()
                this.formInfoBasicaProveedor.get('segundoApellido')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('razonSocial')!.setValidators(Validators.required)
                this.formInfoBasicaProveedor.get('razonSocial')!.updateValueAndValidity()
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
            } else {
                this.nroCaracterProveedor = 1;
                this.formInfoBasicaProveedor.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracterProveedor), Validators.maxLength(this.nroCaracterProveedor), Validators.required])
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
                    const descripcion: string = item['desUbigeo']
                    this.distrito.push({
                        id: item['id'].dstUbigeo,
                        descripcion: descripcion.replace('¿', 'Ñ')
                    });
                })
            });
    }

    agregarCuenta() {
        this.cuentas.push(
            this.cuentaFormGroup()
        )
    }
    quitarCuenta(index: any) {
        this.cuentas.removeAt(index);
    }

    changeModelBanco(event: any, type: any, index: any) {
        console.log(this.cuentas.at(index));
        if (event) {
            this.cuentas.at(index).get('tipoCuenta')!.setValue(null)
        }
    }
    changeModelTipoMoneda(event: any, type: any, index: any) {
        this.cuentas.at(index).get('numCuenta')!.setValue(null);
    }

    changeModelTipoCuenta(event: any, type: any, index: any) {
        this.cuentas.at(index).get('numCuenta')!.setValue(null);
        this.cuentas.at(index).get('tipoMoneda')!.setValue(null);
    }

    crearProveedor() {
        const usuario = JSON.parse(localStorage.getItem('userABA')!);
        let idPartnerRelacionado;
        if (this.formInfoBasicaProveedor.get('isPartner')!.value) {
            idPartnerRelacionado = this.formInfoBasicaProveedor.get('proveedor')!.value?.idPartner || 0;
        }
        const proveedor = {
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
            nombreContacto: this.formInfoContactoProveedor.get('nombre')!.value,
            numeroDocIdentidad: this.formInfoBasicaProveedor.get('nroDocumento')!.value,
            idc: this.formInfoBasicaProveedor.get('idc')!.value,
            primerNombre: this.formInfoBasicaProveedor.get('primerNombre')!.value,
            prvUbigeo: this.formDatosDireccion.get('provincia')!.value?.id ?? null,
            razonSocial: this.formInfoBasicaProveedor.get('razonSocial')!.value,
            segundoNombre: this.formInfoBasicaProveedor.get('segundoNombre')!.value,
            telefono: this.formInfoContactoProveedor.get('anexo')!.value,
            tipoDocIdentidad: this.formInfoBasicaProveedor.get('tipoDocumento')!.value.id,
            tipoPartner: +this.formTipoProveedor.get('tipoProveedor')!.value.id,
            usuarioRegistro: usuario.email,
        }
        this.proveedorService.postRegistrarProveedor(proveedor).subscribe((resp: any) => {
            if (resp) {
                if (resp['codigo'] == 0) {
                    this.toastr.add({ severity: 'success', summary: 'Registro exitoso', detail: 'Proveedor creado correctamente' });
                    this.idProveedor = resp.data.idPartner;
                    if (this.cuentas.length > 0) {
                        this.postAddCuentas(proveedor.tipoDocIdentidad, proveedor.numeroDocIdentidad);
                    } else {
                        this.router.navigate(['/apps/mantenimiento/proveedor/edit/' + proveedor.tipoDocIdentidad + '/' + proveedor.numeroDocIdentidad]);
                    }
                } else {
                    this.toastr.add({ severity: 'error', summary: 'Error crearProveedor', detail: `Error en el servicio de registro de proveedor` });
                }
            }
        }, (_error) => {
            this.toastr.add({ severity: 'error', summary: 'Error crearProveedor', detail: `Error en el servicio de registro de proveedor - no controlado` });
        })
    }

    postAddCuentas(tipoDocIdentidad: any, numeroDocIdentidad: any) {
        const usuario = JSON.parse(localStorage.getItem('userABA')!);
        const observables = [];
        let indExito = true;
        for (let index = 0; index < this.cuentas.length; index++) {
            const numCuenta: string = this.cuentas.at(index).get('numCuenta')!.value;
            let cuenta = {
                idBanco: this.cuentas.at(index).get('banco')!.value.idBanco,
                idPartner: this.idProveedor,
                indActivo: "1",
                moneda: this.cuentas.at(index).get('tipoMoneda')!.value.id,
                // nroCuenta: numCuenta.split('-').join(''),
                nroCuenta: numCuenta,
                tipoCuenta: this.cuentas.at(index).get('tipoCuenta')!.value.id,
                usuarioRegistro: usuario.email
            }
            observables.push(this.proveedorService.postRegistrarBancoCuentaPartner(cuenta))
        }
        forkJoin(observables).subscribe((respuestas: any) => {
            respuestas.forEach((resp: any) => {
                if (resp) {
                    if (resp['codigo'] == 0) {
                        this.toastr.add({ severity: 'success', summary: 'Registro exitoso', detail: 'Se registro la cuenta al proveedor' });
                    } else {
                        indExito = false;
                        this.toastr.add({ severity: 'error', summary: 'Error postAddCuentas()', detail: `No se pudo registrar la cuenta` });
                    }
                }
            }, (_error: any) => {
                this.toastr.add({ severity: 'error', summary: 'Error postAddCuentas()', detail: `No se pudo registrar la cuenta` });
            });
            if (indExito) {
                this.router.navigate(['/apps/mantenimiento/proveedor/edit/' + tipoDocIdentidad + '/' + numeroDocIdentidad]);
            }
        });
    }
    verForm() {
        console.log(this.formTipoProveedor);
        console.log(this.formInfoBasicaProveedor);
    }
    requireMatch(control: FormControl): ValidationErrors | null {
        const selection: any = control.value;
        if (typeof selection === 'string') {
            return { requireMatch: true };
        }
        return null;
    }
    regresar() {
        this.router.navigate(['/apps/mantenimiento/proveedor']);
    }
}