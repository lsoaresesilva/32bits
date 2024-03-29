import { Observable, forkJoin, observable } from 'rxjs';
import QuestaoColaborativa from '../../cscl/questaoColaborativa';
import { Assuntos } from '../../enums/assuntos';
import { Collection, ignore } from '../../firestore/document';
import { MaterialAprendizagem } from '../materialAprendizagem';
import Submissao from '../../submissao';
import Usuario from '../../usuario';
import { Util } from '../../util';
import { QuestaoProgramacao } from './questaoProgramacao';
import QuestaoFechada from './questaoFechada';
import { Document } from '../../firestore/document';
import Query from '../../firestore/query';
import { RespostaQuestaoFechada } from './respostaQuestaoFechada';
import QuestaoParsonProblem from './questaoParsonProblem';
import QuestaoProgramacaoCorrecao from './questaoProgramacaoCorrecao';
import { QuestaoProgramacaoRegex } from './questaoProgramacaoRegex';
import VideoProgramacao from '../videoProgramacao';
import { VisualizacaoRespostasQuestoes } from './visualizacaoRespostasQuestoes';
import Texto from '../texto';
import RespostaQuestaoCorrecaoAlgoritmo from '../../correcao-algoritmo/correcaoAlgoritmo';
import { RespostaQuestaoParson } from '../../juiz/respostaQuestaoParson';
import RespostasQuestoes from './respostasQuestoes';

@Collection('assuntos')
export class Assunto extends Document {

  constructor(id, public nome) {
    super(id);
    this.questoesFechadas = [];
    this.questoesProgramacao = [];
    this.objetivosEducacionais = [];
    this.questoesParson = [];
    this.questoesColaborativas = [];
    this.questoesCorrecao = [];
    this.questoesRegex = [];
    this.videos = [];
  }

  ordem: number;

  importancia;
  // Materiais de aprendizagem
  questoesProgramacao: QuestaoProgramacao[];
  questoesFechadas: QuestaoFechada[];
  questoesParson: QuestaoParsonProblem[];
  questoesColaborativas: QuestaoColaborativa[];
  questoesCorrecao: QuestaoProgramacaoCorrecao[];
  questoesRegex: QuestaoProgramacaoRegex[];


  objetivosEducacionais: [];
  isAtivo;

  @ignore()
  percentualConclusao;
  @ignore()
  videos;
  @ignore()
  materiais: MaterialAprendizagem[];

  /**
   * Este método deve ser temporário, pois uma questão possui relação com assuntos,
   * mas está sendo utilizado relação com banco de dados (usando a PK deles)
   * No entanto, isso é custoso, pois seria preciso carregar do BD cada assunto.
   * Para reduzir esse problema, futuramente, deve-se refatorar cada questão de programação para usar o nome que está no enumerador.
   */
  static criarAssunto(assunto) {
    if (assunto != null) {
      const a = new Assunto(assunto, null);
      if (assunto == 'PU0EstYupXgDZ2a57X0X') {
        // Repetições
        a.nome = Assuntos.repeticoes;
      } else if (assunto == 'jW22yOF9a28N0aQlNNGR') {
        // Repetições
        a.nome = Assuntos.variaveis;
      } else if (assunto == 'x6cVrs1hHkKmdRhFBpsf') {
        // Repetições
        a.nome = Assuntos.condicoes;
      }

      return a;
    }

    return null;
  }

  static fromJson(assuntoJson) {
    const assunto = new Assunto(assuntoJson.id, assuntoJson.nome);
    assunto['questoesProgramacao'] = assuntoJson.questoesProgramacao;
    return assunto;
  }

  static getAll(query = null, orderBy = null): Observable<Assunto[]> {
    return new Observable((observer) => {
      super.getAll(query).subscribe((assuntos) => {
        assuntos.sort((assuntoA, assuntoB) => {
          if (assuntoA.sequencia < assuntoB.sequencia) {
            return -1;
          } else if (assuntoA.sequencia > assuntoB.sequencia) {
            return 1;
          }
          return 0;
        });

        assuntos.forEach((assunto) => {
          Assunto.construir(assunto);
        });

        observer.next(assuntos);
        observer.complete();
      });
    });
  }

  static getAllAdmin(query = null, orderBy = null): Observable<any[]> {
    return super.getAll(query);
  }

