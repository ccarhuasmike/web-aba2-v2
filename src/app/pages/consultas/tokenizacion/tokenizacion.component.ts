import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { TokenizacionService } from './tokenizacion.service';
import { Tokenizacion } from 'src/app/layout/models/tokenizacion';
import { LogNotificacionComponent } from './tokenizacion-modals/log-notificacion/log-notificacion.component';

@Component({
  selector: 'app-tokenizacion',
  templateUrl: './tokenizacion.component.html',
  styleUrls: ['./tokenizacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DividerModule, TooltipModule],
  providers: [DialogService, MessageService]
})
export class TokenizacionComponent implements OnInit {

  tokenizacion: Tokenizacion = {};
  digitalCardId = '';
  loadingAutorizaciones = false;
  dialogRef?: DynamicDialogRef;

  constructor(
    private readonly dialogService: DialogService,
    private readonly messageService: MessageService,
    private readonly tokenizacionService: TokenizacionService
  ) { }

  ngOnInit(): void {
    this.cleanTokenizacion();
  }

  cleanTokenizacion(): void {
    this.tokenizacion = {
      parentCardId: '',
      digitalCardId: '',
      panSuffix: '',
      state: '',
      type: '',
      schemeCardId: '',
      deviceBindingList: [],
      provisioningTime: '',
      lastReplenishTime: '',
      lastStateChangeTime: '',
      digitalCardRequestorInformation: {
        id: '',
        walletId: '',
        name: '',
        tspId: '',
        originalDigitalCardRequestorId: '',
        recommendation: ''
      },
      deviceInformation: {
        deviceId: '',
        digitalCardStorageType: '',
        manufacturer: '',
        brand: '',
        model: '',
        osVersion: '',
        firmwareVersion: '',
        phoneNumber: '',
        fourLastDigitPhoneNumber: '',
        deviceName: '',
        deviceParentId: '',
        language: '',
        serialNumber: '',
        timeZone: '',
        timeZoneSetting: '',
        simSerialNumber: '',
        IMEI: '',
        networkOperator: '',
        networkType: ''
      }
    };
  }

  openDialogLogNotificacion(): void {
    if (!this.digitalCardId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtro de busqueda',
        detail: 'Se debe ingresar digitalCardId'
      });
      return;
    }
    this.dialogService.open(LogNotificacionComponent, {
      header: 'Logs Notificación',
      width: '50vw',
      modal: true,
      styleClass: 'header-modal',
      dismissableMask: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      data: {
        digitalCardId: this.digitalCardId.trim()
      }
    });
  }

  searchTokenizacion(): void {
    this.loadingAutorizaciones = true;
    this.cleanTokenizacion();

    if (!this.digitalCardId) {
      this.loadingAutorizaciones = false;
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtro de busqueda',
        detail: 'Se debe ingresar digitalCardId'
      });
      return;
    }

    this.tokenizacionService.getTokenizacionPorDigitalCardId(this.digitalCardId).subscribe({
      next: (resp: any) => {
        this.loadingAutorizaciones = false;

        if (resp?.codigo === 0) {
          this.tokenizacion = resp.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error searchTokenizacion',
            detail: resp?.mensaje || 'Error inesperado'
          });
        }
      },
      error: () => {
        this.loadingAutorizaciones = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error searchTokenizacion',
          detail: 'Error en el servicio de obtener datos de la tokenizacion'
        });
      }
    });
  }
}
