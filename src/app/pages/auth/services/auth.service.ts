import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly baseUrl = environment.APIAd;
    private readonly ACCESS_TOKEN_KEY = 'infinance.accessToken';
    private readonly REFRESH_TOKEN_KEY = 'infinance.refreshToken';

    constructor(private readonly http: HttpClient) {}

    login(credentials: LoginRequest): Observable<AuthTokens> {
        return this.http.post<AuthTokens>(`${this.baseUrl}/login`, credentials);
    }

    persistSession(tokens: AuthTokens, useLocalStorage = false): void {
        const storage = this.resolveStorage(useLocalStorage);
        if (!storage) {
            return;
        }

        storage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
        if (tokens.refreshToken) {
            storage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
        }
    }

    clearSession(useLocalStorage = false): void {
        const storage = this.resolveStorage(useLocalStorage);
        if (!storage) {
            return;
        }

        storage.removeItem(this.ACCESS_TOKEN_KEY);
        storage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    getAccessToken(useLocalStorage = false): string | null {
        const storage = this.resolveStorage(useLocalStorage);
        return storage?.getItem(this.ACCESS_TOKEN_KEY) ?? null;
    }

    private resolveStorage(useLocalStorage: boolean): Storage | null {
        if (typeof globalThis === 'undefined') {
            return null;
        }

        return useLocalStorage ? globalThis.localStorage : globalThis.sessionStorage;
    }
}
