import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../service/auth-service';
import { PessoaService } from '../../service/pessoa-service';
import { CarrinhoService } from '../../service/carrinho';
import { Pessoa } from '../../model/tipos';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgForOf],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class Perfil implements OnInit {
  public usuario?: Pessoa;
  public isLoading = true;
  public errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private pessoaService: PessoaService,
    public carrinhoService: CarrinhoService
  ) {}

  ngOnInit(): void {
    const usuarioAutenticado = this.authService.obterUsuarioLogado();
    console.log('Perfil: usuário autenticado recuperado', usuarioAutenticado);

    if (!usuarioAutenticado) {
      console.warn('Perfil: nenhum usuário autenticado encontrado, redirecionando para login');
      this.router.navigate(['/login']);
      return;
    }

    const usuarioId = usuarioAutenticado.id;
    console.log('Perfil: ID enviado para API', usuarioId);

    this.pessoaService
      .buscarPorId(usuarioId)
      .pipe(
        catchError((error) => {
          console.error('Perfil: erro ao carregar perfil da API', error);
          this.errorMessage = 'Não foi possível carregar o perfil. Tente novamente mais tarde.';
          this.isLoading = false;
          return of(undefined);
        })
      )
      .subscribe((usuario) => {
        console.log('Perfil: resposta da API', usuario);

        if (!usuario) {
          this.errorMessage = 'Perfil não encontrado na base de dados.';
          this.isLoading = false;
          return;
        }

        this.usuario = usuario;
        this.isLoading = false;
      });
  }

  public get historicoCompras() {
    const usuarioId = this.usuario?.id?.toString();
    return this.carrinhoService
      .listarComprasFeitas()
      .filter((compra) => compra.usuarioId?.toString() === usuarioId);
  }

  public formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  public formatarData(data: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(data));
  }
}
