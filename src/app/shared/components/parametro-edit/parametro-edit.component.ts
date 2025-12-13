import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup,  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { ToastModule } from "primeng/toast";

@Component({
  selector: 'app-parametro-edit',
  standalone: true,
  templateUrl: './parametro-edit.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    InputTextModule,
    MessageModule,
    ToastModule,
    ButtonModule
  ]
})
export class ParametroEditComponent {

  @Input() formEdit!: FormGroup;
  @Input() groups: any[] = [];
  @Input() filteredElement: any[] = [];

  @Output() filterElementEmitter = new EventEmitter<any>();
  @Output() submitEmitter = new EventEmitter<void>();

  filterElement(event: any) {
    this.filterElementEmitter.emit(event);
  }

  submit() {
    this.submitEmitter.emit();
  }
}