  static exportarParaJson() {
    return new Observable((observer) => {
      Assunto.getAllAdmin().subscribe((assuntos) => {
        const assuntosConvertidos = [];
        assuntos.forEach((assunto) => {
          assuntosConvertidos.push(assunto.toJson());
        });

        const saidaJson = JSON.stringify(assuntosConvertidos);
        observer.next(saidaJson);
        observer.complete();
      });
    });
  }

  /**
   * Constrói as relações internas de um assunto com seus materiais de aprendizagem.
   * @param assunto
   */
  static construir(assunto) {
    assunto['questoesProgramacao'] = QuestaoProgramacao.construir(
      assunto['questoesProgramacao'],
      assunto
    );

    assunto['questoesFechadas'] = QuestaoFechada.construir(assunto['questoesFechadas']);

    assunto['questoesColaborativas'] = QuestaoColaborativa.construir(
      assunto['questoesColaborativas'],
      assunto
    );

    assunto['questoesParson'] = QuestaoParsonProblem.construir(assunto['questoesParson']);

    assunto['questoesCorrecao'] = QuestaoProgramacaoCorrecao.construir(
      assunto['questoesCorrecao'],
      assunto
    );

    assunto['questoesRegex'] = QuestaoProgramacaoRegex.construir(assunto['questoesRegex']);

    assunto['videos'] = VideoProgramacao.construir(assunto['videos']);

    assunto['textos'] = VideoProgramacao.construir(assunto['textos']);
  }

  static get(id): Observable<Assunto> {
    return new Observable<Assunto>((observer) => {
      super.get(id).subscribe(
        (assunto) => {
          Assunto.construir(assunto);

          observer.next(assunto as Assunto);
          observer.complete();
        },
        (err) => {
          observer.error(err);
        }
      );
    });
  }

  /* static isQuestoesProgramacaoFinalizadas(assunto: Assunto, estudante, visualizacoesRespostasQuestoesProgramacao, margemAceitavel = 0.6) {
    return new Observable((observer) => {
      let percentual = this.calcularPercentualConclusaoQuestoesProgramacao(
        assunto,
        estudante,
        visualizacoesRespostasQuestoesProgramacao,
        margemAceitavel
      );
      if (percentual >= margemAceitavel) {
        observer.next(true);
        observer.complete();
      } else {
        observer.next(false);
        observer.complete();
      }
    });
  } */

  static consultarRespostasEstudante(estudante: Usuario): Observable<RespostasQuestoes> {
    return new Observable<any>((observer) => {
      const query: any = {};
      query.submissoes = Submissao.getAll(new Query('estudanteId', '==', estudante.pk()));
      query.respostasQuestoesFechadas = RespostaQuestaoFechada.getAll(
        new Query('estudanteId', '==', estudante.pk())
      );
      query.respostasQuestoesParson = RespostaQuestaoParson.getAll(
        new Query('estudanteId', '==', estudante.pk())
      );
      /* query.respostasQuestaoCorrecao = RespostaQuestaoCorrecaoAlgoritmo.getAll(
        new Query('estudanteId', '==', estudante.pk())
      ); */

      query.visualizacoesRespostasProgramacao = VisualizacaoRespostasQuestoes.getAll(
        new Query('estudanteId', '==', estudante.pk())
      );

      forkJoin(query).subscribe((respostasEstudante:any) => {
        const respostas: RespostasQuestoes = new RespostasQuestoes();
        respostas.questoesFechadas = respostasEstudante.respostasQuestoesFechadas;
        respostas.questoesParson = respostasEstudante.respostasQuestoesParson;
        respostas.questoesProgramacao = {
          submissoes:respostasEstudante.submissoes,
          visualizacoesRespostas:respostasEstudante.visualizacoesRespostasProgramacao
        };
        observer.next(respostas);
        observer.complete();
      });
    });
  }

  /**
   * Recupera as submissões mais recentes do estudante. As submissões são referentes a diferentes questões de programação.
   * @param assunto
   * @param usuario
   */
  static getTodasSubmissoesProgramacaoPorEstudante(assunto, usuario) {
    const submissoes = {};
    assunto.questoesProgramacao.forEach((questao) => {
      if (questao.testsCases != undefined && questao.testsCases.length > 0) {
        submissoes[questao.id] = Submissao.getRecentePorQuestao(questao, usuario);
      }
    });

    return submissoes;
  }

