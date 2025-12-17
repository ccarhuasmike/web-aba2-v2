import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { Customer, CustomerService, Representative } from '../service/customer.service';
import { Product, ProductService } from '../service/product.service';
import { ObjectUtils } from "primeng/utils";
import { CommonService } from '../service/commonService';
import { DatetzPipe } from '@/layout/Utils/pipes/datetz.pipe';
import { Cliente } from '@/layout/models/cliente';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { DOCUMENT } from '@/layout/Utils/constants/aba.constants';
import { SecurityEncryptedService } from '@/layout/service/SecurityEncryptedService';
import { Router } from '@angular/router';
interface ExpandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-cuentas',
    standalone: true,
    templateUrl: './cuentas.component.html',
    styleUrls: ['./cuentas.component.css'],
    imports: [
        TableModule,
        MultiSelectModule,
        SelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        SliderModule,
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        MessageModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        IconFieldModule
    ],
    providers: [ConfirmationService, MessageService, CustomerService, ProductService, DatetzPipe]
})
export class CuentasComponent implements OnInit {
    mostrarFiltro = false;
    datosCliente: Cliente = new Cliente();
    datosCuentas: any[] = [];
    documentos: any[] = [];
    tipoBusqueda: any[] = [
        { id: 0, field: 'Documento Identidad' },
        //{ id: 1, field: 'Número de Cuenta' },
        // { id: 2, field: 'Nombres y Apellidos' },
        { id: 3, field: 'Número Tarjeta' }
    ];
    customers1: Customer[] = [];
    selectedCustomers1: Customer[] = [];
    selectedCustomer: Customer = {};
    representatives: Representative[] = [];
    statuses: any[] = [];
    products: Product[] = [];
    rowGroupMetadata: any;
    expandedRows: ExpandedRows = {};
    activityValues: number[] = [0, 100];

    isExpanded: boolean = false;

    balanceFrozen: boolean = false;

    loading: boolean = false;

    @ViewChild('filter') filter!: ElementRef;

    formBusqueda!: FormGroup;
    nroCaracter: number = 0;

    tipoFiltro: any = null;
    tipoDocumento: any = '';
    nroDocumento: any = '';
    nombreApellido: any = '';
    nroTarjeta: any = '';
    nroCuenta: any = '';
    uidCliente: any = '';


    cols: any[] = [
        { field: 'producto', header: 'Producto', align: 'left' },
        { field: 'nombresApellidos', header: 'Nombre titular', align: 'left' },
        { field: 'numeroCuenta', header: 'Nro de cuenta', align: 'center' },
        { field: 'motivoBloqueo', header: 'Estado', align: 'center' },
        { field: 'fechaApertura', header: 'Fecha apertura', align: 'center' },
        { field: 'fechaBaja', header: 'Fecha Baja', align: 'center' },
        { field: 'desCodTipoDoc', header: 'Tipo documento', align: 'center' },
        { field: 'numDocIdentidad', header: 'Documento identidad', align: 'center' }
    ];
    constructor(
        private readonly router: Router,
        private readonly toastr: MessageService,
        private readonly customerService: CustomerService,
        private readonly productService: ProductService,
        private readonly commonService: CommonService,
        private readonly securityEncryptedService: SecurityEncryptedService,
        private readonly fb: FormBuilder
    ) {
    }

