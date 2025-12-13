//Configuración calendario
export const CALENDAR_DETAIL = {
    firstDayOfWeek: 1,
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    today: 'Hoy',
    clear: 'Borrar'
};

//Monedas
export const CURRENCY = {
    SOLES: { DESCRIPCION: 'SOLES', ABREVIATURA: 'S/', VALORCORTO: 'PEN', CODIGO: '604' },
    DOLARES: { DESCRIPCION: 'DOLARES', ABREVIATURA: '$', VALORCORTO: 'USD', CODIGO: '840' }
};

//Tipo de archivos
export const FILE_TYPE = {
    JPG: 'jpg',
    JPEG: 'jpeg',
    PNG: 'png',
    PDF: 'pdf',
}

//Roles
export const ROLES = {
    ADMINISTRADOR: 'AdministradorRol',
    ATENCION_CLIENTE: 'AtencionClienteRol',
    ATENCION_CLIENTE_TD: 'AtencionClienteTdRol',
    CONSULTA: 'ConsultaRol',
    FRAUDE: 'FraudeRol',
    OPERACION_CONTABLE: 'OperacionContableRol',
    OPERACION_PASIVA: 'OperacionPasivaRol',
    PLAFT: 'PlaftRol',
    TI: 'TiRol',
    TESORERIA: 'TesoreriaRol',
    VENTAS: 'VentaRol',
    JEFE_VENTAS: 'JefeVentaRol'
}

//Documentos
export const DOCUMENT = {
    DNI: 'DNI',
    CE: 'CE',
    PASAPORTE: 'PASAPORTE',
    RUC: 'RUC'
}

//Tipo transacciones
export const TYPE_TRANSACTION = {
    CARGO: 'CARGO',
    DEPOSITO: 'DEPOSIT',
    RETIRO: 'WITHDRAW',
}

//Origen transacciones observadas
export const ORIGENES_TRANSACTION_OBS = [
    {
        id: '01',
        descripcion: 'AgoraApp'
    },
    {
        id: '02',
        descripcion: 'IziPay',
    },
    {
        id: '03',
        descripcion: 'QR',
    },
    {
        id: '04',
        descripcion: 'Back Office',
    },
    {
        id: '05',
        descripcion: 'BO ABA',
    },
    {
        id: '06',
        descripcion: 'BO Agora',
    },
    {
        id: '07',
        descripcion: 'Procesamiento',
    }
];

//Tipo personas legales
export const LEGAL_TYPE_PERSON = [
    {
        id: '01',
        descripcion: 'PERSONA NATURAL'
    },
    {
        id: '02',
        descripcion: 'PERSONA JURIDICA',
    }
];

//Tipo partners
export const TYPE_PARTNER = [
    {
        id: 1,
        descripcion: 'PERSONA NATURAL'
    },
    {
        id: 2,
        descripcion: 'PERSONA JURIDICA',
    }
];

//Tipo cuentas bancarias
export const TYPE_CUENTA = [
    {
        id: '1',
        descripcion: 'CUENTA DE AHORROS'
    },
    {
        id: '2',
        descripcion: 'CUENTA CORRIENTE'
    }
];

//Estados de soluciones de transacciones observadas
export const ESTADOS_SOLUCION_OBS = [
    {
        id: '01',
        descripcion: 'ABIERTO'
    },
    {
        id: '02',
        descripcion: 'CERRADO',
    }
];

//Equivalencia de tipo de documentos
export const MERGE_DOCUMENT_TYPES_ABA_PUC = [
    {
        aba: '01',
        puc: '141'
    },
    {
        aba: '02',
        puc: '142'
    },
    {
        aba: '03',
        puc: '144'
    }
];

//Tipo de terminales
export const TIPO_TERMINAL = [
    {
        codigo: 'CT1',
        descripcion: 'ATM'
    },
    {
        codigo: 'POI',
        descripcion: 'POS'
    },
    {
        codigo: 'CT6',
        descripcion: 'INTERNET'
    },
    {
        codigo: 'MAN',
        descripcion: 'MANUAL'
    },
    {
        codigo: 'NA',
        descripcion: 'NO INFORMADO'
    }
];

//Tipo de transacciones INCOMING
export const MCTITIPO = [
    {
        codigo: '00',
        descripcion: 'COMPRAS'
    },
    {
        codigo: '01',
        descripcion: 'ATM'
    },
    {
        codigo: '26',
        descripcion: 'OCT'
    },
    {
        codigo: '11',
        descripcion: 'QUASICASH'
    },
    {
        codigo: '10',
        descripcion: 'AFT'
    },
    {
        codigo: '20',
        descripcion: 'DEVOLUCIÓN'
    }
]

//Estado de ajustes masivos
export const BALANCE_ADJUSTMENT_STATUS = [
    {
        codigo: 1,
        descripcion: 'Aprobado'
    },
    {
        codigo: 2,
        descripcion: 'Rechazado'
    },
    {
        codigo: 3,
        descripcion: 'Error de autorización'
    }
]

//Tipos de cuentas
export const ACCOUNT_TYPES = [
    {
        bin: '31',
        moneda: 'SOLES',
        codigoMoneda: '604'
    },
    {
        bin: '32',
        moneda: 'DOLARES',
        codigoMoneda: '840'
    },
    {
        bin: '41',
        moneda: 'SOLES',
        codigoMoneda: '604'
    },
    {
        bin: '51',
        moneda: 'SOLES',
        codigoMoneda: '604'
    }
]

