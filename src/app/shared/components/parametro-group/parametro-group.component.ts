import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-registrar-grupo-debito',
  standalone: true,
  templateUrl: './parametro-group.component.html',
  styleUrls: ['./parametro-group.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MessageModule,
    ToastModule,
    ButtonModule,
    InputTextModule
  ],
  providers: [MessageService]
})
export class RegistrarGrupoDebitoComponent {

  form: FormGroup;
  groups: any[] = [];

  constructor(
    private readonly toastr: MessageService,
    private readonly fb: FormBuilder,
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {

    // Data recibida desde el openDialog (opcional para editar)
    const item = config.data?.item ?? null;

    // Lista para evitar duplicados
    this.groups = config.data?.groups ?? [];

    this.form = this.fb.group({
      codTabla: new FormControl(item?.codTabla || null),
      nomTabla: new FormControl(item?.nomTabla || null, [
        Validators.required,
        Validators.maxLength(50)
      ])
    });
  }

  closeGrupo() {
    this.dialogRef.close({ event: 'cancel' });
  }

  addGrupo() {
    const valor = this.form.get('nomTabla')!.value?.trim().toLowerCase();

    const duplicado = this.groups.some(
      (e: any) => e.nomTabla?.trim().toLowerCase() === valor
    );

    if (duplicado) {
      this.toastr.add({
        severity: 'error',
        summary: 'Duplicado',
        detail: 'Ya existe un grupo con este nombre'
      });
      return;
    }

    this.dialogRef.close({
      event: 'ok',
      data: this.form.value
    });
  }
}