    createForm() {
        this.formBusqueda = this.fb.group({
            tipoFiltro: new FormControl(this.tipoFiltro, [Validators.required]),
            tipoDocumento: new FormControl(this.tipoDocumento),
            nroDocumento: new FormControl(this.nroDocumento),
            nroCuenta: new FormControl(this.nroCuenta),
            nombreApellido: new FormControl(this.nombreApellido),
            nroTarjeta: new FormControl(this.nroTarjeta)
        });
    }
    changeModelTipoDocumento(event: any) {
        if (event.value == 1) {
            this.nroCaracter = 8;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required])
        } else if (event.value == 2) {
            this.nroCaracter = 9;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required])
        } else if (event.value == 3) {
            this.nroCaracter = 11;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter), Validators.required])
        } else {
            this.nroCaracter = 0;
            this.formBusqueda.get('nroDocumento')!.clearValidators();
        }
        this.formBusqueda.get('nroDocumento')!.updateValueAndValidity();
    }
    ngOnInit() {
        this.getCombos();
        this.createForm();
    }
    filtro = {
        tipoDoc: null,
        numDoc: ''
    };
    aplicarFiltro(dt: any, op: any) {
        dt.filter(this.filtro.tipoDoc, 'desCodTipoDoc', 'equals');
        dt.filter(this.filtro.numDoc, 'numDocIdentidad', 'contains');
        op.hide(); // cerrar el overlay
    }

    limpiarFiltro(dt: any) {
        this.filtro = { tipoDoc: null, numDoc: '' };
        dt.clear();
    }
    goToAccount(data: any) {

        const uidCuenta = this.securityEncryptedService.encrypt(data.uIdCuenta);
        const uidCliente = this.securityEncryptedService.encrypt(this.uidCliente);

        this.router.navigate(['/cuenta/detalle', {
            cuenta: uidCuenta,
            cliente: uidCliente,
            tipoDoc: this.tipoDocumento,
            numDoc: this.nroDocumento,
            numCuenta: this.nroCuenta,
        }]);
    }
    async buscar(): Promise<void> {
        await this.resetAndLoadData();
    }

    private async resetAndLoadData(): Promise<void> {
        this.datosCliente = new Cliente();
        this.datosCuentas = [];
        await this.getCliente();
        await this.getCuenta();
    }
    getCombos() {
        this.commonService.getMultipleCombosPromiseCliente(['documentos/tipos'])
            .then(resp => {
                this.documentos = resp[0]['data']['content'].filter((item: any) => item['nombre'] !== DOCUMENT.RUC)
                    .map((item: any) => {
                        return {
                            id: item['codigo'],
                            descripcion: item['nombre']
                        }
                    });
            })

    }

    limpiar() {
        this.filtro = { tipoDoc: null, numDoc: '' };
    }


    getCliente(): Promise<any> {
        return new Promise((resolve, reject) => {
            let observable;
            const tipoDocumento = this.formBusqueda.get('tipoDocumento')!.value;
            const numeroDocumento = this.formBusqueda.get('nroDocumento')!.value;
            observable = this.commonService.getCliente(tipoDocumento, numeroDocumento);

            observable.subscribe(
                (resp: any) => {
                    console.log('getCliente()...', resp);
                    this.procesarCliente(resp);
                    resolve(true);
                },
                (_error) => {
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error getCliente',
                        detail: 'Error en el servicio de obtener datos del cliente'
                    });
                }
            );
        });
    }

    private procesarCliente(resp: any): boolean {
        if (resp['codigo'] === 0) {

            this.datosCliente = resp['data'];
            this.uidCliente = resp['data'].uIdCliente;
            return true;

        } else if (resp['codigo'] === -1) {

            this.toastr.add({
                severity: 'error',
                summary: 'Error getCliente',
                detail: resp['mensaje']
            });
            return false;

        } else if (resp['codigo'] === 1) {

            this.toastr.add({
                severity: 'warn',
                summary: 'Error getCliente',
                detail: 'El cliente que se intenta buscar no existe'
            });
            return false;
        }

        return false;
    }

    getCuenta(): Promise<any> {
        this.loading = true;
        return new Promise((resolve, reject) => {

            const observable = this.commonService.getCuenta(this.uidCliente);

            observable.subscribe(
                (resp: any) => {
                    console.log('getCuenta()...', resp);

                    this.procesarCuenta(resp);
                    this.loading = false;
                    resolve(true);
                },
                (_error) => {
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error getCuenta',
                        detail: 'Error en el servicio de obtener datos de la cuenta'
                    });
                    this.loading = false;
                }
            );
        });
    }

    private procesarCuenta(resp: any): boolean {
        if (resp['codigo'] == 0) {
            this.datosCuentas = resp['data'].content;

            let desCodTipoDoc = this.datosCliente.desCodTipoDoc;
            let numDocIdentidad = this.datosCliente.numDocIdentidad;

            // Normalizar longitud de DNI
            if (desCodTipoDoc === 'DNI' && numDocIdentidad.length < 8) {
                numDocIdentidad = numDocIdentidad.padStart(8, '0');
            }

            // Mapear cuentas agregando datos del cliente
            this.datosCuentas = this.datosCuentas.map((row: any) => ({
                ...row,
                nombresApellidos: this.datosCliente.nombresApellidos,
                desCodTipoDoc,
                numDocIdentidad
            }));

            // Filtrar si llega nroCuenta
            if (this.nroCuenta) {
                this.datosCuentas = this.datosCuentas.filter(
                    (row: any) => row.numeroCuenta == this.nroCuenta
                );
            }

            return true;

        } else if (resp['codigo'] == -1) {

            this.toastr.add({
                severity: 'error',
                summary: 'Error getCuenta',
                detail: resp['mensaje']
            });
            return false;
        }

        return false;
    }

    onSort() {
    }

    expandAll() {
        if (ObjectUtils.isEmpty(this.expandedRows)) {
            this.expandedRows = this.products.reduce(
                (acc, p) => {
                    if (p.id) {
                        acc[p.id] = true;
                    }
                    return acc;
                },
                {} as { [key: string]: boolean }
            );
            this.isExpanded = true;
        } else {
            this.collapseAll()
        }

    }

    collapseAll() {
        this.expandedRows = {};
        this.isExpanded = false;
    }

    formatCurrency(value: number) {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    getSeverity(status: string) {
        switch (status) {
            case 'qualified':
            case 'instock':
            case 'INSTOCK':
            case 'DELIVERED':
            case 'delivered':
                return 'success';

            case 'negotiation':
            case 'lowstock':
            case 'LOWSTOCK':
            case 'PENDING':
            case 'pending':
                return 'warn';

            case 'unqualified':
            case 'outofstock':
            case 'OUTOFSTOCK':
            case 'CANCELLED':
            case 'cancelled':
                return 'danger';

            default:
                return 'info';
        }
    }
}
