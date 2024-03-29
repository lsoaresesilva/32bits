import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Group } from 'ng-chat';
import { DialogService } from 'primeng/dynamicdialog';
import { MonitorService } from 'src/app/chatbot/monitor.service';
import { LoginService } from 'src/app/login-module/login.service';
import ConsoleEditor from 'src/app/model/consoleEditor';
import RespostaQuestaoCorrecaoAlgoritmo from 'src/app/model/correcao-algoritmo/correcaoAlgoritmo';
import SubmissaoGrupo from 'src/app/model/cscl/submissaoGrupo';
import ErroServidor from 'src/app/model/errors/erroServidor';
import { Groups } from 'src/app/model/experimento/groups';
import { ModoExecucao } from 'src/app/model/juiz/enum/modoExecucao';

@Component({
  selector: 'app-ide',
  templateUrl: './ide.component.html',
  styleUrls: ['./ide.component.css'],
})
export class IdeComponent implements OnChanges{

  @Input()
  questaoColaborativa;
  @Input()
  questaoCorrecao;
  @Input()
  grupo;
  @Input()
  submissao;
  @Input()
  atividadeGrupo;
  @Input()
  questao?;
  @Input()
  assunto?;
  @Input()
  modoExecucao;

  @Input()
  isMudancaEditorPermitida;


  modoVisualizacao;
  traceExecucao;
  usuario;
  consoleEditor: ConsoleEditor;
  processandoSubmissao;
  editorCodigo;

  @Output()
  onEditorError;
  @Output()
  onEditorSubmit;

  constructor(
    private login: LoginService,
    public dialogService: DialogService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.usuario = this.login.getUsuarioLogado();
    this.processandoSubmissao = false;
    this.consoleEditor = new ConsoleEditor();
    this.onEditorError = new EventEmitter();
    this.onEditorSubmit = new EventEmitter();
    this.modoVisualizacao = false;
    
  }
  ngOnChanges(changes: SimpleChanges): void {
  }

  voltarParaModoExecucao() {
    this.modoVisualizacao = false;
  }

  onEditorMudancaExecucacao(modoExecucao){
    this.modoExecucao = modoExecucao;
  }

  onEditorReady(editor) {
    this.editorCodigo = editor;
  }

  erroEditor(submissao) {
    //this.submissao = Object.assign({}, submissao);//new Submissao(null, null, null, null, null)//this.prepararSubmissao(submissao);
    //this.changeDetector.detectChanges();
    this.submissao = submissao;
    this.consoleEditor.erro = null;
    this.consoleEditor.submissao = this.submissao;
    if(this.submissao.erro.traceback != null){
      this.consoleEditor.tracebackOriginal = this.submissao.erro.traceback;
    }
    
    this.onEditorError.emit(submissao);
  }

  submissaoEditor(submissao) {
    this.submissao = submissao;
    this.consoleEditor.erro = null;
    this.consoleEditor.tracebackOriginal = null;
    this.consoleEditor.submissao = this.submissao;
    this.onEditorSubmit.emit(submissao);
  }

  onServidorError(erroServidor) {
    let erro = ErroServidor.construir(erroServidor);
    this.consoleEditor.erro = erro;
  }

  onVisualization(visualizacao) {
    this.modoVisualizacao = visualizacao.modoVisualizacao;
    this.traceExecucao = visualizacao.trace;
  }
}
