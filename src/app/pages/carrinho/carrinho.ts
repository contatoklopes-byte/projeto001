import { Component } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarrinhoService, CarrinhoItem } from '../../service/carrinho';
import { ProdutoService } from '../../service/produto-service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, RouterModule],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css',
})
export class Carrinho {
  constructor(
    public carrinhoService: CarrinhoService,
    private produtoService: ProdutoService
  ) {}

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  private parsePreco(preco: string): number {
    let valor = preco.replace(/[^0-9,\.]/g, ''); // Remove tudo que não é número, vírgula ou ponto

    // Se há ponto mas não há vírgula, o ponto é separador de milhares
    if (valor.includes('.') && !valor.includes(',')) {
      valor = valor.replace(/\./g, ''); // Remove separador de milhares
    } else if (valor.includes(',') && valor.includes('.')) {
      // Se há ambos, ponto é milhares e vírgula é decimal
      valor = valor.replace(/\./g, '').replace(',', '.');
    } else if (valor.includes(',')) {
      // Se só há vírgula, é o separador decimal
      valor = valor.replace(',', '.');
    }

    return Number(valor);
  }

  calcularSubtotalItem(item: CarrinhoItem): number {
    const valor = this.parsePreco(item.produto.preco);
    return valor * item.quantidade;
  }

  remover(item: CarrinhoItem): void {
    this.carrinhoService.remover(item.produto.id);
    this.produtoService.adicionarAoCatalogo(item.produto.id);
  }

  limpar(): void {
    this.carrinhoService.listarItens().forEach(item => {
      this.produtoService.adicionarAoCatalogo(item.produto.id);
    });
    this.carrinhoService.limpar();
  }

  finalizarCompra(): void {
    this.carrinhoService.finalizarCompra();
  }
}