  static consultarRespostasQuestoesFechadasPorAssunto(assunto: Assunto, estudante: Usuario) {
    // Recuperar todas as questões de um assunto
    return new Observable((observer) => {
      const respostas = [];
      assunto.questoesFechadas.forEach((questao) => {
        // Recuperar todas as respostas às questões fechadas

        respostas.push(RespostaQuestaoFechada.getRespostaQuestaoEstudante(questao, estudante));
      });

      if (respostas.length > 0 && assunto.questoesFechadas.length == respostas.length) {
        forkJoin(respostas).subscribe((respostas) => {});
      } else {
        observer.next(0);
        observer.complete();
      }
    });
  }

  /**
   * Calcula o percentual de questões de programação que o estudante resolveu.
   * @param assunto
   * @param usuario
   * @param margemAceitavel
   */

  /* Ordena os assuntos a partir da sequência em que devem ser trabalhados. */
  static ordenar(arrayAssuntos: Assunto[]) {
    arrayAssuntos.sort(function (assuntoA, assuntoB) {
      return assuntoA.ordem - assuntoB.ordem;
    });

    return arrayAssuntos;
  }

  getAllMateriaisAprendizagem():Observable<MaterialAprendizagem[]>{
    return new Observable<MaterialAprendizagem[]>(observable=>{
      let materiaisAprendizagem = [].concat(this.questoesCorrecao,
        this.questoesFechadas,
        this.questoesParson,
        this.questoesProgramacao,
        this.questoesRegex);

      let consultas = [];
      consultas.push(Texto.getAll(new Query("assuntoId", "==", this.pk())));
      consultas.push(VideoProgramacao.getAll(new Query("assuntoId", "==", this.pk())));

      forkJoin(consultas).subscribe(resultados=>{
        resultados.forEach(materiais=>{
          materiaisAprendizagem = materiaisAprendizagem.concat(materiais);
        });
        observable.next(materiaisAprendizagem);
        observable.complete();
      })

    })


  }

  ordenarMaterialAprendizagem(questoesComStatus) {
    let materiais: MaterialAprendizagem[] = [];

    materiais = materiais.concat(questoesComStatus, this.videos);
    materiais.sort((qA, qB) => {
      if (qA.ordem != null && qB.ordem != null) {
        if (qA.ordem < qB.ordem) {
          return -1;
        } else if (qA.ordem > qB.ordem) {
          return 1;
        } else {
          return 0;
        }
      } else {
        if (qA.ordem != null) {
          return 1;
        } else if (qB.ordem != null) {
          return -1;
        } else {
          // TODO: Remover quando todos os objetos de materiais tiverem o atributo ordem
          if (qA['sequencia'] != null && qB['sequencia'] != null) {
            return qA['sequencia'] - qB['sequencia'];
          }
        }
      }
    });

    return materiais;
  }

  getMateriaisOrdenados(estudante): Observable<MaterialAprendizagem[]> {
    return new Observable((observer) => {
      const consultas = {};

      // TODO: vincular os vídeos ao id do assunto. Carregar os vídeos referentes ao assunto aqui e incluir em consultas
      consultas['videosProgramacao'] = VideoProgramacao.getAll(
        new Query('assuntoId', '==', this.pk())
      );
      consultas['textosProgramacao'] = Texto.getAll(new Query('assuntoId', '==', this.pk()));

      if (Array.isArray(this.questoesProgramacao) && this.questoesProgramacao.length > 0) {
        consultas['questoesProgramacao'] = QuestaoProgramacao.verificarQuestoesRespondidas(
          estudante,
          this.questoesProgramacao
        );
      }

      if (Array.isArray(this.questoesFechadas) && this.questoesFechadas.length > 0) {
        consultas['questoesFechadas'] = QuestaoFechada.verificarQuestoesRespondidas(
          estudante,
          this.questoesFechadas
        );
      }

      if (Array.isArray(this.questoesParson) && this.questoesParson.length > 0) {
        consultas['questoesParson'] = QuestaoParsonProblem.verificarQuestoesRespondidas(
          estudante,
          this.questoesParson
        );
      }

      if (Array.isArray(this.questoesCorrecao) && this.questoesCorrecao.length > 0) {
        consultas['questoesCorrecao'] = QuestaoProgramacaoCorrecao.verificarQuestoesRespondidas(
          estudante,
          this.questoesCorrecao
        );
      }

      if (Array.isArray(this.questoesCorrecao) && this.questoesCorrecao.length > 0) {
        consultas['questoesRegex'] = QuestaoProgramacaoRegex.verificarQuestoesRespondidas(
          estudante,
          this.questoesRegex
        );
      }

      forkJoin(consultas).subscribe((respostas) => {
        let materiais = [];
        if (respostas['questoesFechadas'] != null) {
          materiais = materiais.concat(respostas['questoesFechadas']);
        }

        if (respostas['questoesProgramacao'] != null) {
          materiais = materiais.concat(respostas['questoesProgramacao']);
        }

        if (respostas['questoesCorrecao'] != null) {
          materiais = materiais.concat(respostas['questoesCorrecao']);
        }

        if (respostas['questoesParson'] != null) {
          materiais = materiais.concat(respostas['questoesParson']);
        }

        if (respostas['questoesRegex'] != null) {
          materiais = materiais.concat(respostas['questoesRegex']);
        }

        if (respostas['videosProgramacao'] != null) {
          materiais = materiais.concat(respostas['videosProgramacao']);
        }

        if (respostas['textosProgramacao'] != null) {
          materiais = materiais.concat(respostas['textosProgramacao']);
        }

        materiais = this.ordenarMaterialAprendizagem(materiais);

        observer.next(materiais);
        observer.complete();
      });
    });
  }

