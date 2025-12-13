import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ProveedorService } from "../../proveedor.service";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { BancoService } from "../../../banco/banco.service";
import { TYPE_CUENTA } from "@/layout/Utils/constants/aba.constants";
import { CommonService } from "@/pages/service/commonService";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { MessageService } from "primeng/api";
import { CommonModule } from "@angular/common";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { FileUploadModule } from "primeng/fileupload";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { SelectModule } from "primeng/select";
import { ToastModule } from "primeng/toast";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { UtilService } from "@/utils/util.services";
@Component({
    selector: 'app-edit-cuentas-proveedor',
    templateUrl: './edit-cuentas-proveedor.component.html',
    styleUrls: ['./edit-cuentas-proveedor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [ToggleSwitchModule, DatePickerModule, SelectModule, InputGroupAddonModule, InputGroupModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService]
})
export class EditCuentasProveedorComponent implements OnInit {

    idProveedor: any;
    datosCuentaProveedor: any[] = [];
    filteredElement: any[] = [];
        formAddCuentas!: FormGroup;


    banco: any[] = [];
    tipoCuenta: any[] = TYPE_CUENTA;
    tipoMoneda: any[] = [{ id: '1', descripcion: 'PEN' }, { id: '2', descripcion: 'USD' }]



    constructor(
        private readonly proveedorService: ProveedorService,     
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly toastr: MessageService,
        private readonly bancoService: BancoService,
        private readonly commonService: CommonService,
    ) {
        console.log(config.data);
        this.idProveedor = config.data.idPartner;
        this.createFormAddCuentas();
    }
    ngOnInit() {
        this.getBancos();
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
            banco: new FormControl(null, [Validators.required, this.requireMatch]),
            tipoCuenta: new FormControl(null, [Validators.required, this.requireMatch]),
            numCuenta: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(20)]),
            tipoMoneda: new FormControl(null, [Validators.required, this.requireMatch]),
            create: new FormControl(true),
            idBancoCuentaPartner: new FormControl(null),
        })
    }

    cuentaExistFormGroup(banco: any, tipoCuenta: any, numCuenta: any, tipoMoneda: any, idBancoCuentaPartner: any): FormGroup {
        return new FormGroup({
            // idCuenta: new FormControl(null, [Validators.required]),
            banco: new FormControl(banco, [Validators.required, this.requireMatch]),
            tipoCuenta: new FormControl(tipoCuenta, [Validators.required, this.requireMatch]),
            numCuenta: new FormControl(numCuenta, [Validators.required, Validators.minLength(10), Validators.maxLength(20)]),
            tipoMoneda: new FormControl(tipoMoneda, [Validators.required, this.requireMatch]),
            create: new FormControl(false),
            idBancoCuentaPartner: new FormControl(idBancoCuentaPartner),
        })
    }

    agregarCuenta() {
        this.cuentas.push(
            this.cuentaFormGroup()
        )
    }

    cerrarCuenta() {
        this.dialogRef.close({
            event: 'cerrar'
        });
        // this.cuentas.push(
        //     this.cuentaFormGroup()
        // )
    }


    quitarCuenta(index: any) {
        // this.cuentas.at(index).get('tipoCuenta').setValue(null)
        const create = this.cuentas.at(index).get('create')!.value
        console.log(this.cuentas.at(index).get('create')!.value);

        if (create) {
            this.cuentas.removeAt(index);
        } else {
            //llamada al api de delete
            const id = this.cuentas.at(index).get('idBancoCuentaPartner')!.value
            this.proveedorService.deleteBancoCuentaPartner(id).subscribe((resp: any) => {
                if (resp) {
                    if (resp['codigo'] == 0) {
                        this.cuentas.removeAt(index);
                        this.toastr.add({ severity: 'success', summary: 'Eliminacion exitosa', detail: 'Se elimino la cuenta del proveedor' });
                    } else {
                        this.toastr.add({ severity: 'error', summary: 'Error quitarCuenta()', detail: `No se elimino la cuenta del proveedor` });
                    }
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Error quitarCuenta()', detail: `Error no controlado` });
            })
                }     
        
    }

    saveCuenta(index: any) {
        const usuario = JSON.parse(localStorage.getItem('userABA')!);
        const create = this.cuentas.at(index).get('create')!.value
        console.log(this.cuentas.at(index).get('create')!.value);
        if (create) {
            //create save
            let cuenta = {
                idBanco: this.cuentas.at(index).get('banco')!.value.idBanco,
                idPartner: this.idProveedor,
                indActivo: "1",
                moneda: +this.cuentas.at(index).get('tipoMoneda')!.value.id,
                nroCuenta: this.cuentas.at(index).get('numCuenta')!.value,
                tipoCuenta: this.cuentas.at(index).get('tipoCuenta')!.value.id,
                usuarioRegistro: usuario.email
            };
            this.proveedorService.postRegistrarBancoCuentaPartner(cuenta).subscribe((resp: any) => {
                console.log(resp);
                if (resp) {
                    if (resp['codigo'] == 0) {
                        this.toastr.add({ severity: 'success', summary: 'Registro exitosa', detail: 'Se registro la cuenta al proveedor' });
                        
                        this.cuentas.at(index).get('create')!.setValue(false);
                        this.cuentas.at(index).get('idBancoCuentaPartner')!.setValue(resp.data.idBancoCuentaPartner);
                    } else {
                        this.toastr.add({ severity: 'error', summary: 'Error saveCuenta()', detail: `No se pudo registrar la cuenta` });
                    }
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Error saveCuenta()', detail: `No se pudo registrar la cuenta` });
            })

        } else {
           
            let cuenta = {
                idBanco: this.cuentas.at(index).get('banco')!.value.idBanco,
                idBancoCuentaPartner: this.cuentas.at(index).get('idBancoCuentaPartner')!.value,
                idPartner: this.idProveedor,
                indActivo: "1",
                moneda: +this.cuentas.at(index).get('tipoMoneda')!.value.id,
                nroCuenta: this.cuentas.at(index).get('numCuenta')!.value,
                tipoCuenta: this.cuentas.at(index).get('tipoCuenta')!.value.id,
                usuarioActualizacion: usuario.email
            };
            this.proveedorService.putActualizarBancoCuentaPartner(cuenta).subscribe((resp: any) => {
                if (resp) {
                    if (resp['codigo'] == 0) {
                        this.toastr.add({ severity: 'success', summary: 'Registro exitoso', detail: 'Se actualizo la cuenta al proveedor' });
                    } else {
                        this.toastr.add({ severity: 'error', summary: 'Error saveCuenta()', detail: `No se pudo registrar la cuenta` });
                    }
                }
            }, (_error) => {
                this.toastr.add({ severity: 'error', summary: 'Error saveCuenta()', detail: `No se pudo registrar la cuenta` });
            })
        }
    }



    getBancos() {     
        this.bancoService.getObtenerBancos().subscribe((resp: any) => {
            if (resp) {
                if (resp['codigo'] == 0) {
                    this.banco = resp.data;
                    this.commonService.getMultipleCombosPromise([
                        'TIPO_MONEDA_TRAMA'
                    ]).then((respMoneda: any) => {
                        if (respMoneda[0]['data']) {
                            const tiposMonedas: any[] = respMoneda[0]['data'];
                            this.tipoMoneda = tiposMonedas.map(moneda => {
                                return {
                                    id: moneda.valNumEntero,
                                    descripcion: moneda.valCadCorto
                                }
                            })
                            this.getCuentasProveedor();
                        }
                    })
                } else {
                    this.toastr.add({ severity: 'error', summary: 'Error getBancos()', detail: `No se pudo obtener los bancos` });
                }
            }
        }, (_error) => {
            this.toastr.add({ severity: 'error', summary: 'Error getBancos()', detail: `No se pudo obtener los bancos` });
        })
    }


    getCuentasProveedor() {
        this.proveedorService.getBancoCuentaProveedor(this.idProveedor).subscribe((resp: any) => {
            if (resp) {
                if (resp['codigo'] == 0) {
                    this.datosCuentaProveedor = resp.data;
                    this.datosCuentaProveedor.forEach(item => {
                        const banco = this.banco.find((e: any) => e.idBanco == item.idBanco)
                        const tipoCuenta = this.tipoCuenta.find((e: any) => e.id == item.tipoCuenta)
                        const tipoMoneda = this.tipoMoneda.find((e: any) => e.id == +item.moneda)
                        this.cuentas.push(this.cuentaExistFormGroup(banco, tipoCuenta, item.nroCuenta, tipoMoneda, item.idBancoCuentaPartner))
                    })
                }
            }
        });
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

    changeModelBanco(event: any, type: any, index: any) {
        if (event) {
            this.cuentas.at(index).get('tipoCuenta')!.setValue(null)
          
        }
    }

    changeModelTipoCuenta(event: any, type: any, index: any) {
        console.log(type, ' ', event, ' ', index, ' ', 'type,event,index');

        this.cuentas.at(index).get('tipoMoneda')!.setValue(null);
        this.cuentas.at(index).get('numCuenta')!.setValue(null);
        
        
    }
    changeModelTipoMoneda(event: any, type: any, index: any) {
        this.cuentas.at(index).get('numCuenta')!.setValue(null);
    }

    requireMatch(control: FormControl): ValidationErrors | null {
        const selection: any = control.value;
        if (typeof selection === 'string') {
            return { requireMatch: true };
        }
        return null;
    }
}