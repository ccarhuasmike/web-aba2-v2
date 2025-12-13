import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-parametro-add',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, AutoCompleteModule, ButtonModule,
    InputGroupModule, InputGroupAddonModule, MessageModule, InputTextModule,
    ToastModule
  ],
  templateUrl: './parametro-add.component.html'
})
export class ParametroAddReusableComponent {

  @Input() formAdd!: FormGroup;
  @Input() groups: any[] = [];
  @Input() filteredElement: any[] = [];

  // Eventos expuestos al componente padre
  @Output() addParametro = new EventEmitter<void>();
  @Output() filterElement = new EventEmitter<any>();
  @Output() addGrupo = new EventEmitter<void>();

}