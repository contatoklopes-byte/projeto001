import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from './auth-service';
import { Produto } from '../model/tipos';

export interface CarrinhoItem {
  id?: string;
  produto: Produto;
  quantidade: number;
}

export interface CompraFeita {
  id: string;
  itens: CarrinhoItem[];
  data: string;
  total: number;
  usuarioId?: number | string;
  usuarioEmail?: string;
  usuarioNome?: string;
}

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  public itens = signal<CarrinhoItem[]>([]);
  public comprasFeitas = signal<CompraFeita[]>([]);
  private readonly STORAGE_KEY = 'app_carrinho';
  private readonly COMPRAS_KEY = 'app_compras_feitas';
  private readonly API_BASE = 'http://localhost:3000';
  private readonly CARRINHO_API = `${this.API_BASE}/carrinho`;
  private readonly COMPRA_FEITA_API = `${this.API_BASE}/compraFeita`;

  constructor(private http: HttpClient, private auth: AuthService) {
    this.carregarCarrinho();
    this.carregarComprasFeitas();

    let usuarioAnterior = this.auth.obterUsuarioLogado();
    this.auth.usuarioLogado$.subscribe((usuario) => {
      if (usuarioAnterior && !usuario) {
        this.limpar();
      }
      usuarioAnterior = usuario;
    });
  }

  private carregarCarrinho(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        this.itens.set(JSON.parse(raw));
        return;
      } catch {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }

    this.http
      .get<CarrinhoItem[]>(this.CARRINHO_API)
      .pipe(catchError(() => of([])))
      .subscribe((items) => {
        this.itens.set(items);
        this.salvarCarrinho();
      });
  }

  private carregarComprasFeitas(): void {
    const raw = localStorage.getItem(this.COMPRAS_KEY);
    if (raw) {
      try {
        this.comprasFeitas.set(JSON.parse(raw));
        return;
      } catch {
        localStorage.removeItem(this.COMPRAS_KEY);
      }
    }

    this.http
      .get<CompraFeita[]>(this.COMPRA_FEITA_API)
      .pipe(catchError(() => of([])))
      .subscribe((compras) => {
        this.comprasFeitas.set(compras);
        this.salvarComprasFeitas();
      });
  }

  private salvarCarrinho(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.itens()));
  }

  private salvarComprasFeitas(): void {
    localStorage.setItem(this.COMPRAS_KEY, JSON.stringify(this.comprasFeitas()));
  }

  listarItens(): CarrinhoItem[] {
    return this.itens();
  }

  adicionar(produto: Produto, quantidade = 1): void {
    const itens = this.itens();
    const idx = itens.findIndex((i) => i.produto.id === produto.id);

    if (idx >= 0) {
      const copia = itens.slice();
      copia[idx] = { ...copia[idx], quantidade: copia[idx].quantidade + quantidade };
      this.itens.set(copia);
      this.atualizarItemNoBanco(copia[idx]);
    } else {
      const novoItem: CarrinhoItem = { id: this.gerarIdRegistro(), produto, quantidade };
      this.itens.set([...itens, novoItem]);
      this.adicionarItemNoBanco(novoItem);
    }

    this.salvarCarrinho();
  }

  remover(produtoId: number): void {
    const item = this.itens().find((i) => i.produto.id === produtoId);
    if (item?.id) {
      this.http.delete(`${this.CARRINHO_API}/${item.id}`).subscribe({});
    }

    this.itens.set(this.itens().filter((i) => i.produto.id !== produtoId));
    this.salvarCarrinho();
  }

  limpar(): void {
    const deletos = this.itens().filter((item) => item.id).map((item) => item.id as string);
    deletos.forEach((id) => {
      this.http.delete(`${this.CARRINHO_API}/${id}`).subscribe({});
    });

    this.itens.set([]);
    this.salvarCarrinho();
  }

  finalizarCompra(): void {
    const itens = this.itens();
    if (itens.length === 0) {
      return;
    }

    const usuario = this.auth.obterUsuarioLogado();
    if (!usuario) {
      return;
    }

    const compra: CompraFeita = {
      id: this.gerarIdCompra(),
      itens,
      data: new Date().toISOString(),
      total: this.calcularTotal(itens),
      usuarioId: usuario.id,
      usuarioEmail: usuario.email,
      usuarioNome: usuario.nome,
    };

    this.http.post<CompraFeita>(this.COMPRA_FEITA_API, compra).pipe(
      tap((novaCompra) => {
        this.comprasFeitas.set([...this.comprasFeitas(), novaCompra]);
        this.salvarComprasFeitas();
        this.limpar();
      }),
      catchError(() => of(null))
    ).subscribe({});
  }

  listarComprasFeitas(): CompraFeita[] {
    return this.comprasFeitas();
  }

  totalQuantidade(): number {
    return this.itens().reduce((s, i) => s + i.quantidade, 0);
  }

  calcularTotalPedido(): number {
    return this.calcularTotal(this.itens());
  }

  private atualizarItemNoBanco(item: CarrinhoItem): void {
    if (!item.id) {
      this.adicionarItemNoBanco(item);
      return;
    }

    this.http.patch<CarrinhoItem>(`${this.CARRINHO_API}/${item.id}`, item).pipe(catchError(() => of(item))).subscribe();
  }

  private adicionarItemNoBanco(item: CarrinhoItem): void {
    this.http.post<CarrinhoItem>(this.CARRINHO_API, item).pipe(
      tap((salvo) => {
        const itens = this.itens().map((i) => (i.produto.id === salvo.produto.id ? salvo : i));
        this.itens.set(itens);
        this.salvarCarrinho();
      }),
      catchError(() => of(item))
    ).subscribe();
  }

  private calcularTotal(itens: CarrinhoItem[]): number {
    return itens.reduce((total, item) => {
      const valor = this.parsePreco(item.produto.preco);
      return total + valor * item.quantidade;
    }, 0);
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

  private gerarIdCompra(): string {
    return `compra_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private gerarIdRegistro(): string {
    return `carrinho_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
