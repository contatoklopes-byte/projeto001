import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { Produto } from '../model/tipos';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private readonly API = '/databases/databases.json';
  private readonly STORAGE_KEY = 'produtos_removidos';
  private produtosRemovidos = new Set<number>();
  private carregou = false;
  private produtosTodos: Produto[] = [];

  // Signal para rastrear mudanças nos produtos removidos
  produtosRemovido$ = signal<number[]>([]);
  produtosDisponiveis$ = signal<Produto[]>([]);

  constructor(private http: HttpClient) {
    this.resetarRemovidosNoInicio();
    this.carregarRemovidos();
  }

  private resetarRemovidosNoInicio(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.produtosRemovidos.clear();
    this.produtosRemovido$.set([]);
  }

  private carregarRemovidos(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return;

    try {
      const ids: number[] = JSON.parse(raw);
      ids.forEach((id) => this.produtosRemovidos.add(id));
      this.produtosRemovido$.set(ids);
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private salvarRemovidos(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this.produtosRemovidos]));
    this.produtosRemovido$.set([...this.produtosRemovidos]);
  }

  private slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/(^-|-$)/g, '');
  }

  private processarProdutos(produtos: Array<{ id: string; nome: string; preco: string; imagem: string; descricao?: string; }>): Produto[] {
    return produtos.map((produto) => ({
      id: Number(produto.id),
      nome: produto.nome,
      slug: this.slugify(produto.nome),
      preco: produto.preco,
      imagem: produto.imagem,
      descricao: produto.descricao,
    }));
  }

  carregar(): Observable<Produto[]> {
    if (this.carregou) {
      return of(this.atualizarDisponiveis());
    }

    return this.http
      .get<{
        produtos: Array<{
          id: string;
          nome: string;
          preco: string;
          imagem: string;
          descricao?: string;
        }>;
      }>(this.API)
      .pipe(
        map((response) => this.processarProdutos(response.produtos)),
        tap((produtos) => {
          this.produtosTodos = produtos;
          this.carregou = true;
          this.atualizarDisponiveis();
        })
      );
  }

  private atualizarDisponiveis(): Produto[] {
    const disponiveis = this.produtosTodos.filter((produto) => !this.produtosRemovidos.has(produto.id));
    this.produtosDisponiveis$.set(disponiveis);
    return disponiveis;
  }

  listar(): Observable<Produto[]> {
    if (this.carregou) {
      return of(this.atualizarDisponiveis());
    }

    return this.carregar();
  }

  listarPorSlug(slug: string): Observable<Produto | undefined> {
    if (this.carregou) {
      const produtoDisponivel = this.produtosTodos.find((produto) => produto.slug === slug && !this.produtosRemovidos.has(produto.id));
      const produtoRemovido = this.produtosTodos.find((produto) => produto.slug === slug);
      return of(produtoDisponivel ?? produtoRemovido);
    }

    return this.carregar().pipe(
      map((produtos) => produtos.find((produto) => produto.slug === slug))
    );
  }

  listarPorId(id: number): Observable<Produto | undefined> {
    if (this.carregou) {
      const produtoDisponivel = this.produtosTodos.find((produto) => produto.id === id && !this.produtosRemovidos.has(produto.id));
      const produtoRemovido = this.produtosTodos.find((produto) => produto.id === id);
      return of(produtoDisponivel ?? produtoRemovido);
    }

    return this.carregar().pipe(
      map((produtos) => produtos.find((produto) => produto.id === id))
    );
  }

  removerDoCatalogo(id: number): void {
    this.produtosRemovidos.add(id);
    this.salvarRemovidos();
    this.atualizarDisponiveis();
  }

  adicionarAoCatalogo(id: number): void {
    this.produtosRemovidos.delete(id);
    this.salvarRemovidos();
    this.atualizarDisponiveis();
  }

  criar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.API, produto);
  }

  atualizar(id: number, produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.API}/${id}`, produto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
