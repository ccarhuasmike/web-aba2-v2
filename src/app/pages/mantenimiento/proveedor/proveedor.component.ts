import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ProveedorService } from "./proveedor.service";
import { EditCuentasProveedorComponent } from "./modals/edit-cuentas-proveedor/edit-cuentas-proveedor.component";
import { TYPE_PARTNER } from "@/layout/Utils/constants/aba.constants";
import { CommonModule, DatePipe } from "@angular/common";
import { MessageService, ConfirmationService, MenuItem } from "primeng/api";
import { AutoCompleteModule } from "primeng/autocomplete";
import { Breadcrumb } from "primeng/breadcrumb";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DatePickerModule } from "primeng/datepicker";
import { DividerModule } from "primeng/divider";
import { DialogService } from "primeng/dynamicdialog";
import { FileUploadModule } from "primeng/fileupload";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { MenuModule } from "primeng/menu";
import { MessageModule } from "primeng/message";
import { TableModule } from "primeng/table";
import { TabsModule } from "primeng/tabs";
import { ToastModule } from "primeng/toast";
import { TooltipModule } from "primeng/tooltip";
import { CommonService } from "@/pages/service/commonService";
import { Router } from "@angular/router";
import { SelectModule } from "primeng/select";
import { InputGroupModule } from "primeng/inputgroup";
import { AddProveedorComponent } from "./add-proveedor/add-proveedor.component";
import { EditProveedorComponent } from "./edit-proveedor/edit-proveedor.component";

@Component({
    selector: 'app-proveedor',
    templateUrl: './proveedor.component.html',
    styleUrls: ['./proveedor.component.scss'],
    imports: [InputGroupModule, SelectModule, Breadcrumb, ConfirmDialogModule, TooltipModule, TabsModule, MenuModule, DividerModule, InputNumberModule, DatePickerModule, TableModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [DatePipe, MessageService, DialogService, ConfirmationService],
    encapsulation: ViewEncapsulation.None
})
export class ProveedorComponent implements OnInit {
    items: MenuItem[] = [{ label: 'Mantenimiento', routerLink: '    /proveedor' }, { label: 'Consulta Proveedor' }];
    home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
    mostrarFiltro = false;
    formBusqueda!: FormGroup;
    tipoDocumento: any = '';
    nroDocumento: any = '';
    nroCaracter: number = 0;
    documentos: any[] = [];
    proveedores: any[] = [];
    tipoProveedor: any[] = TYPE_PARTNER;
    constructor(
        private readonly fb: FormBuilder,
        private readonly commonService: CommonService,
        private readonly proveedorService: ProveedorService,
        private readonly toastr: MessageService,
        private readonly dialog: DialogService,
        private readonly router: Router
    ) {
        this.createForm();
    }

    ngOnInit(): void {
        this.getCombos();
        this.searchProveedor();
    }

    getCombos() {
        this.commonService.getMultipleCombosPromiseCliente(['documentos/tipos'])
            .then((resp: any) => {
                this.documentos = resp[0]['data']['content'].map((item: any) => {
                    return {
                        id: item['codigo'],
                        descripcion: item['nombre']
                    }
                });
            })
    }

    createForm() {
        this.formBusqueda = this.fb.group({
            tipoDocumento: new FormControl(this.tipoDocumento, [Validators.required]),
            nroDocumento: new FormControl(this.nroDocumento, [Validators.required])
        });
    }

    changeModelTipoDocumento(event: any) {
        if (event == 1) {
            this.nroCaracter = 8;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.required, Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter)])
        } else if (event == 2) {
            this.nroCaracter = 9;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.required, Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter)])
        } else if (event == 3) {
            this.nroCaracter = 11;
            this.formBusqueda.get('nroDocumento')!.setValidators([Validators.required, Validators.minLength(this.nroCaracter), Validators.maxLength(this.nroCaracter)])
        } else {
            this.nroCaracter = 0;
            this.formBusqueda.get('nroDocumento')!.clearValidators();
        }
        this.formBusqueda.get('nroDocumento')!.updateValueAndValidity();
    }

    searchProveedor() {
        const tipoDoc = this.formBusqueda.get('tipoDocumento')!.value;
        const numDoc = this.formBusqueda.get('nroDocumento')!.value;


        this.proveedorService.getObtenerProveedor(numDoc, tipoDoc).subscribe((resp: any) => {
            if (resp?.['codigo'] == 0) {
                this.proveedores = resp.data;
                this.proveedores.forEach((item: any) => {
                    const tipoPartner = this.tipoProveedor.find(e => e.id == item.tipoPartner)
                    item['tipoPartnerDesc'] = tipoPartner.descripcion;
                })
            } else {
                this.toastr.add({ severity: 'error', summary: 'Error searchProveedor()', detail: 'No se pudo obtener al proveedor' });
            }
        })

    }

    menuItems: any[] = [];
    onButtonClick(event: Event, rowData: any, menu: any) {
        this.menuItems = this.getMenuItems(rowData);
        menu.toggle(event);
    }
    // ✅ Este método devuelve el menú según la fila + rol
    getMenuItems(rowData: any, menu?: any): MenuItem[] {
        return [
            this.createMenuItemWithMenuClose(
                'Editar',
                'pi pi-pencil',
                () => this.openDialogEditCuentas(rowData),
                menu
            ),
            this.createMenuItem(
                'Editar Info',
                'pi pi-pencil',
                () => this.openDialogEditInfo(rowData)
            )
        ];
    }

    private createMenuItem(
        label: string,
        icon: string,
        action: () => void
    ): MenuItem {
        return {
            label,
            icon,
            command: () => this.executeAction(action)
        };
    }

    private createMenuItemWithMenuClose(
        label: string,
        icon: string,
        action: () => void,
        menu?: any
    ): MenuItem {
        return {
            label,
            icon,
            command: () => this.executeActionAndCloseMenu(action, menu)
        };
    }
    private executeAction(action: () => void): void {
        action();
    }
    private executeActionAndCloseMenu(action: () => void, menu?: any): void {
        setTimeout(() => {
            action();
            menu?.hide();
        }, 5);
    }
    openDialogCrearProveedor() {

        this.dialog.open(AddProveedorComponent, {
            header: 'CREAR Proveedor',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            data: null,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            }
        });
    }

    openDialogEditCuentas(data: any) {

        this.dialog.open(EditCuentasProveedorComponent, {
            header: 'ACTUALIZAR CUENTAS',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            data: data,
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            }
        });

    }
    openDialogEditInfo(rowData: any) {
        this.dialog.open(EditProveedorComponent, {
            header: 'Editando Proveedor',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            data: {
                tipo: rowData.tipoDocIdentidad,
                doc: rowData.numeroDocIdentidad
            },
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            }
        });

    }
}