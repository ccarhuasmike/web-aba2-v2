export interface Tokenizacion {
    parentCardId?: string
    digitalCardId?: string
    panSuffix?: string
    state?: string
    type?: string
    schemeCardId?: string
    deviceBindingList?: string[]
    provisioningTime?: string
    lastReplenishTime?: string
    lastStateChangeTime?: string
    digitalCardRequestorInformation?: DigitalCardRequestorInformation
    deviceInformation?: DeviceInformation
}

export interface DigitalCardRequestorInformation {
    id?: string
    walletId?: string
    name?: string
    tspId?: string
    originalDigitalCardRequestorId?: string
    recommendation?: string
}

export interface DeviceInformation {
    deviceId?: string
    digitalCardStorageType?: string
    manufacturer?: string
    brand?: string
    model?: string
    osVersion?: string
    firmwareVersion?: string
    phoneNumber?: string
    fourLastDigitPhoneNumber?: string
    deviceName?: string
    deviceParentId?: string
    language?: string
    serialNumber?: string
    timeZone?: string
    timeZoneSetting?: string
    simSerialNumber?: string
    IMEI?: string
    networkOperator?: string
    networkType?: string
}
