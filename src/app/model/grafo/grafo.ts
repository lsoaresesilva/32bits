import { Edge, Node } from '@swimlane/ngx-graph';
import { Observable } from 'rxjs';
import PageTrackRecord from '../analytics/pageTrack';
import Query from '../firestore/query';
import Usuario from '../usuario';
import { Util } from '../util';

export default class Grafo {
  constructor(private pageTracks) {}

  static noExiste(nos: Node[], novoNo) {
    if (Array.isArray(nos)) {
      nos.forEach((no) => {
        if (novoNo == no.id) {
          return true;
        }
      });
    }

    return false;
  }

  static inserirNo(nos: Node[], novoNo) {
    if (!Grafo.noExiste(nos, novoNo)) {
      nos.push({ id: novoNo, label: novoNo });
    }
  }

  static construirGrafo(matriz: Map<string, Map<string, number>>) {
    function makeid(length) {
      var result = '';
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }
    let nos: Node[] = [];
    let arestas: Edge[] = [];
    let _this = this;
    matriz.forEach((targets, source) => {
      Grafo.inserirNo(nos, source);
      targets.forEach(function (probabilidade, target) {
        Grafo.inserirNo(nos, target);
        arestas.push({
          id: makeid(4),
          source: source,
          target: target,
          label: probabilidade.toString(),
        });
      });
    });

    return { nos: nos, arestas: arestas };
  }

  criarMatrizTransicao(tracks, estados, tempoVisuMonitoramento, totalVisuSelfMonitoramento, tempoVisuSelfPlanejamento, tempoVisuSelfMonitoramento) {
    for (let i = 0; i < tracks.length; i++) {
      let source = tracks[i].pagina; // De onde ele estava
      let target = tracks[i + 1]; // Para onde ele foi
      if (target != undefined) {
        target = tracks[i + 1].pagina;
        let proximoProximo = null;
        if (tracks[i + 2] != null) {
          proximoProximo = tracks[i + 2].pagina;
        }

        if (
          proximoProximo == 'visualizar-assunto' &&
          source == 'editor' &&
          target == 'self-instruction'
        ) {
          console.log('Só retornou ao assunto via self-instruction');
        }else if(

          proximoProximo == 'editor' &&
          source == 'editor' &&
          target == 'self-instruction'
        ) {
          let trackSource = tracks[i];
          let trackTarget = tracks[i+1];

          let visu = totalVisuSelfMonitoramento.get(trackTarget.estudanteId);
          if (visu == null) {
            totalVisuSelfMonitoramento.set(trackTarget.estudanteId, 0);
          }

          let totalNovo = totalVisuSelfMonitoramento.get(trackTarget.estudanteId);
          totalVisuSelfMonitoramento.set(trackTarget.estudanteId, totalNovo+1);

          // Computo to dempo

          let t = tempoVisuSelfMonitoramento.get(trackSource.estudante.pk());
          if (t == null) {
            tempoVisuSelfMonitoramento.set(trackSource.estudante.pk(), 0);
          }

          let dateSource = Util.firestoreDateToDate(trackSource.data);
          let dateTarget = Util.firestoreDateToDate(trackTarget.data);
          if(dateSource.getDate() == dateTarget.getDate()){
            let difTime = (dateTarget.getTime() - dateSource.getTime())/1000;

            let totalNovo = tempoVisuSelfMonitoramento.get(trackSource.estudante.pk());
            tempoVisuSelfMonitoramento.set(trackSource.estudante.pk(), totalNovo + difTime);
          }

        }else {

          if(source == "index" || source == "meu-desempenho"){
            let trackSource = tracks[i];
            let trackTarget = tracks[i+1];
            let visu = tempoVisuMonitoramento.get(trackTarget.estudanteId);
            if (visu == null) {
              tempoVisuMonitoramento.set(trackTarget.estudante.pk(), 0);
            }

            let dateSource = Util.firestoreDateToDate(trackSource.data);
            let dateTarget = Util.firestoreDateToDate(trackTarget.data);
            if(dateSource.getDate() == dateTarget.getDate()){
              let difTime = (dateTarget.getTime() - dateSource.getTime())/1000;

              let totalNovo = tempoVisuMonitoramento.get(trackSource.estudante.pk());
              tempoVisuMonitoramento.set(trackSource.estudante.pk(), totalNovo + difTime);
            }
          }

          if(source == "self-instruction" && target == "editor"){
            let trackSource = tracks[i];
            let trackTarget = tracks[i+1];
            let visu = tempoVisuSelfPlanejamento.get(trackSource.estudante.pk());
            if (visu == null) {
              tempoVisuSelfPlanejamento.set(trackSource.estudante.pk(), 0);
            }

            let dateSource = Util.firestoreDateToDate(trackSource.data);
            let dateTarget = Util.firestoreDateToDate(trackTarget.data);
            if(dateSource.getDate() == dateTarget.getDate()){
              let difTime = (dateTarget.getTime() - dateSource.getTime())/1000;

              let totalNovo = tempoVisuSelfPlanejamento.get(trackSource.estudante.pk());
              tempoVisuSelfPlanejamento.set(trackSource.estudante.pk(), totalNovo + difTime);
            }

          }

          /* Núcleo do algoritmo está aqui. */
          let estado = estados.get(source);
          if (estado == null) {
            estados.set(source, new Map());
          }
          let totalNovo = estados.get(source).get(target);
          if (totalNovo == null) {
            estados.get(source).set(target, 0);
          }
          totalNovo = estados.get(source).get(target);
          estados.get(source).set(target, totalNovo + 1);
          /* Fim Código novo */
        }
      }
    }
  }

