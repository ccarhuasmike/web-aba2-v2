import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import moment from 'moment';
import { EditarInfoSolicitudComponent } from './modals/editar-info/editar-info.component';
import { DetalleInfoSolicitudComponent } from './modals/detalle/detalle.component';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { CALENDAR_DETAIL } from '@/layout/Utils/constants/aba.constants';
import { CommonService } from '@/pages/service/commonService';
import { ExcelService } from '@/pages/service/excel.service';
import { SolicitudesAhorrosohService } from './solicitudes-ahorrosoh.service';
import { DialogService } from 'primeng/dynamicdialog';
import { UtilService } from '@/utils/util.services';

@Component({
  selector: 'app-solicitudes-ahorrosoh',
  templateUrl: './solicitudes-ahorrosoh.component.html',
  styleUrls: ['./solicitudes-ahorrosoh.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AccordionModule,
    AutoCompleteModule,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    TableModule,
    TooltipModule,
    DividerModule,
    MenuModule,
  ],
  providers: [MessageService, DialogService, DatePipe],
})
export class SolicitudesAhorrosohComponent implements OnInit {

  searchForm!: FormGroup;
  dataSolicitudes: any[] = [];
  tipoDocumentos: any[] = [];
  tipoMonedas: any[] = [];
  tipoCanales: any[] = [];
  vigenciaSolicitud: number = 0;
  panelOpenState: number | null = 0;
  filteredElementTipoDocumento: any[] = [];
  menuItems: MenuItem[] = [];

  es = CALENDAR_DETAIL
  nroCaracter: number = 0;
  rows = 15;

  cols = [
    { header: '', nomProperty: '' },
    { header: 'Nro. Solicitud', nomProperty: 'nroSolicitud' },
    { header: 'Fecha Hora Registro', nomProperty: 'fechaHoraRegistroConvert' },
    { header: 'Tipo Doc.', nomProperty: 'tipoDoc' },
    { header: 'Número Doc.', nomProperty: 'numeroDoc' },
    { header: '1er Nombre', nomProperty: 'primerNombre' },
    { header: '2do. Nombre', nomProperty: 'segundoNombre' },
    { header: 'Apellido Pat.', nomProperty: 'apellidoPaterno' },
    { header: 'Apellido Mat.', nomProperty: 'apellidoMaterno' },
    { header: 'Celular', nomProperty: 'celular' },
    { header: 'Correo', nomProperty: 'email' },
    { header: 'Estado Solicitud', nomProperty: 'descEstadoSolicitud' },
    { header: 'Usuario Crea.', nomProperty: 'usuarioCreacion' },
    { header: 'Fecha Crea.', nomProperty: 'fechaCreacionConvert' },
    { header: 'Usuario Modi.', nomProperty: 'usuarioModificacion' },
    { header: 'Fecha Modi.', nomProperty: 'fechaModificacionConvert' },
    { header: 'Canal', nomProperty: 'descCanal' },
    { header: 'Tipo Producto', nomProperty: 'tipoProducto' },
    { header: 'Cód. CallCenter', nomProperty: 'codCallCenter' },
  ]

