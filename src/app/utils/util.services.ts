import { Injectable } from "@angular/core";
@Injectable()
export class UtilService {

    constructor() { }

    static filterByField<T>(
        data: T[],
        query: string,
        field: keyof T
    ): T[] {

        if (!Array.isArray(data)) {
            return [];
        }

        const normalizedQuery = (query ?? '').trim().toLowerCase();

        if (normalizedQuery.length === 0) {
            return data; // ← importante: si escribes 1 carácter, busca.
        }

        return data.filter(item => {
            const value = String(item[field] ?? '').toLowerCase();
            return value.includes(normalizedQuery);
        });
    }
}

