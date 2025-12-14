import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TokenizacionService } from '../../tokenizacion.service';
import { CommonService } from '@/pages/service/commonService';
import { ApigeeService } from '@/pages/service/apigee.service';

@Component({
  selector: 'app-log-notificacion',
  templateUrl: './log-notificacion.component.html',
  styleUrls: ['./log-notificacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  providers: [MessageService]
})
export class LogNotificacionComponent implements OnInit {

  accessToken: any;
  digitalCardId = '';
  datosNotificaciones: any[] = [];
  loadingNotificaciones = false;
  datosOtps: any[] = [];
  loadingOtps = false;
  rows = 10;
  rowsPerPageOptions: number[] = [];

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly messageService: MessageService,
    private readonly commonService: CommonService,
    private readonly tokenizacionService: TokenizacionService,
    private readonly apigeeService: ApigeeService
  ) {
    this.digitalCardId = config.data?.digitalCardId;
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.postAuthApiGee();
      await this.getNotificaciones();
    } catch {
      // errores ya notificados
    }
  }

  private postAuthApiGee(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const currentTime = Date.now();
      const storedToken = localStorage.getItem('accessTokenTarOh');
      this.accessToken = storedToken ? JSON.parse(storedToken) : null;

      if (!this.accessToken?.expires_in || currentTime > Number(this.accessToken.expires_in)) {
        this.apigeeService.postAccessTokenTarjetaOh().subscribe({
          next: (response: any) => {
            const expiresIn = Number(response.issued_at) + Number(response.expires_in * 1000);
            this.accessToken = { ...response, expires_in: expiresIn };
            localStorage.setItem('accessTokenTarOh', JSON.stringify(this.accessToken));
            resolve(true);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error postAuthApiGee',
              detail: 'Error en el servicio de autenticacion ApiGee'
            });
            reject();
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  private getNotificaciones(): Promise<boolean> {
    this.loadingNotificaciones = true;
    return new Promise((resolve, reject) => {
      this.tokenizacionService.getNotificacionPorDigitalCardId(
        this.accessToken.access_token,
        this.digitalCardId
      ).subscribe({
        next: (resp: any) => {
          this.loadingNotificaciones = false;
          if (resp?.codigo === 0) {
            this.datosNotificaciones = resp.data ?? [];
            this.rowsPerPageOptions = this.commonService.getRowsPerPageOptions(this.rows, this.datosNotificaciones.length);
            resolve(true);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error getNotificaciones',
              detail: resp?.mensaje || 'Error inesperado'
            });
            reject();
          }
        },
        error: () => {
          this.loadingNotificaciones = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error getNotificaciones',
            detail: 'Error en el servicio de obtener notificaciones'
          });
          reject();
        }
      });
    });
  }

  async getOtps(event: any): Promise<void> {
    this.datosOtps = [];
    const correlationId = event.data?.correlationId;

    if (!correlationId) {
      return;
    }

    this.loadingOtps = true;
    try {
      await this.postAuthApiGee();
    } catch {
      this.loadingOtps = false;
      return;
    }

    this.tokenizacionService.getOtpPorCorrelationId(
      this.accessToken.access_token,
      correlationId
    ).subscribe({
      next: (resp: any) => {
        this.loadingOtps = false;
        if (resp?.codigo === 0 && resp.data) {
          this.datosOtps = [resp.data];
        } else if (resp?.codigo !== 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error getOtps',
            detail: resp?.mensaje || 'Error inesperado'
          });
        }
      },
      error: () => {
        this.loadingOtps = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error getOtps',
          detail: 'Error en el servicio de obtener otps'
        });
      }
    });
  }

  cerrarModal(): void {
    this.dialogRef.close();
  }
}