  colsExcel = [
    { header: '', nomProperty: '' },
    { header: 'Nro. Solicitud', nomProperty: 'nroSolicitud' },
    { header: 'Fecha Hora Registro', nomProperty: 'fechaHoraRegistroConvert' },
    { header: 'Tipo Doc.', nomProperty: 'tipoDoc' },
    { header: 'Número Doc.', nomProperty: 'numeroDoc' },
    { header: 'Tratam. Datos Obligatorios', nomProperty: 'flgAceptTratamDatosObligatorio' },
    { header: 'Tratam. Datos Opcionales', nomProperty: 'flgAceptTratamDatosOpcional' },
    { header: '1er Nombre', nomProperty: 'primerNombre' },
    { header: '2do. Nombre', nomProperty: 'segundoNombre' },
    { header: 'Apellido Pat.', nomProperty: 'apellidoPaterno' },
    { header: 'Apellido Mat.', nomProperty: 'apellidoMaterno' },
    { header: 'Sexo', nomProperty: 'sexo' },
    { header: 'Fecha Nac.', nomProperty: 'fechaNacimiento' },
    { header: 'Estado Civil', nomProperty: 'estadoCivil' },
    { header: 'Celular', nomProperty: 'celular' },
    { header: 'Correo', nomProperty: 'email' },
    { header: 'Misma Direc. DNI', nomProperty: 'flgMismaDireccionDni' },
    { header: 'Tipo Vivienda', nomProperty: 'tipoVivienda' },
    { header: 'Departamento', nomProperty: 'departamento' },
    { header: 'Provincia', nomProperty: 'provincia' },
    { header: 'Distrito', nomProperty: 'distrito' },
    { header: 'Dirección', nomProperty: 'direccion' },
    { header: 'Referencia Direc.', nomProperty: 'referenciaDireccion' },
    { header: 'Pep', nomProperty: 'flgPep' },
    { header: 'Tipo Ocupación', nomProperty: 'tipoOcupacion' },
    { header: 'Nombre Empresa', nomProperty: 'nombreEmpresa' },
    { header: 'Nombre Negocio', nomProperty: 'nombreNegocio' },
    { header: 'Fecha Ingr. Laboral', nomProperty: 'fechaIngresoLaboral' },
    { header: 'Cargo Act.', nomProperty: 'cargoActual' },
    { header: 'Ingreso Mens.', nomProperty: 'ingresoMensual' },
    { header: 'Neg. Propio', nomProperty: 'flgNegocioPropio' },
    { header: 'Act. Ocupación', nomProperty: 'actividadOcupacion' },
    { header: 'Giro Neg.', nomProperty: 'giroNegocio' },
    { header: 'Tiene RUC', nomProperty: 'flgRuc' },
    { header: 'RUC', nomProperty: 'ruc' },
    { header: 'Acept. Contrato', nomProperty: 'flgAceptacionContrato' },
    { header: 'Moneda', nomProperty: 'descMoneda' },
    { header: 'Estado', nomProperty: 'descEstado' },
    { header: 'Nro. Paso', nomProperty: 'paso' },
    { header: 'Usuario Crea.', nomProperty: 'usuarioCreacion' },
    { header: 'Fecha Crea.', nomProperty: 'fechaCreacion' },
    { header: 'Usuario Modi.', nomProperty: 'usuarioModificacion' },
    { header: 'Fecha Modi.', nomProperty: 'fechaModificacion' },
    { header: 'Canal', nomProperty: 'descCanal' },
    { header: 'Cód. Agencia', nomProperty: 'codigoAgencia' },
    { header: 'Tipo Producto', nomProperty: 'tipoProducto' },
    { header: 'Cód. CallCenter', nomProperty: 'codCallCenter' },
  ]

  constructor(
    private readonly dialog: DialogService,
    private readonly datePipe: DatePipe,
    private readonly toastr: MessageService,
    private readonly excelService: ExcelService,
    private readonly commonService: CommonService,
    private readonly solicitudesAhorrosohService: SolicitudesAhorrosohService
  ) {
    this.createForm();
  }

  createForm() {
    this.searchForm = new FormGroup({
      rangoFechas: new FormControl(null, [Validators.required]),
      tipoDocumentos: new FormControl(null, [Validators.required]),
      numDocumento: new FormControl(null, [Validators.required])
    })
  }

  ngOnInit() {
    this.getCombos();
  }

  getCombos() {
    const parametros = this.commonService.getParametrosAhorros([
      'TIPO_DOCUMENTO',
      'TIPO_MONEDA_TRAMA',
      'TIPO_CANAL_TRAMA',
      'VIGENCIA_SOLICITUD_CUENTA_GARANTIZADA'
    ]);

    this.tipoDocumentos = (parametros?.['TIPO_DOCUMENTO'] || [])
      .filter((item: any) => item['valCadCorto'] != 'RUC' && item['valCadCorto'] != 'PASAPORTE')
      .map((item: any) => {
        return {
          id: item['valCadCorto'],
          descripcion: item['valCadCorto']
        }
      });

    console.log('TIPO DOCUMENTOS', this.tipoDocumentos);

    this.tipoMonedas = (parametros?.['TIPO_MONEDA_TRAMA'] || [])
      .map((item: any) => {
        return {
          id: item['valNumEntero'],
          descripcion: item['valCadLargo']
        }
      });

    console.log('TIPO MONEDAS', this.tipoMonedas);

    this.tipoCanales = (parametros?.['TIPO_CANAL_TRAMA'] || [])
      .map((item: any) => {
        return {
          id: item['valCadCorto'],
          descripcion: item['valCadLargo']
        }
      });

    console.log('TIPO CANALES', this.tipoCanales);

    this.vigenciaSolicitud = parametros?.['VIGENCIA_SOLICITUD_CUENTA_GARANTIZADA']?.[0]?.valNumEntero || 0;

    console.log('VIGENCIA SOLICITUD', this.vigenciaSolicitud);
  }

