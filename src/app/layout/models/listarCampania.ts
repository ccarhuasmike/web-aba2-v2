export interface ListarCampania {
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
  codigoEstado?: string
  descripcionLarga?: string
  fechaHoraAprobacion?: string
  usuarioAprobacion?: string
  fechaHoraVencimiento?: string
  usuarioVencimiento?: string
  usuarioRegistro?: string
  fechaRegistro?: string
  usuarioActualizacion?: string
  fechaActualizacion?: string
  usuarioCancelacion?: string
  fechaCancelacion?: string
  fechaHoraCancelacion?: string
}
