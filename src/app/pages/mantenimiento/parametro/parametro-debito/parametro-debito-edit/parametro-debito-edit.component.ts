import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ParametroDebitoService } from '../parametro-debito.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ParametroEditComponent } from '@/shared/components/parametro-edit/parametro-edit.component';
import { ParametroEditBaseComponent } from '@/shared/components/parametro-edit-base/parametro-edit-base.component';

@Component({
  selector: 'app-parametro-debito-edit',
  templateUrl: './parametro-debito-edit.component.html',
  styleUrls: ['./parametro-debito-edit.component.scss'],
  standalone: true,
  imports: [ParametroEditComponent],
  providers: [MessageService, DialogService, ConfirmationService],
})
export class ParametroDebitoEditComponent extends ParametroEditBaseComponent implements OnInit {

 constructor(
    private readonly servicio: ParametroDebitoService,
    fb: FormBuilder,
    toastr: MessageService,
    private readonly route: ActivatedRoute
  ) {
    super(fb, toastr);
    this.codParametro = this.route.snapshot.paramMap.get('id');
    this.loadParametro(this.codParametro);
  }

  ngOnInit(): void {
    this.loadGrupos();
  }

  getParametroService(id: any) {
    return this.servicio.getParametro(id);
  }

  getGrupoParametrosService() {
    return this.servicio.getGrupoParametros();
  }

  updateParametroService(data: any) {
    return this.servicio.putParametro(data);
  }
}
