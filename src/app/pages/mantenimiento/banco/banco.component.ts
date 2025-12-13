import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { AddBancoComponent } from "./modals/add-banco/add-banco.component";
import { BancoService } from "./banco.service";
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
import { environment } from "src/environments/environment";
import { CommonService } from "@/pages/service/commonService";

@Component({
    selector: 'app-banco',
    templateUrl: './banco.component.html',
    styleUrls: ['./banco.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [ConfirmDialogModule, TooltipModule, TabsModule, MenuModule, DividerModule, InputNumberModule, DatePickerModule, TableModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService, ConfirmationService],
})
export class BancoComponent implements OnInit {

    data: any[] = [];
    rows = 20;
    rowsPerPageOptions = [5, 10, 20];
    loading: boolean = false;

    constructor(
        private readonly dialog: DialogService,
        private readonly toastr: MessageService,
        private readonly bancoService: BancoService,
        private readonly commonService: CommonService,
    ) { }


    ngOnInit(): void {
        this.getBancos();
    }


    menuItems: any[] = [];
    onButtonClick(event: Event, rowData: any, menu: any) {
        this.menuItems = this.getMenuItems(rowData);
        menu.toggle(event);
    }
    getMenuItems(rowData: any, menu?: any): MenuItem[] {
        return [
            this.createMenuItem(
                'Editar',
                'pi pi-pencil',
                () => this.openDialogAdd(rowData),
                menu
            )
        ];
    }

    private createMenuItem(
        label: string,
        icon: string,
        action: () => void,
        menu?: any
    ): MenuItem {
        return {
            label,
            icon,
            command: () => this.executeMenuAction(action, menu)
        };
    }

    private executeMenuAction(action: () => void, menu?: any): void {
        setTimeout(() => {
            action();
            menu?.hide();
        }, 5);
    }

    getBancos() {
        this.loading = true;
        this.data = [];

        const service$ =this.bancoService.getObtenerBancos();

        service$.subscribe({
            next: (resp: any) => {
                this.loading = false;

                if (resp?.codigo !== 0) {
                    this.toastr.add({
                        severity: 'error',
                        summary: 'Error getBancos',
                        detail: resp?.mensaje ?? 'Error inesperado'
                    });
                    return;
                }

                this.data = resp.data ?? [];
            },
            error: () => {
                this.loading = false;
                this.toastr.add({
                    severity: 'error',
                    summary: 'Error getBancos',
                    detail: 'Error en el servicio de obtener bancos'
                });
            }
        });
    }


    openDialogAdd(data: any = null) {
        const dialogRef = this.dialog.open(AddBancoComponent, {
            header: 'Registrar parámetro de débito',
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
        if (dialogRef) {
            dialogRef.onClose.subscribe((res: any) => {
                if (res !== undefined && res !== "") {
                    if (res.data['codigo'] == 0 && res.accion == 'create') {
                        this.toastr.add({ severity: 'success', summary: '', detail: 'Banco registrado' });
                        this.getBancos();
                    } else if (res.data['codigo'] == 0 && res.accion == 'update') {
                        this.toastr.add({ severity: 'success', summary: '', detail: 'Banco actualizado' });
                        this.getBancos();
                    } else {
                        this.toastr.add({ severity: 'error', summary: 'Error openDialogAdd', detail: 'Error al registrar/actualizar el banco' });
                    }
                }
            });
        }
    }
}