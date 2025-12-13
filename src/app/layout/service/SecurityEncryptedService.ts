import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class SecurityEncryptedService {

    secretKey = 'dwe6L#x7Hfi9Zsej0ad&S2$^badbWQ#yx$20g1kZ';

    constructor() {
        // This is a constructor
    }

    encrypt(value: string): string {
        return CryptoJS.AES.encrypt(value, this.secretKey.trim()).toString();
    }

    decrypt(value: string) {
        return CryptoJS.AES.decrypt(value, this.secretKey.trim()).toString(CryptoJS.enc.Utf8);
    }

    getRolesDecrypted(): string | null {
        try {
            const value = localStorage.getItem('rolesABA');
            if (!value) return null;

            const decrypted = this.decrypt(value);
            const data = JSON.parse(decrypted);

            return Array.isArray(data) ? data[0] : null;
        } catch {
            return null;
        }
    }
}
