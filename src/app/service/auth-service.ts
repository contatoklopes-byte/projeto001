import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pessoa } from '../model/tipos';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usuarioLogado = new BehaviorSubject<Pessoa | null>(this.obterUsuarioDeLocalStorage());
  public usuarioLogado$ = this.usuarioLogado.asObservable();

  constructor() {}

  login(usuario: Pessoa): void {
    this.usuarioLogado.next(usuario);
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  }

  logout(): void {
    this.usuarioLogado.next(null);
    localStorage.removeItem('usuarioLogado');
  }

  estaLogado(): boolean {
    return this.usuarioLogado.value !== null;
  }

  obterUsuarioLogado(): Pessoa | null {
    return this.usuarioLogado.value;
  }

  private obterUsuarioDeLocalStorage(): Pessoa | null {
    const usuario = localStorage.getItem('usuarioLogado');
    return usuario ? JSON.parse(usuario) : null;
  }
}
