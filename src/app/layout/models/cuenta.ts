export class Cuenta {
    constructor(
        public numeroCuenta: string = '',
        public numeroCuentaCci: string = '',
        public producto: string = '',
        public fechaApertura: string = '',
        public fechaBaja: string = '',
        public estadoCuenta: string = '',
        public codigoEstadoCuenta: string = '',
        public motivoBloqueo: string = '',
        public codigoMotivoBloqueo: string = '',
        public saldoDisponible: number = 0,
        public saldoRetenido: number = 0
    ) { }
}

