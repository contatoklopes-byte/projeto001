import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProdutoService } from '../../service/produto-service';
import { Produto } from '../../model/tipos';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private produtoService: ProdutoService) {
    this.carregarProdutos();
  }

  get produtos() {
    return this.produtoService.produtosDisponiveis$;
  }

  private carregarProdutos(): void {
    this.produtoService.listar().subscribe({
      error: erro => console.error('Erro ao carregar produtos:', erro)
    });
  }
}