  definirSequenciaQuestoes(questoes: any[]) {
    // Definir a sequência a partir da posição no array
    for (let i = 0; i < questoes.length; i = i + 1) {
      if (
        questoes[i] instanceof QuestaoFechada ||
        questoes[i] instanceof QuestaoProgramacao ||
        questoes[i] instanceof QuestaoParsonProblem ||
        questoes[i] instanceof QuestaoProgramacaoRegex ||
        questoes[i] instanceof QuestaoProgramacaoCorrecao
      ) {
        if (questoes[i].sequencia != null) {
          questoes[i].sequencia = i + 1;
        }

        if (questoes[i].dificuldade === undefined) {
          questoes[i].dificuldade = 1;
        }
      }
    }

    const questoesFechadas = [];
    const questoesProgramacao = [];
    const questoesParson = [];
    const questoesRegex = [];
    const questoesProgramacaoCorrecao = [];

    questoes.forEach((questao) => {
      if (questao instanceof QuestaoFechada) {
        questoesFechadas.push(questao);
      } else if (questao instanceof QuestaoProgramacao) {
        questoesProgramacao.push(questao);
      } else if (questao instanceof QuestaoParsonProblem) {
        questoesParson.push(questao);
      } else if (questao instanceof QuestaoProgramacaoRegex) {
        questoesRegex.push(questao);
      } else if (questao instanceof QuestaoProgramacaoCorrecao) {
        questoesProgramacaoCorrecao.push(questao);
      }
    });

    this.questoesFechadas = questoesFechadas;
    this.questoesProgramacao = questoesProgramacao;
    this.questoesParson = questoesParson;
    this.questoesRegex = questoesRegex;
    this.questoesCorrecao = questoesProgramacaoCorrecao;
  }

  toJson() {
    const document = this.objectToDocument();

    return JSON.stringify(document);
  }

  getUltimaSequencia():Promise<number> {
    return new Observable<number>(observable=>{
      this.getAllMateriaisAprendizagem().subscribe(materiais=>{
        observable.next(materiais.length);
        observable.complete();
      })
    }).toPromise();
  }

  /* Retorna as questões de um assunto ordenadas por sua sequência. */
  ordenarQuestoes() {


    let todasQuestoes = [].concat(this.questoesCorrecao,
                                  this.questoesFechadas,
                                  this.questoesParson,
                                  this.questoesProgramacao,
                                  this.questoesRegex);
    todasQuestoes = Assunto.ordenar(todasQuestoes);
    return todasQuestoes;
  }

  /* ordenarMateriais() {
    let materiais = new Array(
      this.questoesFechadas.length + this.questoesProgramacao.length + this.questoesParson.length+this.questoesRegex.length+this.questoesCorrecao.length+this.videos.length
    );

    materiais = materiais.fill(0);

    this.questoesFechadas.forEach((questao) => {
      materiais[questao.sequencia - 1] = questao;
    });

    this.questoesProgramacao.forEach((questao) => {
      materiais[questao.sequencia - 1] = questao;
    });

    this.questoesParson.forEach((questao) => {
      materiais[questao.sequencia - 1] = questao;
    });


    this.questoesRegex.forEach((questao) => {
      materiais[questao.sequencia - 1] = questao;
    });

    this.questoesCorrecao.forEach((questao) => {
      materiais[questao.sequencia - 1] = questao;
    });

    this.videos.forEach((video) => {
      materiais[video.sequencia - 1] = video;
    });

    return materiais;
  } */

