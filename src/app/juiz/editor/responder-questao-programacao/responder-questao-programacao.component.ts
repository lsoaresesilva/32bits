import { Component, OnInit, NgZone, ElementRef, Renderer, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import Editor from 'src/app/model/editor';

import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import PedidoAjuda from 'src/app/model/pedidoAjuda';
import { Util } from 'src/app/model/util';
import { Assunto } from 'src/app/model/assunto';
import { LoginService } from '../../../login-module/login.service';

import ErroEditor from 'src/app/model/erroEditor';

import { FormBuilder } from '@angular/forms';



@Component({
  selector: 'responder-questao-programacao',
  templateUrl: './responder-questao-programacao.component.html',
  styleUrls: ['./responder-questao-programacao.component.css']
})
export class ResponderQuestaoProgramacao implements OnInit {
  [x: string]: any;

  assunto;

  pausaIde;
  erroLinguagemProgramacao;
  questao?;
  statusExecucao;
  resultadosTestsCases;
  modoVisualizacao: boolean = false;
  submissao;
  dialogPedirAjuda: boolean = false;
  duvida: string = "";

  // TODO: mover para um componente próprio
  traceExecucao;


  constructor(private route: ActivatedRoute, private login: LoginService, private router: Router, private formBuilder: FormBuilder, private elementRef: ElementRef, private _renderer: Renderer, private cdr: ChangeDetectorRef, private app: ApplicationRef, private zone: NgZone) {
    this.pausaIde = true;
    this.erroLinguagemProgramacao = "";
    this.statusExecucao = "";


    // Para o editor colaborativo
    /*zone.runOutsideAngular(() => {

      window.document.addEventListener('change', this.change.bind(this));

    })*/ 

  }

  

  ngOnInit() {

    this.route.params.subscribe(params => {
      if (params["assuntoId"] != undefined && params["questaoId"] != undefined) {
        Assunto.get(params["assuntoId"]).subscribe(assunto => {
          this.assunto = assunto;
          if (assunto["questoesProgramacao"] != undefined && assunto["questoesProgramacao"].length > 0) {
            assunto["questoesProgramacao"].forEach(questao => {
              if (questao.id == params["questaoId"]) {
                this.questao = questao;
              }
            })

            if (this.questao == undefined) {
              throw new Error("Não é possível iniciar o editor sem uma questão.");
            } else {
              this.editorCodigo = Editor.getInstance();


            }
          }
        })
      } else {
        throw new Error("Não é possível iniciar o editor sem uma questão.");
      }
    })

    let estudante = this.login.getUsuarioLogado();
    if (estudante == null) {
      throw new Error("Não é possível executar o código, pois você não está logado."); // TODO: mudar para o message
    }

    //this.salvarAutomaticamente(); # desabilitado temporariamente por questões de performance.

  }

  onEditorError(submissao) {
    this.submissao = submissao;
  }

  onEditorSubmit(submissao) {
    this.erroLinguagemProgramacao = "";
    this.submissao = submissao;
  }

  onEditorSubmitError(erro) {
    if (erro.name == "HttpErrorResponse" && erro.status == 0) {
      this.erroLinguagemProgramacao = "O servidor está fora do ar."
    } else if (erro.status == 500 && erro.error != undefined) {
      this.erroLinguagemProgramacao = erro.error.erro;
    }
  }


  prepararStatus(status) {
    let textoStatus = "<span class='textoStatus'>Status</span> "
    if (!status)
      this.statusExecucao = textoStatus + "<span class='statusErro'>Erro</span>";
    else
      this.statusExecucao = textoStatus + "<span class='statusSucesso'>Sucesso</span>";
  }

  atualizarLinhaEditor(linha) {
    this.editorCodigo.limparCores();
    this.editorCodigo.destacarLinha(linha, "possivelSolucao");
  }

  visualizarExecucacao() {
    let submissao = this.prepararSubmissao()
    submissao.save().subscribe(resultado => {
      this.submissao = resultado;
      let httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
      // TODO: definir um timedout
      let json = this.construirJson(submissao, "visualização");

      this.http.post("http://127.0.0.1:8000/codigo/", json, httpOptions).subscribe(resposta => {

        resposta = resposta.replace("script str", "")

        let jsonTrace = JSON.parse(resposta);
        this.traceExecucao = jsonTrace;
        this.modoVisualizacao = true;
        this.erroLinguagemProgramacao = "";
      }, err => {
        this.prepararMensagemExceptionHttp(err);
      });
    })


  }

  voltarParaModoExecucao() {
    this.editorCodigo.limparCores();
    this.modoVisualizacao = false;
  }

  pedirAjuda() {
    this.dialogPedirAjuda = true;
  }

  enviarPedidoDeAjuda() {
    let pedidoAjuda = new PedidoAjuda(null, this.submissao, this.duvida, []);

    if (pedidoAjuda.validar()) {
      pedidoAjuda.save().subscribe(resultado => {
        // TODO: usar o message service para mensagem de sucesso
      }, err => {
        // TODO: usar o message service para mensagem de erro
      });
    } else {
      alert('Preencha todos os campos se quiser realizar salvar o planejamento'); // TODO: usar o message service
    }

  }

  listarSubmissao() {
    this.router.navigate(["main", { outlets: { principal: ['estudantes-questao', this.assunto.id, this.questao.id] } }]);
  }


  visualizarCodigoSimilar(questao) {
    this.router.navigate(["main", { outlets: { principal: ['exibir-codigo', questao.id] } }]);
  }

  enviarErroEditor() {
    let submissao = this.prepararSubmissao();
    submissao.save().subscribe(submissao => {
      let errorEditor = new ErroEditor(null, submissao.pk());
      errorEditor.save().subscribe(erro => {
        alert("Erro notificado com sucesso. Obrigado!");
      });
    });

  }

  /*change(event){
    event.preventDefault();
    console.log("DOM value changed" ,event);
    console.log("component value", this.elementRef.nativeElement);
    this.zone.run(() => { console.log('Do change detection here');
    //this.cdr.detectChanges();
    if(this.elementRef.nativeElement.querySelectorAll('input')[0].outerHTML === event.target.outerHTML)
    {
        console.log('Inside value updation');
        
        this.customerForm.controls['name'].setValue(event.target.value);
    }
});
    setTimeout(() =>{
        this.cdr.markForCheck();
    })
}*/
}