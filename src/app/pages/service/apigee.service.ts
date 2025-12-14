import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { CommonService } from './commonService';

environment
@Injectable({
    providedIn: 'root'
})
export class ApigeeService {

    APIGeeTarOh = environment.APIGeeTarOh;
    ClientIdTarOh = environment.ClientIdTarOh;
    ClientSecretTarOh = environment.ClientSecretTarOh;

    constructor(
        private http: HttpClient,
        private commonService: CommonService
    ) {
        // This a constructor
    }

    postAccessTokenTarjetaOh() {

        const deviceData = this.commonService.getDeviceData();

        const headers = new HttpHeaders({
            ...deviceData,
            'Codigo-Canal': 'ABA2',
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        const formData: Record<string, string> = {
            'grant_type': 'client_credentials',
            'client_id': this.ClientIdTarOh,
            'client_secret': this.ClientSecretTarOh
        }

        let body = new HttpParams();
        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                body = body.set(key, formData[key]);
            }
        }

        const url = `${this.APIGeeTarOh}/v1/accesstoken`;
        return this.http.post(url, body.toString(), { headers })
    }
}