  changeModelTipoDocumento(event: any) {
    if (event) {
      if (event.descripcion == 'DNI') {
        this.nroCaracter = 8;
      }

      if (event.descripcion == 'CE') {
        this.nroCaracter = 9;
      }

      if (event.descripcion == 'PASAPORTE') {
        this.nroCaracter = 10;
      }
    }
  }

  filterElementTipoDocumento(event: any, data: any) {
    this.filteredElementTipoDocumento = [];
    const query = event?.query ?? '';
    this.filteredElementTipoDocumento = UtilService.filterByField(data, query, 'descripcion');
  }

  getSolicitudes() {
    const fechaRango = this.searchForm.get('rangoFechas')!.value;
    const tipoDocumento = this.searchForm.get('tipoDocumentos')!.value?.id || '';
    const numDocumento = this.searchForm.get('numDocumento')!.value || '';

    let fini = '';
    let ffin = '';

    if (!fechaRango && !tipoDocumento && !numDocumento) {
      this.toastr.add({
        severity: 'warn',
        summary: 'Validacion',
        detail: 'Debe ingresar al menos un filtro'
      });
    } else {
      if (fechaRango) {
        if (fechaRango.length === 2 && fechaRango[1]) {
          fini = moment(fechaRango[0]).format('YYYY-MM-DD');
          ffin = moment(fechaRango[1]).format('YYYY-MM-DD');
        } else {
          this.toastr.add({
            severity: 'warn',
            summary: 'Validacion',
            detail: 'El rango de fechas debe ser valido'
          });
        }
      }

      if ((tipoDocumento && !numDocumento) || (!tipoDocumento && numDocumento)) {
        this.toastr.add({
          severity: 'warn',
          summary: 'Validacion',
          detail: 'Tipo o numero de documento invalido'
        });
      }
    }

    this.dataSolicitudes = [];

    const request = {
      fechaDesde: fini,
      fechaHasta: ffin,
      tipoDoc: tipoDocumento,
      numeroDoc: numDocumento,
    }

    this.solicitudesAhorrosohService.getReporteSolicitudes(request).subscribe((resp: any) => {
      if (resp?.['codigo'] == 0) {
        this.dataSolicitudes = resp.data.map((item: any) => {
          const tipoMoneda = this.tipoMonedas.find(e => e.id === +item.moneda);
          const descMoneda = tipoMoneda?.descripcion || '';
          const solicitudEstaEnPlazo = this.validarFechaEnPlazo(item.fechaHoraRegistro, this.vigenciaSolicitud)
          const descEstadoSolicitud = (item.nombEstadoSolicitud == 'PENDIENTE') ? ((solicitudEstaEnPlazo) ? item.nombEstadoSolicitud : 'RECHAZADA') : item.nombEstadoSolicitud
          const tipoCanal = this.tipoCanales.find(e => e.id === item.canal);
          const descCanal = tipoCanal?.descripcion || '';
          const fechaHoraRegistroConvert = this.datePipe.transform(item.fechaHoraRegistro, 'dd/MM/yyyy HH:mm:ss');
          const fechaNacimientoConvert = this.datePipe.transform(item.fechaNacimiento, 'dd/MM/yyyy');
          const fechaIngresoLaboralConvert = this.datePipe.transform(item.fechaIngresoLaboral, 'dd/MM/yyyy');
          const fechaCreacionConvert = this.datePipe.transform(item.fechaCreacion, 'dd-MM-yyyy HH:mm:ss');
          const fechaModificacionConvert = this.datePipe.transform(item.fechaModificacion, 'dd-MM-yyyy HH:mm:ss');
          const color = (descEstadoSolicitud == 'APROBADA') ? 'p-tag p-tag-success'
            : ((descEstadoSolicitud == 'PENDIENTE') ? 'p-tag p-tag-warning'
              : ((descEstadoSolicitud == 'RECHAZADA') ? 'p-tag p-tag-danger' : ''));
          const descTipoProducto = (item.tipoProducto == 1) ? 'Ahorros oh'
            : ((item.tipoProducto == 2) ? 'Ahorramas' : '');

          return {
            ...item,
            descMoneda,
            solicitudEstaEnPlazo,
            descEstadoSolicitud,
            color,
            descCanal,
            fechaHoraRegistroConvert,
            fechaNacimientoConvert,
            fechaIngresoLaboralConvert,
            fechaCreacionConvert,
            fechaModificacionConvert,
            descTipoProducto
          }
        })
      } else {
        this.toastr.add({
          severity: 'error',
          summary: 'Error getSolicitudes',
          detail: resp?.['mensaje'] || 'Error inesperado'
        });
      }
    }, (_error) => {
      this.toastr.add({
        severity: 'error',
        summary: 'Error getSolicitudes',
        detail: 'Error en el servicio de obtener solicitudes ahorros oh'
      });
    })
  }

