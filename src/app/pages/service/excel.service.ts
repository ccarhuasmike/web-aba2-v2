import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as filesaver from 'file-saver';
import * as XLSX from 'xlsx';
import moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class ExcelService {

    constructor() { }

    generateExcel(header:any, excelName:any, sheetName:any, isCurrency:any, data:any, dates:any, filterLabel:any) {
        // Create workbook and worksheet
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        if (dates) {
            if (dates.length == 2) {
                let fini = moment(dates[0]).format('DD/MM/YYYY');
                let ffin = moment(dates[1]).format('DD/MM/YYYY');

                const filterText = worksheet.addRow([filterLabel]);
                filterText.font = { size: 12, bold: true };

                const cellFechaIni = worksheet.getCell('A3');
                cellFechaIni.value = `Desde: ${fini}`;
                cellFechaIni.font = { size: 12, bold: true };

                const cellFechaFin = worksheet.getCell('B3');
                cellFechaFin.value = `Hasta: ${ffin}`;
                cellFechaFin.font = { size: 12, bold: true };

                worksheet.addRow([]);
            } else {
                let fini = moment(dates).format('DD/MM/YYYY');

                const cellFilterText = worksheet.getCell('A1');
                cellFilterText.value = filterLabel;
                cellFilterText.font = { size: 12, bold: true };

                const cellFechaIni = worksheet.getCell('C1');
                cellFechaIni.value = fini;
                cellFechaIni.font = { size: 12, bold: true };

                worksheet.addRow([]);
            }
        }

        const headerRow = worksheet.addRow(header);
        headerRow.eachCell((cell:any) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '000000' } // background en hexadecimal
                // bgColor: { argb: '1103e5' }
            };
            cell.font = { color: { argb: 'FFFFFF' }, bold: true };
            cell.alignment = {
                vertical: 'center',
                horizontal: 'center'
            };
            cell.border = { color: { argb: 'black' }, top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // Add data and Conditional Formatting
        data.forEach((d:any) => {
            const row = worksheet.addRow(d);
            isCurrency.forEach((element:any) => {
                let cellValue = row.getCell(element).value;
                row.getCell(element).value = cellValue || 0;
                row.getCell(element).numFmt = '#,##0.00';
            });
        });

        worksheet.columns.forEach((column:any) => {
            const lengths = column.values.map((v:any) => v.toString().length);
            const maxLength = Math.max(...lengths.filter((v:any) => typeof v === 'number'));
            column.width = maxLength;
        });

        workbook.xlsx.writeBuffer().then((datos: any) => {
            const blob = new Blob([datos], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            filesaver.saveAs(blob, excelName);
        });

    }

    importFromFile(bstr: string): XLSX.AOA2SheetOpts {
        /* read workbook */
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const data = <XLSX.AOA2SheetOpts>(XLSX.utils.sheet_to_json(ws, { header: 1 }));

        return data;
    }


    validarInformacion(headers:any, body:any) {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Validaciones');
        const headerRow = worksheet.addRow(headers);

        headerRow.eachCell((cell:any) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '000000' } // background en hexadecimal
                // bgColor: { argb: '1103e5' }
            };
            cell.font = { color: { argb: 'FFFFFF' }, bold: true };
            cell.alignment = {
                vertical: 'center',
                horizontal: 'center'
            };
            cell.border = { color: { argb: 'B8CCE4' }, top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        body.forEach((d:any) => {
            const row:any = worksheet.addRow(d);
            if (row.getCell(1).value.length !== 19) {
                row.getCell(1).font = { color: { argb: 'FF0000' }, bold: false };
            }
        });

        workbook.xlsx.writeBuffer().then((body: any) => {
            const blob = new Blob([body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            filesaver.saveAs(blob, 'prueba.xlsx');
        });
    }

    generateCSV(headers: string[], data: any[]): Blob {
        const rowHeader = JSON.stringify(headers)
            .split('[').join('')
            .split(']').join('')
            .split('"').join('') + ('\r\n')

        let csv = [];
        csv.push(rowHeader);
        data.forEach((item: any) => {
            const row = (JSON.stringify(item).split('"').join('').split('[').join('').split(']')).join('') + ('\r\n');
            csv.push(row);
        })

        let blob = new Blob(csv, { type: 'text/csv' })
        return blob;
    }
}
