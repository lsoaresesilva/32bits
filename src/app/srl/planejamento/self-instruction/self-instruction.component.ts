import { Component, OnInit, Input } from '@angular/core';
import { Questao } from 'src/app/model/questao';
import { AutoInstrucao } from 'src/app/model/autoInstrucao';
import { ActivatedRoute, Router } from '@angular/router';
import { Assunto } from 'src/app/model/assunto';
import { LoginService } from 'src/app/login-module/login.service';
import { Assuntos } from 'src/app/model/enums/assuntos';

@Component({
  selector: 'app-self-instruction',
  templateUrl: './self-instruction.component.html',
  styleUrls: ['./self-instruction.component.css']
})
export class SelfInstructionComponent implements OnInit {


  private autoInstrucao:AutoInstrucao;
  private questao;
  private assunto;
  private usuario;
  
  private assuntos;
  condicoes;
  repeticoes;
  funcoes;
  vetores;

  constructor(private route: ActivatedRoute, private router: Router, private login: LoginService) {
    this.questao = new Questao(null, null, null, null, null, [], [], null);
    
    this.condicoes = false;
    this.repeticoes = false;
    this.funcoes = false;
    this.vetores = false;
  }

  ngOnInit() {
    this.getQuestao();
   
  }

  getQuestao(){
    this.route.params.subscribe(params => {
      if (params["assuntoId"] != undefined && params["questaoId"] != undefined) {
        Assunto.get(params["assuntoId"]).subscribe(assunto => {
          this.assunto = assunto;
          if (assunto["questoesProgramacao"] != undefined && assunto["questoesProgramacao"].length > 0) {
            assunto["questoesProgramacao"].forEach(questao => {
              if (questao.id == params["questaoId"]) {
                
                this.questao = questao;
                this.autoInstrucao = new AutoInstrucao(null, this.login.getUsuarioLogado(), this.questao, null, null, null, null, null, null);
                this.getAutoInstrucao();
                this.questao.buscarAssuntos(this.assunto).subscribe(assuntos => {
                  this.apresentarPerguntas(assuntos);
                });

              }
            });
          }
        });  

      } else {
         throw new Error("Não é possível visualizar uma questão, pois não foram passados os identificadores de assunto e questão.")
        }
    });
  }
  
  getAutoInstrucao(){
    AutoInstrucao.getAutoInstrucao(this.login.getUsuarioLogado().pk(), this.questao.id).subscribe(autoInstrucao =>{

      if(autoInstrucao != null){
        this.autoInstrucao = autoInstrucao;
        this.autoInstrucao.questao = this.questao;   
      }

    });
  }

  salvar(){ 
    this.autoInstrucao.save().subscribe(resultado => {
      this.router.navigate(["main", { outlets: { principal: ['editor', this.assunto.pk(),this.questao.id] }}]);

      },err => {
      alert("Ocorreu um problema, tente novamente!");
    });
   
  } 

   

  apresentarPerguntas(assuntos) {
    assuntos.forEach(assunto => {

      switch (assunto.nome) {
        case Assuntos.repeticoes: {
          this.repeticoes = true;
          break;
        }
        case Assuntos.condicoes: {
          this.condicoes = true;
          break;
        }
        case Assuntos.funcoes: {
          this.funcoes = true;
          break;
        }
        case Assuntos.vetores: {
          this.vetores = true;
          break;
        }
      }
    });
  }


}