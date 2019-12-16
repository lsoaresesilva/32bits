import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginComponent } from './login/login.component';
import { UsuarioService } from './usuario.service';
import { FormsModule } from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {CardModule} from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { config } from 'process';
import { CadastrarCodigoTurmaComponent } from './cadastrar-codigo-turma/cadastrar-codigo-turma.component';

@NgModule({
  declarations: [
    LoginComponent,
    CadastrarCodigoTurmaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    CardModule,
    ToastModule,
    ButtonModule
  


    
  ],
  providers: [UsuarioService]
})
export class LoginModule { }
