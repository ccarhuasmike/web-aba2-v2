export interface Campania {
  idCambioMonedaCampana?: number
  codigoCampana?: string
  descripcion?: string
  tipoValidacion?: string
  montoValidacion?: number
  tipoCampana?: string
  tipoCambioCompraOh?: number
  tipoCambioVentaOh?: number
  tasaCompraOh?: number
  tasaVentaOh?: number
  fechaInicio?: string
  fechaFin?: string
  idCambioMonedaEstado?: number
  fechaHoraAprobacion?: string
  usuarioAprobacion?: string
  fechaHoraVencimiento?: string
  usuarioVencimiento?: string
  usuarioRegistro?: string
  fechaRegistro?: string
  usuarioActualizacion?: string
  fechaActualizacion?: string
  usuarioCancelacion?: string
  fechaHoraCancelacion?: string
}

export interface ListaValores {
  nombre: string;
  id: string;
};

export interface ListaValoresEntero {
  nombre: string;
  id:number;
};

export interface ListaValoresDias {
  nombre: string;
  fecha: string;
  numeroDiaSemana:number;
};