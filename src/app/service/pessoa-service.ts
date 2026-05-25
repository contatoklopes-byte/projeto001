import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Pessoa } from '../model/tipos';

@Injectable({
  providedIn: 'root',
})
export class PessoaService {

  private readonly API = 'http://localhost:3000/pessoas'

  constructor(private http: HttpClient) { }

  //Funções CRUD

  listar(): Observable<Pessoa[]> {
    return this.http.get<Pessoa[]>(this.API)
  }

  incluir(pessoa: Pessoa): Observable<Pessoa> {
    return this.http.post<Pessoa>(this.API, pessoa)
  }

  editar(pessoa: Pessoa): Observable<Pessoa> {
    const url = `${this.API}/${pessoa.id}`
    return this.http.put<Pessoa>(url, pessoa)
  }

  excluir(id: number | string): Observable<Pessoa> {
    return this.http.delete<Pessoa>(this.API + `/${id}`);
  }
  
  // Função de login

    login(email: string, senha: string): Observable<Pessoa | undefined> {
    const params = new HttpParams().set('email', email);
    return this.http.get<Pessoa[]>(this.API, { params }).pipe(
      map((pessoas) => pessoas.find((usuario) => usuario.email.toLowerCase() === email.toLowerCase() && usuario.senha === senha))
    );
  }

  buscarPorEmail(email: string): Observable<Pessoa | undefined> {
    const params = new HttpParams().set('email', email);
    return this.http.get<Pessoa[]>(this.API, { params }).pipe(
      map((pessoas) => pessoas[0])
    );
  }

  buscarPorId(id: number | string): Observable<Pessoa | undefined> {
    const url = `${this.API}/${id}`;
    return this.http.get<Pessoa>(url).pipe(
      catchError(() => of(undefined))
    );
  }
}