  private calcularTotalAcessos(estado, matrizEstados) {
    let n = 0;
    matrizEstados.forEach(function (targets, source) {
      if (source == estado) {
        targets.forEach(function (value, key) {
          n += value;
        });
      }
    });

    return n;
  }

  criar() {
    let tempoVisuSelfPlanejamento = new Map<string, number>();
    let tempoVisuSelfMonitoramento = new Map<string, number>();
    let totalVisuIndex = new Map<string, number>();
    let totalVisuSelfMonitoramento = new Map<string, number>();
    let tempoVisuDesempenho = new Map<string, number>();
    if (this.pageTracks != null) {
      let dias = new Map<string, any[]>();
      let matriz = []; /* new Map<string, any[]>(); */

      // Agrupa todos os pagetracks pelo dia em que a ação ocorreu.
      this.pageTracks.forEach((track) => {
        let dataDoTrack = track.data.toDate();
        let mesDia = dataDoTrack.getDate().toString() + '/' + dataDoTrack.getMonth().toString();
        let hasDia = dias.get(mesDia);
        if (hasDia == null) {
          dias.set(mesDia, []);
        }

        hasDia = dias.get(mesDia);
        hasDia.push(track);
      });
      /**
       * Ordena os dias do mais antigo para o mais recente
       */

      dias.forEach((dia) => {
        dia.sort(function (a, b) {
          let dataA = a.data.toDate();
          let dataB = b.data.toDate();
          if (dataA < dataB) {
            return -1;
          }

          if (dataA > dataB) {
            return 1;
          }

          return 0;
        });
      });

      /* Extrai todas as páginas visitadas em cada dia
                    Adiciona, dia por dias, em uma matriz */

      dias.forEach((dia) => {
        let m = [];
        dia.forEach((track) => {
          m.push(track);
        });
        matriz.push(m);
      });

      let estados = new Map<string, Map<string, number>>();

      /* Cria uma matriz que indica de um determinado local para onde o aluno foi
           É incluída uma probabilidade dele ter ido de um local para outro dado as vezes em que ele fez isso.
       */

      let totalTracks = 0;

      matriz.forEach((mTrack) => {
        totalTracks += mTrack.length;
        this.criarMatrizTransicao(mTrack, estados, tempoVisuDesempenho, totalVisuSelfMonitoramento, tempoVisuSelfPlanejamento, tempoVisuSelfMonitoramento);
      });

      /* Código novo */

      let probabilidades = new Map<string, Map<string, number>>();
      estados.forEach((targets, source) => {
        probabilidades.set(source, new Map());
        let totalAcessos = this.calcularTotalAcessos(source, estados);
        targets.forEach(function (contagem, target) {
          let probabilidade = Math.round((contagem / totalAcessos) * 100) / 100;
          probabilidades.get(source).set(target, probabilidade);
        });
      });

      return probabilidades;
    }
  }
}
