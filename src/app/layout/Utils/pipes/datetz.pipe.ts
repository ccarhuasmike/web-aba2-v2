import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
    name: 'datetz'
})
export class DatetzPipe implements PipeTransform {
    transform(value: any, format: any): any {
        if (!value) {
            return '';
        }
        const fechaMoment = moment(value);
        const time = fechaMoment.format('HH:mm:ss');
        return time === '00:00:00'
            ? fechaMoment.format(format)
            : fechaMoment.subtract(5, 'hours').format(format);
    }
}
