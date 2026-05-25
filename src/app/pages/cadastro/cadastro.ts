import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PessoaService } from '../../service/pessoa-service';
import { AuthService } from '../../service/auth-service';
import { Pessoa } from '../../model/tipos';

@Component({
  selector: 'app-cadastro',
  imports: [RouterModule, FormsModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  private router = inject(Router);
  private pessoaService = inject(PessoaService);
  private authService = inject(AuthService);

  name = '';
  email = '';
  password = '';

  register() {
    if (!this.name || !this.email || !this.password) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const novaPessoa: Pessoa = {
      id: Math.random().toString(36).substr(2, 9),
      nome: this.name,
      email: this.email,
      senha: this.password,
    };

    this.pessoaService.incluir(novaPessoa).subscribe({
      next: (usuario) => {
        this.authService.login(usuario);
        alert(`Usuário ${usuario.nome} registrado com sucesso!`);
        this.limparFormulario();
        this.router.navigate(['/home']);
      },
      error: () => {
        alert('Erro ao registrar usuário. Tente novamente mais tarde.');
      },
    });
  }

  limparFormulario() {
    this.name = '';
    this.email = '';
    this.password = '';
  }
}


