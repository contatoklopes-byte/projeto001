import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProdutoService } from '../../../service/produto-service';
import { Produto } from '../../../model/tipos';

@Component({
  selector: 'app-manutencao-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manutencao-produtos.html',
  styleUrl: './manutencao-produtos.css'
})
export class ManutencaoProdutos {
  produtos = signal<Produto[]>([]);
  produtoForm = { id: 0, nome: '', preco: '', imagem: '' };
  editando = false;

  constructor(private produtoService: ProdutoService) {
    this.carregarProdutos();
  }

  private carregarProdutos(): void {
    this.produtoService.listar().subscribe({
      next: (produtos) => this.produtos.set(produtos),
      error: (erro) => console.error('Erro ao carregar produtos:', erro),
    });
  }

  salvar() {
    if (!this.produtoForm.nome || !this.produtoForm.preco || !this.produtoForm.imagem) {
      alert('Preencha todos os campos');
      return;
    }

    if (this.editando) {
      this.produtoService.atualizar(this.produtoForm.id, this.produtoForm as Produto).subscribe({
        next: () => {
          this.carregarProdutos();
          this.cancelarEdicao();
          alert('Produto atualizado com sucesso!');
        },
        error: (erro) => console.error('Erro ao atualizar produto:', erro),
      });
    } else {
      this.produtoService.criar(this.produtoForm as Produto).subscribe({
        next: () => {
          this.carregarProdutos();
          this.cancelarEdicao();
          alert('Produto cadastrado com sucesso!');
        },
        error: (erro) => console.error('Erro ao cadastrar produto:', erro),
      });
    }
  }

  prepararEdicao(produto: any) {
    this.produtoForm = { ...produto };
    this.editando = true;
  }

  excluir(id: number) {
    if (confirm('Deseja excluir este produto?')) {
      this.produtoService.deletar(id).subscribe({
        next: () => {
          this.carregarProdutos();
          alert('Produto excluído com sucesso!');
        },
        error: (erro) => console.error('Erro ao excluir produto:', erro),
      });
    }
  }

  cancelarEdicao() {
    this.produtoForm = { id: 0, nome: '', preco: '', imagem: '' };
    this.editando = false;
  }
}