import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/login-module/login.service';
import Query from 'src/app/model/firestore/query';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

/*
http://localhost:4200/main/(principal:editor/jW22yOF9a28N0aQlNNGR/76e4017f-6006-476f-8b47-88b0e33dbf84)
*/

@Component({
  selector: 'app-exibir-solucao',
  templateUrl: './exibir-solucao.component.html',
  styleUrls: ['./exibir-solucao.component.css'],
})
export class ExibirSolucaoComponent {
  saida;

  constructor(
    private login: LoginService,
    private router: Router,
    private messageService: MessageService,
    public config: DynamicDialogConfig
  ) {
    /* const navigation = this.router.getCurrentNavigation();

    const questao = navigation.extras.state.questao as QuestaoProgramacao; */
    const questao = this.config.data.questao;
    if (questao != null) {
      const solucao = questao.getExemploCorreto();
      if (Array.isArray(solucao.codigo)) {
        this.saida = solucao.codigo.join('\n');

      }
    }
  }

  exibirMensagem() {
    this.messageService.add({ severity: 'warning', summary: 'Sem código disponível' });
  }
}
