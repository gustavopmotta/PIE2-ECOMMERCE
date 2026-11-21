// Valida e limpa os dados que chegam do front. Os dados limpos ficam em req.dados.
const AppError = require('../utils/AppError');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRECO_MAXIMO = 99999999.99; // limite do numeric(10,2) do banco
const INTEIRO_MAXIMO = 1000000;

// ---------- funcoes auxiliares ----------

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Texto opcional: vazio vira null; texto grande demais gera erro.
function textoOpcional(valor, maximo, rotulo, erros) {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor !== 'string') {
    erros.push(`${rotulo} deve ser um texto.`);
    return null;
  }
  const limpo = valor.trim();
  if (limpo.length > maximo) {
    erros.push(`${rotulo} deve ter no máximo ${maximo} caracteres.`);
    return null;
  }
  return limpo === '' ? null : limpo;
}

// Aceita 39.9, "39.90" e "39,90".
function numeroDecimal(valor) {
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string' && valor.trim() !== '') {
    return Number(valor.trim().replace(',', '.'));
  }
  return NaN;
}

// Inteiro >= 0. Se nao vier nada, usa o valor padrao.
function inteiroOpcional(valor, padrao, rotulo, erros) {
  if (valor === undefined || valor === null || valor === '') return padrao;
  const numero = typeof valor === 'string' ? Number(valor.trim()) : valor;
  if (!Number.isInteger(numero) || numero < 0 || numero > INTEIRO_MAXIMO) {
    erros.push(`${rotulo} deve ser um número inteiro entre 0 e ${INTEIRO_MAXIMO}.`);
    return padrao;
  }
  return numero;
}

function falharSeHouverErros(erros, next) {
  if (erros.length > 0) {
    next(new AppError('Dados inválidos.', 400, erros));
    return true;
  }
  return false;
}

// ---------- usuarios ----------

function validarCadastro(req, res, next) {
  const corpo = req.body ?? {};

  const nome = texto(corpo.nome);
  const email = texto(corpo.email).toLowerCase();
  const senha = typeof corpo.senha === 'string' ? corpo.senha : '';
  // Guardamos so os numeros do telefone: "(71) 99999-8888" vira "71999998888".
  const telefone = texto(corpo.telefone).replace(/\D/g, '');

  const erros = [];
  if (nome.length < 2 || nome.length > 100) {
    erros.push('Nome deve ter entre 2 e 100 caracteres.');
  }
  if (!REGEX_EMAIL.test(email) || email.length > 150) {
    erros.push('E-mail inválido.');
  }
  if (senha.length < 6 || senha.length > 72) {
    erros.push('Senha deve ter entre 6 e 72 caracteres.');
  }
  if (telefone.length < 10 || telefone.length > 13) {
    erros.push('Telefone inválido. Informe o DDD e o número.');
  }

  if (falharSeHouverErros(erros, next)) return;

  req.dados = { nome, email, senha, telefone };
  next();
}

function validarLogin(req, res, next) {
  const corpo = req.body ?? {};

  const email = texto(corpo.email).toLowerCase();
  const senha = typeof corpo.senha === 'string' ? corpo.senha : '';

  if (!email || !senha) {
    return next(new AppError('Informe e-mail e senha.', 400));
  }

  req.dados = { email, senha };
  next();
}

// ---------- parametros da URL ----------

// Confere que os parametros (ex.: :id, :fotoId) sao inteiros positivos.
// Os valores ja convertidos ficam em req.ids.
function validarId(...nomes) {
  return (req, res, next) => {
    req.ids = {};
    for (const nome of nomes) {
      const valor = Number(req.params[nome]);
      if (!Number.isSafeInteger(valor) || valor <= 0) {
        return next(new AppError('Identificador inválido.', 400));
      }
      req.ids[nome] = valor;
    }
    next();
  };
}

// ---------- produtos ----------

// criacao = true: aceita tambem estoque_inicial (so existe ao cadastrar).
// O saldo do estoque nunca e editado por aqui: so por movimentacao.
function validarProduto(criacao) {
  return (req, res, next) => {
    const corpo = req.body ?? {};
    const erros = [];

    const nome = texto(corpo.nome);
    if (nome.length < 2 || nome.length > 150) {
      erros.push('Nome deve ter entre 2 e 150 caracteres.');
    }

    const preco = numeroDecimal(corpo.preco);
    if (!Number.isFinite(preco) || preco < 0 || preco > PRECO_MAXIMO) {
      erros.push('Preço inválido. Informe um valor maior ou igual a zero.');
    }

    const dados = {
      nome,
      descricao: textoOpcional(corpo.descricao, 2000, 'Descrição', erros),
      preco: Number.isFinite(preco) ? Math.round(preco * 100) / 100 : 0,
      categoria: textoOpcional(corpo.categoria, 80, 'Categoria', erros),
      tema: textoOpcional(corpo.tema, 80, 'Tema', erros),
      material: textoOpcional(corpo.material, 80, 'Material', erros),
      estoqueMinimo: inteiroOpcional(corpo.estoque_minimo, 0, 'Estoque mínimo', erros),
    };

    if (criacao) {
      dados.estoqueInicial = inteiroOpcional(corpo.estoque_inicial, 0, 'Estoque inicial', erros);
    }

    if (falharSeHouverErros(erros, next)) return;

    req.dados = dados;
    next();
  };
}

function validarOculto(req, res, next) {
  const corpo = req.body ?? {};
  if (typeof corpo.oculto !== 'boolean') {
    return next(new AppError('Informe "oculto" como true ou false.', 400));
  }
  req.dados = { oculto: corpo.oculto };
  next();
}

function validarFoto(req, res, next) {
  const corpo = req.body ?? {};
  const erros = [];

  const url = texto(corpo.url);
  let urlValida = false;
  try {
    const endereco = new URL(url);
    urlValida = ['http:', 'https:'].includes(endereco.protocol) && url.length <= 500;
  } catch (erro) {
    urlValida = false;
  }
  if (!urlValida) {
    erros.push('URL da foto inválida. Use um endereço http ou https com até 500 caracteres.');
  }

  const ordem = inteiroOpcional(corpo.ordem, 0, 'Ordem', erros);

  let principal = false;
  if (corpo.principal !== undefined && corpo.principal !== null) {
    if (typeof corpo.principal !== 'boolean') {
      erros.push('"principal" deve ser true ou false.');
    } else {
      principal = corpo.principal;
    }
  }

  if (falharSeHouverErros(erros, next)) return;

  req.dados = { url, ordem, principal };
  next();
}

module.exports = {
  validarCadastro,
  validarLogin,
  validarId,
  validarProduto,
  validarOculto,
  validarFoto,
};
