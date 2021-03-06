import { forkJoin, Observable } from 'rxjs';
import Usuario from '../usuario';
import { Util } from '../util';

export default class Grupo {

  niveisDificuldade;

  constructor(public id, public estudantes: Usuario[]) {
    if (this.id == null) {
      this.id = Util.uuidv4();
    }
  }

  objectToDocument() {
    let document = {id:this.id};
    if (Array.isArray(this.estudantes)) {
      document['estudantes'] = [];
      this.estudantes.forEach((estudante) => {
        document['estudantes'].push(estudante.pk());
      });
    }

    if(this.niveisDificuldade != null){

    }

    return document;
  }

  getEstudantes(){
    return new Observable<any[]>(observer=>{
      let consultaUsuarios = [];
      this.estudantes.forEach(estudante=>{
        consultaUsuarios.push(Usuario.get(estudante.pk()));
      })

      forkJoin(consultaUsuarios).subscribe(usuarios=>{
        observer.next(usuarios);
        observer.complete();
      })
    })
    
  }

  static construir(grupo:Grupo){
    let estudantes = [];
    if(Array.isArray(grupo.estudantes)){
      grupo.estudantes.forEach(estudante=>{
        estudantes.push(new Usuario(estudante, null, null, null, null, null));
      });
    }
    return new Grupo(grupo.id, estudantes);
  }

  validar(){

    if(Array.isArray(this.estudantes) && this.estudantes.length > 0){
      return true;
    }

    return false;
  }
}