  openDialogActualizarDatos(data: any) {
    const dialogRef = this.dialog.open(EditarInfoSolicitudComponent, {
      width: '1000px',
      data: data
    });

    dialogRef?.onClose.subscribe((resp: any) => {
      if (resp !== undefined) {
        if (resp.resp.codigo == 0) {
          this.toastr.add({
            severity: 'success',
            summary: 'Operacion exitosa',
            detail: 'Actualizacion de datos de solicitud exitosa'
          });
          this.getSolicitudes();
        }
      }
    })
  }

  openDialogDetalle(data: any) {
    this.dialog.open(DetalleInfoSolicitudComponent, {
      width: '1000px',
      data: data
    });
  }

  exportExcel() {
    const date = new Date();
    const excelName = 'Reporte Solicitudes Ahorros Oh' + moment(date).format('DD/MM/YYYY') + '.xlsx';
    const sheetName = 'Datos';
    const datos: any[] = [];
    const header: any[] = [];
    const isCurrency: any[] = [];
    const filterLavel = 'Fecha de Reporte';

    this.colsExcel.forEach((element: any, index: number) => {
      if (index > 0) {
        header.push(element.header);
      }
    });

    this.dataSolicitudes.forEach(x => {
      const list = [
        x.nroSolicitud,
        x.fechaHoraRegistroConvert,
        x.tipoDoc,
        x.numeroDoc,
        x.flgAceptTratamDatosObligatorio,
        x.flgAceptTratamDatosOpcional,
        x.primerNombre,
        x.segundoNombre,
        x.apellidoPaterno,
        x.apellidoMaterno,
        x.sexo,
        x.fechaNacimientoConvert,
        x.estadoCivil,
        x.celular,
        x.email,
        x.flgMismaDireccionDni,
        x.tipoVivienda,
        x.departamento,
        x.provincia,
        x.distrito,
        x.direccion,
        x.referenciaDireccion,
        x.flgPep,
        x.tipoOcupacion,
        x.nombreEmpresa,
        x.nombreNegocio,
        x.fechaIngresoLaboralConvert,
        x.cargoActual,
        x.ingresoMensual,
        x.flgNegocioPropio,
        x.actividadOcupacion,
        x.giroNegocio,
        x.flgRuc,
        x.ruc,
        x.flgAceptacionContrato,
        x.descMoneda,
        x.descEstadoSolicitud,
        x.paso,
        x.usuarioCreacion,
        x.fechaCreacionConvert,
        x.usuarioModificacion,
        x.fechaModificacionConvert,
        x.descCanal,
        x.codigoAgencia,
        x.descTipoProducto,
        x.codCallCenter,
      ];
      datos.push(list);
    });
    this.excelService.generateExcel(header, excelName, sheetName, isCurrency, datos, date, filterLavel);
  }

  validarFechaEnPlazo(fechaIngreso: string, meses: number): boolean {
    const fechaHoy = new Date();
    let fechaIngresoDate = new Date(fechaIngreso);
    fechaIngresoDate.setMonth(fechaIngresoDate.getMonth() + meses);
    const isValidate = fechaIngresoDate >= fechaHoy;

    return isValidate;
  }

  clearBusquedaFiltros() {
    this.createForm();
    this.nroCaracter = 0;
  }

  onRowMenuClick(event: Event, rowData: any, menu: any): void {
    this.menuItems = this.getMenuItems(rowData, menu);
    menu.toggle(event);
  }

  private getMenuItems(rowData: any, menu?: any): MenuItem[] {
    const items: MenuItem[] = [];
    if (rowData.nombEstadoSolicitud === 'PENDIENTE') {
      items.push(this.createMenuItem('Editar', 'pi pi-pencil', () => this.openDialogActualizarDatos(rowData), menu));
    }
    items.push(this.createMenuItem('Ver detalle', 'pi pi-eye', () => this.openDialogDetalle(rowData), menu));
    return items;
  }

  private createMenuItem(label: string, icon: string, action: () => void, menu?: any): MenuItem {
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
}
