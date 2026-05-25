import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarrinhoService } from '../../service/carrinho';
import { AuthService } from '../../service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header {
  constructor(
    public carrinhoService: CarrinhoService,
    public authService: AuthService,
    private router: Router
  ) {}

  menuAberto = false;

  toggleMenu() {
    this.menuAberto = !this.menuAberto;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
