import { Component, OnInit, Input, Output } from '@angular/core';
import { QuestaoProgramacao } from 'src/app/model/questoes/questaoProgramacao';
import { RespostaQuestaoExperimento } from 'src/app/model/experimento/old_check_to_delete/respostaQuestaoExperimento';
import { LoginService } from 'src/app/login-module/login.service';

@Component({
  selector: 'app-questao',
  templateUrl: './questao.component.html',
  styleUrls: ['./questao.component.css'],
})
export class QuestaoComponent implements OnInit {
  @Input('questao') questao;
  @Input('respostaQuestao') respostaQuestao: RespostaQuestaoExperimento;

  constructor(private loginService: LoginService) {}

  ngOnInit() {}

  selecionarAlternativa(alternativa) {
    this.respostaQuestao.alternativa = alternativa;
    this.respostaQuestao.questao = this.questao;
    this.respostaQuestao.estudante = this.loginService.getUsuarioLogado();
  }
}
