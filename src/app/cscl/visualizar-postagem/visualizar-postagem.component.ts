import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Postagem from 'src/app/model/cscl/postagem';
import Usuario from 'src/app/model/usuario';
import Query from 'src/app/model/firestore/query';
import { LoginService } from 'src/app/login-module/login.service';
import { MessageService } from 'primeng/api';
import RespostaPostagem from 'src/app/model/cscl/respostaPostagem';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-visualizar-postagem',
  templateUrl: './visualizar-postagem.component.html',
  styleUrls: ['./visualizar-postagem.component.css'],
})
export class VisualizarPostagemComponent implements OnInit {
 
  postagem$:Observable<Postagem>;
  postagem;
  estudante;
  respostas;
  resposta;

  postagemSemCodigo;
  codigo;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private login: LoginService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    this.route.params.subscribe((params) => {
      if(params["postagemId"] == null){
        this.messageService.add({
          severity: 'erro',
          summary: 'Erro!',
          detail: ' Não é possível visualizar uma postagem sem os seus dados.',
        });
      }else{
        this.resposta = new RespostaPostagem(null, null, this.login.getUsuarioLogado());
        this.postagem$ = Postagem.get(params["postagemId"]).pipe(tap(postagem => this.postagem = postagem));
      }
      
    });
  }

  ngOnInit() {

    
  }

  messageCadastro() {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso!',
      detail: '  resposta efetuada',
    });
  }

  messageUpdate() {
    this.messageService.add({
      severity: 'success',
      summary: 'Alterado!',
      detail: ' editado a resposta',
    });
  }

  messageErro() {
    this.messageService.add({
      severity: 'warn',
      summary: 'Falha ao publicar resposta',
      detail: 'A resposta não foi efetuada',
    });
  }

  messageInformarDados() {
    this.messageService.add({
      severity: 'warn',
      summary: 'Falha ao publicar resposta',
      detail: 'É preciso informar todos os campos do formulário',
    });
  }

  /* formatarHtml(texto){
    return this.sanitizer.bypassSecurityTrustHtml(texto);
  } */

  obterCodigo(texto){
    let re = /<code>((.|[\r\n])*)<\/code>/g;
    let match = texto.match(re);
    if(match != null && match.length == 1){
      match[0] = match[0].replace("</code>", "").replace("<code>", "");
      return match[0];
    }
  }

  extrairPostagem(texto){
    let re = /(.+)<code>/g;
    let match = texto.match(re);
    if(match != null && match.length == 1){
      match[0] = match[0].replace("<code>", "");
      return match[0];
    }else{
      return texto;
    }
  }

  responder() {
    if (this.resposta.validar()) {
      

      if(this.postagem != null){
        this.postagem.respostas.push(this.resposta);
        this.resposta = new RespostaPostagem(null, null, this.login.getUsuarioLogado())
        this.postagem.save().subscribe(()=>{
          this.messageCadastro();
        });
        
      }
    } else {
      this.messageInformarDados();
    }
  }
}
