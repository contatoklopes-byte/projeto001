import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Admin } from './pages/admin/admin';
import { ManutencaoProdutos } from './pages/manutenção/manutencao-produtos/manutencao-produtos';
import { ManutencaoUsuarios } from './pages/manutenção/manutencao-usuarios/manutencao-usuarios';
import { Cadastro } from './pages/cadastro/cadastro';
import { ProdutoDetalhe } from './pages/produto-detalhe/produto-detalhe';
import { Perfil } from './pages/perfil/perfil';
import { Carrinho } from './pages/carrinho/carrinho';
import { AuthGuard } from './service/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'produto/:slug', component: ProdutoDetalhe },
  { path: 'carrinho', component: Carrinho, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'cadastro', component: Cadastro },
  { path: 'perfil', component: Perfil, canActivate: [AuthGuard] },
  { path: 'admin', component: Admin, canActivate: [AuthGuard] },
  { path: 'manutencao-produtos', component: ManutencaoProdutos, canActivate: [AuthGuard] },
  { path: 'manutencao-usuarios', component: ManutencaoUsuarios, canActivate: [AuthGuard] }
];
