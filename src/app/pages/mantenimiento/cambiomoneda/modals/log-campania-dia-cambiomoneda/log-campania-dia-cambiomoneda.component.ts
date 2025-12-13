import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DAYS } from '@/layout/Utils/constants/aba.constants';
import { CommonService } from '@/pages/service/commonService';
import { CambioMonedaService } from '../../cambiomoneda.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-log-campania-dia-cambiomoneda',
  templateUrl: './log-campania-dia-cambiomoneda.component.html',
  styleUrls: ['./log-campania-dia-cambiomoneda.component.scss'],
  imports: [TableModule,InputGroupAddonModule, InputGroupModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
  providers: [MessageService, DialogService, ConfirmationService],
  encapsulation: ViewEncapsulation.None
})
export class LogCampaniaDiaCambiomonedaComponent implements OnInit {
  rows = 10;
  rowsPerPageOptions:any[] = [];
  datosLogs: any[] = [];
  loadingLogs: boolean = false;
  idCambioMonedaCamDia: string = '';
  constructor(
    public datepipe: DatePipe,
    public currencyPipe: CurrencyPipe,
    private readonly toastr: MessageService,
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly commonService: CommonService,
    private readonly cambioMonedaService: CambioMonedaService
  ) {
    this.idCambioMonedaCamDia = config.data.idCambioMonedaCamDia;
  }
  ngOnInit(): void {
    this.getLogs();
  }
  close() {
    this.dialogRef.close({
      event: 'cerrar'
    });
  }
  getLogs() {
    this.loadingLogs = true;
    this.cambioMonedaService.getLogsCampaniasDias(this.idCambioMonedaCamDia).subscribe((resp: any) => {
      this.loadingLogs = false;

      if (resp['codigo'] == 0) {
        this.datosLogs = resp['data'].map((item: any) => {
          const dias: any[] = DAYS
          const dia = dias.find(e => e.id == Number.parseInt(item.codigoDia)).nombre;
          const tipoLogDesc = item.tipoLog === '1' ? 'Registro' : 'Actualización';
          return {
            ...item,
            dia: dia,
            tipoLogDesc: tipoLogDesc,
            fechaRegistroFormat: this.datepipe.transform(item.fechaRegistro, 'dd/MM/yyyy HH:mm:ss')
          }
        });

        this.rowsPerPageOptions = this.commonService.getRowsPerPageOptions(this.rows, this.datosLogs.length);
      } else {
        this.toastr.add({ severity: 'error', summary: 'Error getLogs', detail: resp['mensaje']});        
      }
    }, (_error: any) => {
      this.loadingLogs = false;
      this.toastr.add({ severity: 'error', summary: 'Error getLogs', detail:'Error en el servicio de obtener logs de campañas'});      
    })
  }
}