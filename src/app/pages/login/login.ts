import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PessoaService } from '../../service/pessoa-service';
import { AuthService } from '../../service/auth-service';

@Component({
  selector: 'app-login',
  imports: [RouterModule, FormsModule],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private pessoaService = inject(PessoaService);
  private authService = inject(AuthService);

  email = '';
  password = '';

  // Credenciais de admin
  private adminEmail = 'admin@vista.com';
  private adminPassword = 'admin123';

  loginUser() {
    const email = this.email.trim();
    const password = this.password;

    if (!email || !password) {
      alert('Por favor, informe email e senha para entrar.');
      return;
    }

    this.pessoaService.login(email, password).subscribe({
      next: (usuario) => {
        if (usuario) {
          this.authService.login(usuario);
          alert(`Bem-vindo(a), ${usuario.nome}! Login realizado com sucesso.`);
          this.router.navigate(['/home']);
        } else {
          alert('Usuário ou senha inválidos. Verifique seus dados e tente novamente.');
        }
      },
      error: () => {
        alert('Erro ao conectar com a API. Tente novamente mais tarde.');
      },
    });
  }

  loginAsAdmin() {
    if (this.email === this.adminEmail && this.password === this.adminPassword) {
      const usuarioAdmin: any = {
        id: 'admin',
        nome: 'Administrador',
        email: this.adminEmail,
        senha: this.adminPassword,
      };
      this.authService.login(usuarioAdmin);
      this.router.navigate(['/admin']);
      alert('Bem Vindo! Administrador logado com sucesso!');
    } else {
      alert('Acesso negado! Use as credenciais de admin para entrar como administrador.');
    }
  }
}


