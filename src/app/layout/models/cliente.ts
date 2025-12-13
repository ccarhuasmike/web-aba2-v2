export class Cliente {
    constructor(
        public correoElectronico: string = '',
        public desCodTipoDoc: string = '',
        public numDocIdentidad: string = '',
        public primerNombre: string = '',
        public segundoNombre: string = '',
        public primerApellido: string = '',
        public segundoApellido: string = '',
        public nombres: string = '',
        public apellidos: string = '',
        public nombresApellidos: string = '',
        public telefono: string = '',
        public direccion: string = ''
    ) { }
}
