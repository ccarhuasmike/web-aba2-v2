import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/pages/auth/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [TooltipModule, ButtonModule, ReactiveFormsModule, CommonModule, InputTextModule],
    providers: [MessageService],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    private readonly formBuilder = inject(FormBuilder);

    readonly loginForm = this.formBuilder.nonNullable.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    loading = false;

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly messageService: MessageService
    ) { }

    login(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        //const credentials = this.loginForm.getRawValue();
        this.router.navigate(['/']);
        // this.authService
        //     .login(credentials)
        //     .pipe(finalize(() => (this.loading = false)))
        //     .subscribe({
        //         next: tokens => {
        //             this.authService.persistSession(tokens);
        //             this.messageService.add({
        //                 severity: 'success',
        //                 summary: 'Ingreso exitoso',
        //                 detail: 'Bienvenido nuevamente'
        //             });
        //             this.router.navigate(['/dashboard']);
        //         },
        //         error: error => {
        //             const detail = error?.error?.message ?? 'Credenciales inv�lidas, vuelve a intentarlo.';
        //             this.messageService.add({ severity: 'error', summary: 'Error de autenticaci�n', detail });
        //         }
        //     });
    }
}
