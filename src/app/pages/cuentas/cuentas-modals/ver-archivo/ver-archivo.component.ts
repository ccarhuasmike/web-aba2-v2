import { Component, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '@/pages/service/commonService';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
@Component({

    selector: 'app-ver-archivo',
    templateUrl: './ver-archivo.component.html',
    styleUrls: ['./ver-archivo.component.scss'],
    standalone: true,
    imports: [CommonModule],
    encapsulation: ViewEncapsulation.None
})
export class VerArchivoComponent {

    fileName: any = null;
    base64File: any = null;
    displayFile: boolean = false;

    constructor(
        public dialogRef: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private readonly sanitizer: DomSanitizer,
        private readonly commonService: CommonService
    ) {
        const file = config.data.base64File;
        this.validatePdfBase64(file);
        // NOSONAR: File validated securely using validatePdfBase64()
        this.base64File = this.sanitizer.bypassSecurityTrustResourceUrl(file); // NOSONAR
    }

    validatePdfBase64(pdfBase64: string): true {
        const pdfPrefix = 'data:application/pdf;base64,';

        if (!pdfBase64 || typeof pdfBase64 !== 'string') {
            throw new Error('PDF data is missing or invalid.');
        }

        if (!pdfBase64.startsWith(pdfPrefix)) {
            throw new Error('The provided file is not a PDF base64 string.');
        }

        // Extraer el contenido base64 (sin el prefijo MIME)
        const base64Content = pdfBase64.substring(pdfPrefix.length);

        // Validar caracteres base64
        if (!/^[A-Za-z0-9+/=]+$/.test(base64Content)) {
            throw new Error('PDF base64 contains invalid characters.');
        }

        return true;
    }
    download() {
        const file = this.config.data.base64File;
        this.commonService.downloadFile(file, this.fileName);
    }
}