  /**
   * Retorna a próxima questão sabendo qual está atualmente.
   */
  proximaQuestao(questaoAtual) {
    const questoesOrdenadas = this.ordenarQuestoes();
    const proximaQuestao = questoesOrdenadas.filter(
      (questao) => questao.sequencia == questaoAtual.sequencia + 1
    );
    return proximaQuestao.length > 0 ? proximaQuestao[0] : null;
  }

  objectToDocument() {
    const document = super.objectToDocument();

    if (Array.isArray(this.questoesProgramacao) != null
      && this.questoesProgramacao.length > 0) {
      const questoes = [];
      this.questoesProgramacao.forEach((questao) => {
        if (typeof questao.objectToDocument === 'function') {
          questoes.push(questao.objectToDocument());
        }
      });

      document['questoesProgramacao'] = questoes;
    }

    if (Array.isArray(this.questoesFechadas) != null && this.questoesFechadas.length > 0) {
      const questoesFechadas = [];
      this.questoesFechadas.forEach((questao) => {
        if (typeof questao.objectToDocument === 'function') {
          questoesFechadas.push(questao.objectToDocument());
        }
      });

      document['questoesFechadas'] = questoesFechadas;
    }

    if (Array.isArray(this.questoesParson) && this.questoesParson.length > 0) {
      const questoesParson = [];
      this.questoesParson.forEach((questao) => {
        if (typeof questao.objectToDocument === 'function') {
          questoesParson.push(questao.objectToDocument());
        }
      });

      document['questoesParson'] = questoesParson;
    }

    if (Array.isArray(this.questoesColaborativas) && this.questoesColaborativas.length > 0) {
      const questoesColaborativas = [];
      this.questoesColaborativas.forEach((questao) => {
        if (typeof questao.objectToDocument === 'function') {
          questoesColaborativas.push(questao.objectToDocument());
        }
      });

      document['questoesColaborativas'] = questoesColaborativas;
    }

    if (Array.isArray(this.questoesRegex) && this.questoesRegex.length > 0) {
      const questoesRegex = [];
      this.questoesRegex.forEach((questao) => {
        if (typeof questao.objectToDocument === 'function') {
          questoesRegex.push(questao.objectToDocument());
        }
      });

      document['questoesRegex'] = questoesRegex;
    }

    if (Array.isArray(this.questoesCorrecao) && this.questoesCorrecao.length > 0) {
      const questoesCorrecao = [];
      this.questoesCorrecao.forEach((questao) => {
        if (typeof questao.objectToDocument === 'function') {
          questoesCorrecao.push(questao.objectToDocument());
        }
      });

      document['questoesCorrecao'] = questoesCorrecao;
    }

    return document;
  }

  getQuestaoProgramacaoById(questaoId): QuestaoProgramacao {
    let questaoLocalizada = null;
    this.questoesProgramacao.forEach((questao) => {
      if (questao.id == questaoId) {
        questaoLocalizada = questao;
      }
    });

    return questaoLocalizada;
  }

  getQuestaoColaborativaById(questaoId): QuestaoColaborativa | null {
    let questaoLocalizada = null;
    this.questoesColaborativas.forEach((questao) => {
      if (questao.id == questaoId) {
        questaoLocalizada = questao;
      }
    });

    return questaoLocalizada;
  }

  getQuestaoFechadaById(questaoId) {
    let questaoLocalizada = null;
    this.questoesFechadas.forEach((questao) => {
      if (questao.id == questaoId) {
        questaoLocalizada = questao;
      }
    });

    return questaoLocalizada;
  }

  getQuestaoParsonById(questaoId) {
    let questaoLocalizada = null;
    this.questoesParson.forEach((questao) => {
      if (questao.id == questaoId) {
        questaoLocalizada = questao;
      }
    });

    return questaoLocalizada;
  }

  getQuestaoRegexById(questaoId) {
    let questaoLocalizada = null;
    this.questoesRegex.forEach((questao) => {
      if (questao.id == questaoId) {
        questaoLocalizada = questao;
      }
    });

    return questaoLocalizada;
  }

  validar() {
    if (this.nome == undefined || this.nome == null) {
      return false;
    }

    return true;
  }
}
