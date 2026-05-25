import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PessoaService } from '../../../service/pessoa-service';
import { Pessoa } from '../../../model/tipos';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manutencao-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manutencao-usuarios.html',
  styleUrl: './manutencao-usuarios.css',
})
export class ManutencaoUsuarios implements OnInit {
  pessoas: Pessoa[] = [];
  pessoaForm: Pessoa = { id: 0, nome: '', email: '', senha: '' };
  editando = false;

  constructor(private pessoaService: PessoaService) {}

  ngOnInit(): void {
    this.carregarPessoas();
  }

  carregarPessoas(): void {
    this.pessoaService.listar().subscribe({
      next: (data) => this.pessoas = data,
      error: (error) => console.error('Erro ao carregar usuários', error)
    });
  }

  salvar(): void {
    if (this.editando) {
      this.pessoaService.editar(this.pessoaForm).subscribe({
        next: () => {
          this.carregarPessoas();
          this.cancelarEdicao();
        },
        error: (error) => console.error('Erro ao alterar usuário', error)
      });
      return;
    }

    this.pessoaService.incluir(this.pessoaForm).subscribe({
      next: () => {
        this.carregarPessoas();
        this.cancelarEdicao();
      },
      error: (error) => console.error('Erro ao cadastrar usuário', error)
    });
  }

  prepararEdicao(pessoa: Pessoa): void {
    this.pessoaForm = { ...pessoa };
    this.editando = true;
  }

  excluir(id: number): void {
    this.pessoaService.excluir(id).subscribe({
      next: () => this.carregarPessoas(),
      error: (error) => console.error('Erro ao excluir usuário', error)
    });
  }

  cancelarEdicao(): void {
    this.pessoaForm = { id: 0, nome: '', email: '', senha: '' };
    this.editando = false;
  }
}
