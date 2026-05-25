export interface Pessoa {
  id: number | string;
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  endereco?: string;
  avatar?: string;
}

export interface Produto {
  id: number;
  nome: string;
  slug?: string;
  preco: string;
  imagem: string;
  descricao?: string;
}
