import { Input, OnChanges } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login-module/login.service';
import Analytics from 'src/app/model/analytics/analytics';
import { Assunto } from 'src/app/model/questoes/assunto';
@Component({
  selector: 'app-monitorar-assunto',
  templateUrl: './monitorar-assunto.component.html',
  styleUrls: ['./monitorar-assunto.component.css'],
})
export class MonitorarAssuntoComponent implements OnChanges {
  constructor(private loginService: LoginService) {}

  @Input()
  assunto: Assunto;

  ngOnChanges(): void {
    const usuario = this.loginService.getUsuarioLogado();
    if (usuario != null) {
      Assunto.consultarRespostasEstudante(usuario).subscribe(respostas=>{
        let percentual = Analytics.calcularProgressoNoAssunto(this.assunto, respostas);
        this.assunto.percentualConclusao = percentual;
      })

    }
  }
}
