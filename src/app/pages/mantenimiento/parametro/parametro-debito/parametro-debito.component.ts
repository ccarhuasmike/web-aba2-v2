import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ParametroDebitoService } from './parametro-debito.service';
import { ToastModule } from 'primeng/toast';
import { CommonService } from '@/pages/service/commonService';
import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { ParametroDebitoAddComponent } from './parametro-debito-add/parametro-debito-add.component';
import { ParametroDebitoEditComponent } from './parametro-debito-edit/parametro-debito-edit.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { environment } from 'src/environments/environment';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-parametro-debito',
    templateUrl: './parametro-debito.component.html',
    styleUrls: ['./parametro-debito.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [ConfirmDialogModule, TooltipModule, TabsModule, MenuModule, DividerModule, InputNumberModule, DatePickerModule, TableModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
    providers: [MessageService, DialogService, ConfirmationService],
})
export class ParametroDebitoComponent implements OnInit {
    data: any[] = [];
    rows = 10;
    rowsPerPageOptions: any[] = [];
    loading: boolean = false;
    constructor(
        private readonly dialog: DialogService,
        private readonly parametroDebitoService: ParametroDebitoService,
        private readonly commonService: CommonService,
        private readonly toastr: MessageService,
        private readonly router: Router,
        private readonly confirmationService: ConfirmationService,
    ) { }

    ngOnInit(): void {
        this.getParametros();
    }

    getParametros() {
        this.loading = true;



        this.parametroDebitoService.getParametros().pipe(
            finalize(() => {
                this.loading = false;
            })
        ).subscribe((resp: any) => {
            if (resp['codigo'] == 0) {
                this.data = resp['data'];
                this.data.sort((a, b) => a.nomTabla.localeCompare(b.nomTabla));
                this.rowsPerPageOptions = this.commonService.getRowsPerPageOptions(this.rows, this.data.length);
            } else if (resp['codigo'] == -1) {
                this.toastr.add({ severity: 'error', summary: 'Error getParametros', detail: resp['mensaje'] });
            }
        }, (_error) => {
            this.toastr.add({ severity: 'error', summary: 'Error getParametros', detail: 'Error en el servicio de obtener parámetros' });
        })

    }
    menuItems: any[] = [];
    onButtonClick(event: Event, rowData: any, menu: any) {
        this.menuItems = this.getMenuItems(rowData);
        menu.toggle(event);
    }
    getMenuItems(rowData: any, menu?: any): MenuItem[] {
        return [
            this.createMenuItemWithClose(
                'Editar',
                'pi pi-pencil',
                () => this.goToEditParametro(rowData),
                menu
            ),
            this.createMenuItem(
                'Eliminar',
                'pi pi-ban',
                () => this.deleteParametro(rowData)
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

    private createMenuItemWithClose(
        label: string,
        icon: string,
        action: () => void,
        menu?: any
    ): MenuItem {
        return {
            label,
            icon,
            command: () => this.executeActionAndClose(action, menu)
        };
    }

    private executeAction(action: () => void): void {
        action();
    }

    private executeActionAndClose(action: () => void, menu?: any): void {
        setTimeout(() => {
            action();
            menu?.hide();
        }, 5);
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
                this.parametroDebitoService.deleteParametro(parametro.codParametro).subscribe(
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

    goToAddParametro() {
        this.dialog.open(ParametroDebitoAddComponent, {
            header: 'Registrar parámetro de débito',
            width: '50vw',
            modal: true,
            styleClass: 'header-modal',
            dismissableMask: true,  // permite cerrar al hacer click fuera
            breakpoints: {
                '960px': '75vw',
                '640px': '90vw'
            }
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