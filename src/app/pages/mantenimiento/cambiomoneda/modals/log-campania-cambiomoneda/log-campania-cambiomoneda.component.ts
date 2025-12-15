import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CAMPAIGN_TYPES, CAMPAIGN_VALIDATION_TYPES } from '@/layout/Utils/constants/aba.constants';
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
  selector: 'app-log-campania-cambiomoneda',
  templateUrl: './log-campania-cambiomoneda.component.html',
  styleUrls: ['./log-campania-cambiomoneda.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [TableModule, InputGroupAddonModule, InputGroupModule, MessageModule, ToastModule, ButtonModule, FileUploadModule, ReactiveFormsModule, CommonModule, InputTextModule, AutoCompleteModule],
  providers: [MessageService, DialogService, ConfirmationService],
})
export class LogCampaniaCambiomonedaComponent implements OnInit {

  rows = 10;
  rowsPerPageOptions: any[] = [];
  estadosTipoCambio: any[] = [];
  datosLogs: any[] = [];
  loadingLogs: boolean = false;
  idCambioMonedaCampana: string = '';

  constructor(
    public datepipe: DatePipe,
    public currencyPipe: CurrencyPipe,
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly toastr: MessageService,
    private readonly commonService: CommonService,
    private readonly cambioMonedaService: CambioMonedaService
  ) {
    this.idCambioMonedaCampana = config.data.idCambioMonedaCampana;
  }

  ngOnInit(): void {
    this.getEstadosTipoCambio();
    this.getLogs();
  }

  getEstadosTipoCambio() {
    this.commonService.getEstadosTipoCambio().subscribe((resp: any) => {
      this.estadosTipoCambio = resp['data'];
    }, (_error: any) => {
      this.toastr.add({ severity: 'error', summary: 'Error getEstadosTipoCambio', detail: 'Error en el servicio de obtener estados tipo de cambio' });
    })
  }
  close() {
    this.dialogRef.close({
      event: 'cerrar'
    });
  }

  private mapLogItem(item: any) {
    const tipoLogDesc = item.tipoLog === '1' ? 'Registro' : 'Actualización';
    const tipoCampanaDesc = CAMPAIGN_TYPES.find(e => e.id == item.tipoCampana)?.nombre;
    const tipoValidacionDesc = CAMPAIGN_VALIDATION_TYPES.find(e => e.id == item.tipoValidacion)?.nombre;
    const estadoDesc = this.estadosTipoCambio.find(e => e.idCambioMonedaEstado == item.idCambioMonedaEstado)?.descripcionCorta;

    const format = (value: any) =>
      this.currencyPipe.transform(value || 0, ' ', 'symbol', '1.2-2');

    return {
      ...item,
      estadoDesc,
      tipoLogDesc,
      tipoCampanaDesc,
      tipoValidacionDesc,
      tipoCambioCompraOhFormat: format(item.tipoCambioCompraOh),
      tipoCambioVentaOhFormat: format(item.tipoCambioVentaOh),
      tasaCompraOhFormat: format(item.tasaCompraOh),
      tasaVentaOhFormat: format(item.tasaVentaOh),
      montoValidacionFormat: format(item.montoValidacion),
      fechaInicioFormat: this.datepipe.transform(item.fechaInicio, 'dd/MM/yyyy HH:mm:ss'),
      fechaFinFormat: this.datepipe.transform(item.fechaFin, 'dd/MM/yyyy HH:mm:ss'),
      fechaRegistroFormat: this.datepipe.transform(item.fechaRegistro, 'dd/MM/yyyy HH:mm:ss'),
      fechaHoraAprobacionFormat: this.datepipe.transform(item.fechaHoraAprobacion, 'dd/MM/yyyy HH:mm:ss'),
      fechaHoraVencimientoFormat: this.datepipe.transform(item.fechaHoraVencimiento, 'dd/MM/yyyy HH:mm:ss')
    };
  }

  private procesarLogs(resp: any) {
    if (resp?.codigo !== 0) return;

    this.datosLogs = resp.data.map((item: any) => this.mapLogItem(item));
    this.rowsPerPageOptions = this.commonService.getRowsPerPageOptions(
      this.rows,
      this.datosLogs.length
    );
  }

  getLogs() {
    this.loadingLogs = true;
    this.cambioMonedaService.getLogsCampanias(this.idCambioMonedaCampana)
      .subscribe(
        resp => {
          this.loadingLogs = false;
          this.procesarLogs(resp);
        },
        () => {
          this.loadingLogs = false;
          this.toastr.add({
            severity: 'error',
            summary: 'Error getLogs',
            detail: 'Error en el servicio de obtener logs de campañas'
          });
        }
      );
  }
}