//Días de la semana
export const DAYS = [
    {
        nombre: 'Domingo',
        id: 0
    },
    {
        nombre: 'Lunes',
        id: 1
    },
    {
        nombre: 'Martes',
        id: 2
    },
    {
        nombre: 'Miércoles',
        id: 3
    },
    {
        nombre: 'Jueves',
        id: 4
    },
    {
        nombre: 'Viernes',
        id: 5
    },
    {
        nombre: 'Sábado',
        id: 6
    },
    {
        nombre: 'Feriado',
        id: 7
    }
]

//Tipos de campañas
export const CAMPAIGN_TYPES = [
    {
        id: '01',
        nombre: 'Por Tipo Cambio Fijo'
    },
    {
        id: '02',
        nombre: 'Por Tasa'
    }
]

//Tipos de validaciones de campañas
export const CAMPAIGN_VALIDATION_TYPES = [
    {
        id: '01',
        nombre: 'Por Monto Diario Transaccionado en Campaña'
    },
    {
        id: '02',
        nombre: 'Por Ganancia Diaria'
    },
    {
        id: '03',
        nombre: 'Por Pérdida Diaria'
    },
    {
        id: '04',
        nombre: 'Sin Validación'
    }
]

//Parámetros cuentas ahorros
export const REQUEST_PARAMETERS = {
    'TIPO_DOCUMENTO': [
        {
            "codTabla": 8,
            "codTablaElemento": 1,
            "desElemento": null,
            "valCadCorto": "DNI",
            "valCadLargo": "DOCUMENTO NACIONAL DE IDENTIDAD",
            "valNumEntero": 1,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 44,
            "nomTabla": "TIPO_DOCUMENTO"
        },
        {
            "codTabla": 8,
            "codTablaElemento": 2,
            "desElemento": null,
            "valCadCorto": "CE",
            "valCadLargo": "CARNET DE EXTRANJERIA",
            "valNumEntero": 2,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 45,
            "nomTabla": "TIPO_DOCUMENTO"
        },
        {
            "codTabla": 8,
            "codTablaElemento": 3,
            "desElemento": null,
            "valCadCorto": "PASAPORTE",
            "valCadLargo": "PASAPORTE",
            "valNumEntero": 5,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 46,
            "nomTabla": "TIPO_DOCUMENTO"
        },
        {
            "codTabla": 8,
            "codTablaElemento": 4,
            "desElemento": null,
            "valCadCorto": "RUC",
            "valCadLargo": "REGISTRO UNICO DE CONTRIBUYENTE",
            "valNumEntero": 6,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 47,
            "nomTabla": "TIPO_DOCUMENTO"
        }
    ],
    'TIPO_MONEDA_TRAMA': [
        {
            "codTabla": 18,
            "codTablaElemento": 1,
            "desElemento": null,
            "valCadCorto": "PEN",
            "valCadLargo": "SOLES",
            "valNumEntero": 604,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 82,
            "nomTabla": "TIPO_MONEDA_TRAMA"
        },
        {
            "codTabla": 18,
            "codTablaElemento": 2,
            "desElemento": null,
            "valCadCorto": "USD",
            "valCadLargo": "DOLARES",
            "valNumEntero": 840,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 83,
            "nomTabla": "TIPO_MONEDA_TRAMA"
        }
    ],
    'TIPO_CANAL_TRAMA': [
        {
            "codTabla": 17,
            "codTablaElemento": 1,
            "desElemento": null,
            "valCadCorto": "01",
            "valCadLargo": "APP AGORA",
            "valNumEntero": 1,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 79,
            "nomTabla": "TIPO_CANAL_TRAMA"
        },
        {
            "codTabla": 17,
            "codTablaElemento": 2,
            "desElemento": null,
            "valCadCorto": "02",
            "valCadLargo": "CCE",
            "valNumEntero": 2,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 80,
            "nomTabla": "TIPO_CANAL_TRAMA"
        },
        {
            "codTabla": 17,
            "codTablaElemento": 3,
            "desElemento": null,
            "valCadCorto": "03",
            "valCadLargo": "ABA",
            "valNumEntero": 3,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 81,
            "nomTabla": "TIPO_CANAL_TRAMA"
        },
        {
            "codTabla": 17,
            "codTablaElemento": 8,
            "desElemento": null,
            "valCadCorto": "08",
            "valCadLargo": "MAA",
            "valNumEntero": 8,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 326,
            "nomTabla": "TIPO_CANAL_TRAMA"
        },
        {
            "codTabla": 17,
            "codTablaElemento": 7,
            "desElemento": null,
            "valCadCorto": "07",
            "valCadLargo": "HBK",
            "valNumEntero": 7,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 327,
            "nomTabla": "TIPO_CANAL_TRAMA"
        },
        {
            "codTabla": 17,
            "codTablaElemento": 4,
            "desElemento": null,
            "valCadCorto": "06",
            "valCadLargo": "APP OH",
            "valNumEntero": 6,
            "valNumDecimal": null,
            "estParametro": 1,
            "usuario": "ABA",
            "codParametro": 188,
            "nomTabla": "TIPO_CANAL_TRAMA"
        }
    ],
    'VIGENCIA_SOLICITUD_CUENTA_GARANTIZADA': [
        {
            "codTabla": 64,
            "codTablaElemento": 1,
            "desElemento": "VIGENCIA SOLICITUD CUENTA GARANTIZADA",
            "valCadCorto": null,
            "valCadLargo": null,
            "valNumEntero": 3,
            "valNumDecimal": 0,
            "estParametro": 1,
            "usuario": "FU74737699",
            "codParametro": 960,
            "nomTabla": "VIGENCIA_SOLICITUD_CUENTA_GARANTIZADA"
        }
    ]
}
// 👇 exporta el tipo derivado
export type RequestParameterKey = keyof typeof REQUEST_PARAMETERS;