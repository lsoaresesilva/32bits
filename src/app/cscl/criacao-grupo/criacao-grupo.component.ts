import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Assunto } from 'src/app/model/assunto';
import AtividadeGrupo from 'src/app/model/atividadeGrupo';
import Query from 'src/app/model/firestore/query';
import Usuario from 'src/app/model/usuario';
import { Util } from 'src/app/model/util';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-criacao-grupo',
  templateUrl: './criacao-grupo.component.html',
  styleUrls: ['./criacao-grupo.component.css']
})
export class CriacaoGrupoComponent implements OnInit {

  estudanteSelecionado;
  pesquisaAlunos;
  estudantesSelecionados;

  assuntos;
  assuntoSelecionado:Assunto;

  questoes;
  questaoSelecionada;


  constructor(private chatService:ChatService, private messageService: MessageService) { 
    this.estudantesSelecionados = [];
    Assunto.getAll().subscribe(assuntos => {
      this.assuntos = assuntos;
    })
  }

  ngOnInit(): void {
  }

  pesquisar(event) {

    Usuario.pesquisar(new Query("nome", "==", event.query)).subscribe(alunos => {
        this.pesquisaAlunos = alunos;
    });

  }

  selecionarAluno(event){
    this.estudantesSelecionados.push(this.estudanteSelecionado);
    this.estudanteSelecionado = null; 
  }

  excluir(aluno){
    let index = 0;
    for(let i = 0; i < this.estudantesSelecionados.length; i++){
      if(this.estudantesSelecionados[i].nome == aluno.nome){
        break;
      }

      index += 1;
    }

    this.estudantesSelecionados.splice(index, 1);
    
  }

  criarSala(){
    let uuid = Util.uuidv4();
    let link = "http://localhost:4200/main/(principal:entrar-grupo/"+uuid+"/"+this.assuntoSelecionado.pk()+"/"+this.questaoSelecionada.id+")";
    let atividade = new AtividadeGrupo(null, this.questaoSelecionada.nomeCurto, link, this.estudantesSelecionados)
    /* Quando entrar no link ativar o socket no cliente do aluno */
    atividade.save().subscribe(()=>{
      this.messageService.add({severity:'success', summary:'Sucesso', detail:'Atividade criada com sucesso.'});
    });

  }

  selecionarAssunto(){
    if(this.assuntoSelecionado != null){
      this.questoes = this.assuntoSelecionado.questoesProgramacao;
    }
  }

  selecionarQuestao(questao){
    this.questaoSelecionada = questao;
  }



}