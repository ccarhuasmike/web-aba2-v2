import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class HistorialSolicitudesService {

    APICtaAhoMig = environment.APICtaAhoMig;

    constructor(private readonly http: HttpClient) { }

    validateTipoDoc(tipoDoc: string, tiposDoc: any[]): boolean {
        let error = false;

        if (tipoDoc) {
            const tipoDocMatch = tiposDoc.find(e => e.id === tipoDoc);
            error = !(tipoDocMatch);
        } else {
            error = true;
        }

        return error;
    }

    validateNumeroDocu(value: string, type: string): boolean {
        let error = false;

        if (value && type) {
            const size = (type === 'DNI') ? 8 : 9;
            error = !!((isNaN(Number(value)) || String(value).length != size));
        }

        return error;
    }

    validateFlagSiNo(flag: string): boolean {
        let error = false;

        if (flag) {
            error = !((flag.toUpperCase() == 'SI' || flag.toUpperCase() == 'NO'));
        } else {
            error = true;
        }

        return error;
    }

    validateGenero(genero: string): boolean {
        let error = false;

        if (genero) {
            error = !((genero.toUpperCase() == 'F' || genero.toUpperCase() == 'M'));
        } else {
            error = true;
        }

        return error;
    }

    validateFecha(fecha: string): boolean {
        let error = false;

        let date = new Date(fecha);
        if (isNaN(date.getTime())) { error = true; };

        return error;
    }

    validateEstadoTipo(value: string, estadosTipos: any[]): boolean {
        let error = false;

        if (value) {
            error = !(estadosTipos.some(e => e == value));
        } else {
            error = true;
        }

        return error;
    }

    validateNumTel(telefono: string): boolean {
        let error = false;

        if (telefono) {
            error = !!(isNaN(Number(telefono)));
        } else {
            error = true;
        }

        return error;
    }

    validateEmail(email: string): boolean {
        let error = false;

        if (email) {
            let control = new FormControl(email, [Validators.email]);
            error = !!(Validators.email(control));
        } else {
            error = true;
        }

        return error;
    }

    validateUbigeo(codigo: string, sizeRequired: number): boolean {
        let error = false;

        if (codigo && sizeRequired) {
            error = (codigo.toString()).length != sizeRequired;
        } else {
            error = true;
        }

        return error;
    }

    validateRUC(ruc: string): boolean {
        let error = false;

        if (ruc) {
            error = !(((ruc.toString()).length > 8 && (ruc.toString()).length < 13));
            error = !!(isNaN(Number(ruc)));
        } else {
            error = true;
        }

        return error;
    }
    
    postConsultaSolicitudesRechazadas(body:any) {
        let url = `${this.APICtaAhoMig}/v1/aba/solicitudes-ahorros/rechazadas`;
        return this.http.post(url, body);
    }
}