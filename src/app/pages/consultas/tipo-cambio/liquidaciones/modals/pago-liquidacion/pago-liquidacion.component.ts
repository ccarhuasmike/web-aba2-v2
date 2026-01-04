import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { CommonService } from '@/pages/service/commonService';
import { LiquidacionesService } from '../../liquidaciones.service';
import { ProveedorService } from '@/pages/mantenimiento/proveedor/proveedor.service';
import { TYPE_CUENTA } from '@/layout/Utils/constants/aba.constants';
import { UtilService } from '@/utils/util.services';

@Component({
    selector: 'app-pago-liquidacion',
    templateUrl: './pago-liquidacion.component.html',
    styleUrls: ['./pago-liquidacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AutoCompleteModule, InputTextModule, ButtonModule, TagModule],
    providers: [MessageService]
})
export class PagoLiquidacionComponent implements OnInit {

    formPagoLiquidacion!: FormGroup;
    datosPago: any;
    filteredElement: any[] = [];
    datosProveedor: any;
    datosProveedorPago: any;
    proveedores: any[] = [];
    cuentasProveedor: any[] = [];
    tipoMonedaProveedor: any;
    tipoCuenta: any[] = TYPE_CUENTA;

    constructor(
        public dialogRef: DynamicDialogRef,
        private readonly config: DynamicDialogConfig,
        private readonly proveedorServrice: ProveedorService,
        private readonly commonService: CommonService,
        private readonly liquidacionService: LiquidacionesService,
        private readonly messageService: MessageService
    ) {
        this.datosPago = this.config.data;
        this.createForm();
    }


    getTagClass(codigo: string): string {
  switch (codigo) {
    case '04':
      return 'p-tag-success';   // verde
    case '01':
      return 'p-tag-warning';   // amarillo
    default:
      return 'p-tag-danger';    // rojo
  }
    }

    createForm(): void {
        this.formPagoLiquidacion = new FormGroup({
            banco: new FormControl(),
            tipoCuenta: new FormControl({ value: '', disabled: true }),
            numCuenta: new FormControl({ value: '', disabled: true })
        });
    }

    ngOnInit(): void {
        this.getTipoMoneda();
        this.getInfoProveedor();
    }

    getTipoMoneda(): void {
        this.commonService.getMultipleCombosPromise([
            'TIPO_MONEDA_TRAMA'
        ]).then(resp => {
            const tipoMonedas = resp[0]['data'];
            this.tipoMonedaProveedor = tipoMonedas.find((e: any) => e.valNumEntero == this.datosPago.monedaEnviarPartner);
        });
    }

    getCuentasProveedor(proveedor: any): void {
        const idPartnerCuentas = proveedor.idPartner;
        const monedaEnviar = this.datosPago.monedaEnviarPartner;
        this.proveedorServrice.getBancoCuentaProveedor(idPartnerCuentas).subscribe((resp: any) => {
            if (resp?.['codigo'] === 0) {
                this.cuentasProveedor = (resp.data || []).filter((item: any) => +item.moneda === monedaEnviar);
                this.setCuenta(this.cuentasProveedor);
            }
        });
    }

    setCuenta(cuentasProveedor: any[]): void {
        if (cuentasProveedor.length <= 0) {
            this.messageService.add({ severity: 'warn', summary: 'Proveedor sin cuenta', detail: 'El proveedor no tiene cuenta con el tipo de moneda a enviar' });
            return;
        }

        if (cuentasProveedor.length === 1) {
            this.formPagoLiquidacion.get('banco')?.setValue({
                idBancoCuentaPartner: cuentasProveedor[0].idBancoCuentaPartner,
                nroCuenta: cuentasProveedor[0].nroCuenta,
                tipoCuenta: cuentasProveedor[0].tipoCuenta,
                nombreBanco: cuentasProveedor[0].nombreBanco
            });
            const tipoCuenta = this.tipoCuenta.find(e => e.id === cuentasProveedor[0].tipoCuenta);
            this.formPagoLiquidacion.get('tipoCuenta')?.setValue(tipoCuenta?.descripcion);
            this.formPagoLiquidacion.get('numCuenta')?.setValue(cuentasProveedor[0].nroCuenta);
            this.formPagoLiquidacion.get('banco')?.disable();
        }
    }

    changeModelBanco(event: any): void {
        if (event?.tipoCuenta) {
            const tipoCuenta = this.tipoCuenta.find(e => e.id === event.tipoCuenta);
            this.formPagoLiquidacion.get('tipoCuenta')?.setValue(tipoCuenta?.descripcion);
            this.formPagoLiquidacion.get('numCuenta')?.setValue(event.nroCuenta);
        }
    }

    filterElementBanco(event: any, data: any[]): void {
        this.filteredElement = [];
        const query = event?.query ?? '';
        this.filteredElement = UtilService.filterByField(data, query, 'nombreBanco');
    }

    getInfoProveedor(): void {
        this.proveedorServrice.getObtenerProveedor().subscribe({
            next: (resp: any) => {
                if (resp?.['codigo'] === 0) {
                    this.proveedores = resp.data;
                    this.datosProveedorPago = this.proveedores.find((item: any) => item.idPartnerRelacionado == this.datosPago.idPartner);
                    this.datosProveedor = this.proveedores.find((item: any) => item.idPartner == this.datosPago.idPartner);
                    if (this.datosProveedorPago) {
                        this.getCuentasProveedor(this.datosProveedorPago);
                    } else if (this.datosProveedor) {
                        this.getCuentasProveedor(this.datosProveedor);
                    }
                } else {
                    this.messageService.add({ severity: 'error', summary: 'getInfoProveedor', detail: resp?.mensaje || 'Error no controlado' });
                }
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'getInfoProveedor', detail: 'Error no controlado' });
            }
        });
    }

    pagarLiquidacion(): void {
        const form = this.formPagoLiquidacion.value;
        const usuario = JSON.parse(localStorage.getItem('userABA') || '{}');

        const data = {
            canal: 'ABA2',
            id: this.datosPago.idCambioMonedaLiqDiariaRes,
            idBancoCuentaPartner: form.banco.idBancoCuentaPartner,
            usuario: usuario.email
        };

        this.liquidacionService.postPagoProveedor(data).subscribe({
            next: (resp: any) => {
                if (resp?.['codigo'] === 0) {
                    this.dialogRef.close({
                        data: resp,
                        accion: 'create'
                    });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error pagarLiquidacion', detail: resp?.mensaje || 'Error no controlado' });
                }
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error pagarLiquidacion', detail: 'Error en el servicio de pago' });
            }
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
