import { Component, OnInit } from "@angular/core";
import { ParametroTipoCambioService } from "./parametro-tipo-cambio.service";
import { Router } from "@angular/router";
import { CommonService } from "@/pages/service/commonService";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MessageService, ConfirmationService, MenuItem } from "primeng/api";
import { AutoCompleteModule } from "primeng/autocomplete";
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
import { ParametroDebitoEditComponent } from "../parametro-debito/parametro-debito-edit/parametro-debito-edit.component";
import { ParametroTipoCambioAddComponent } from "./parametro-tipo-cambio-add/parametro-tipo-cambio-add.component";

@Component({
    selector: 'app-parametro-tipo-cambio',
    templateUrl: './parametro-tipo-cambio.component.html',
    styleUrls: ['./parametro-tipo-cambio.component.scss'],
    standalone: true,
    imports: [ConfirmDialogModule, TooltipModule, TabsModule, MenuModule, DividerModule, InputNumberModule, DatePickerModule, TableModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService, ConfirmationService],
})
export class ParametroTipoCambioComponent implements OnInit {
    data: any[] = [];
    rows = 10;
    rowsPerPageOptions: any[] = [];
    loading: boolean = false;

    constructor(
        private readonly parametroTipoCambioService: ParametroTipoCambioService,
        private readonly toastr: MessageService,
        private readonly router: Router,
        private readonly commonService: CommonService,
        private readonly dialog: DialogService,
        private readonly confirmationService: ConfirmationService,
    ) { }

    ngOnInit() {
        this.getParametros();
    }
    goToAddParametro() {
        this.dialog.open(ParametroTipoCambioAddComponent, {
            header: 'Registrar parámetro de débito',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            // data: {
            //     codParametro: parametro.codParametro,
            // }
        });
    }
    getParametros() {
        this.parametroTipoCambioService.getParametros().subscribe((resp: any) => {
            if (resp) {
                if (resp['codigo'] == 0) {
                    this.data = resp.data;
                    this.data.sort((a, b) => a.nomTabla.localeCompare(b.nomTabla));

                    this.rowsPerPageOptions = this.commonService.getRowsPerPageOptions(this.rows, this.data.length);
                } else {
                    this.toastr.add({ severity: 'warn', summary: 'Error getParametros()', detail: resp.mensaje });
                }
            }
        }, (_error) => {
            this.toastr.add({ severity: 'warn', summary: 'Error getParametros()', detail: 'Error en el servicio de obtener parametros' });
        })
    }

    menuItems: any[] = [];
    onButtonClick(event: Event, rowData: any, menu: any) {
        this.menuItems = this.getMenuItems(rowData);
        menu.toggle(event);
    }
    getMenuItems(rowData: any, menu?: any): MenuItem[] {
        return [
            this.buildMenuItem(
                'Editar',
                'pi pi-pencil',
                () => this.goToEditParametro(rowData),
                menu
            ),
            this.buildMenuItem(
                'Eliminar',
                'pi pi-ban',
                () => this.deleteParametro(rowData)
            )
        ];
    }

    private buildMenuItem(
        label: string,
        icon: string,
        action: () => void,
        menu?: any
    ): MenuItem {
        return {
            label,
            icon,
            command: () => this.executeCommand(action, menu)
        };
    }

    private executeCommand(action: () => void, menu?: any): void {
        if (menu) {
            setTimeout(() => {
                action();
                menu.hide();
            }, 5);
        } else {
            action();
        }
    }


    deleteParametro(parametro: any) {

        this.confirmationService.confirm({
            header: 'Eliminar parámetro',
            message: '¿Estás seguro de querer realizar esta acción?',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Aceptar',
            },
            accept: () => {
                this.parametroTipoCambioService.deleteParametro(parametro.codParametro).subscribe(
                    (res: any) => {
                        if (res['codigo'] == 0) {
                            const index = this.data.findIndex((d: any) => d.codParametro === parametro.codParametro);
                            this.data.splice(index, 1);
                            this.toastr.add({ severity: 'success', summary: '', detail: 'Parámetro eliminado' });
                        } else {
                            this.toastr.add({ severity: 'error', summary: 'Error deleteParametro', detail: 'Error en el servicio de inactivar parámetro' });
                        }
                    }
                )
            },
            reject: () => { }
        });
    }

    goToEditParametro(parametro: any) {
        this.dialog.open(ParametroDebitoEditComponent, {
            header: 'Editando parámetro de débito',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            },
            data: {
                codParametro: parametro.codParametro,
            }
        });
    }
}