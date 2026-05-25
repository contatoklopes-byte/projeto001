import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProdutoService } from '../../service/produto-service';
import { CarrinhoService } from '../../service/carrinho';
import { Produto } from '../../model/tipos';

@Component({
  selector: 'app-produto-detalhe',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './produto-detalhe.html',
  styleUrl: './produto-detalhe.css',
})
export class ProdutoDetalhe {
  produto = signal<Produto | null>(null);
  erro = signal<string | null>(null);
  carregando = signal(true);

  constructor(
    private produtoService: ProdutoService,
    private route: ActivatedRoute,
    private router: Router,
    private carrinho: CarrinhoService
  ) {
    this.carregarProduto();
  }

  comprar(): void {
    const p = this.produto();
    if (!p) return;

    this.produtoService.removerDoCatalogo(p.id);
    this.carrinho.adicionar(p, 1);
    this.router.navigate(['/carrinho']);
  }

  private carregarProduto(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');

      if (!slug) {
        this.erro.set('Produto inválido.');
        this.carregando.set(false);
        return;
      }

      this.produtoService.listarPorSlug(slug).subscribe({
        next: (produto) => {
          if (produto) {
            this.produto.set(produto);
          } else {
            this.erro.set('Produto não encontrado.');
          }
          this.carregando.set(false);
        },
        error: (erro) => {
          console.error('Erro ao carregar produto:', erro);
          this.erro.set('Erro ao carregar produto.');
          this.carregando.set(false);
        },
      });
    });
  }
}
