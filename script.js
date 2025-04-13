class Personagem {
  constructor(id, nome, nomeAventureiro, classe, level, forcaBase, defesaBase) {
    const classesValidas = ["Guerreiro", "Mago", "Arqueiro", "Ladino", "Bardo"];
    if (!classesValidas.includes(classe)) {
      throw new Error("Classe inválida. Escolha entre: " + classesValidas.join(", "));
    }

    if ((forcaBase + defesaBase) > 10) {
      throw new Error("A soma de força e defesa não pode ultrapassar 10.");
    }

    this.id = id;
    this.nome = nome;
    this.nomeAventureiro = nomeAventureiro;
    this.classe = classe;
    this.level = level;
    this.forcaBase = forcaBase;
    this.defesaBase = defesaBase;
    this.itensMagicos = [];
  }


  adicionarItem(item) {
    if (item.tipo === "Amuleto") {
      const temAmuleto = this.itensMagicos.some(i => i.tipo === "Amuleto");
      if (temAmuleto) {
        throw new Error("Este personagem já possui um amuleto.");
      }
    }
    this.itensMagicos.push(item);
  }

  removerItem(idItem) {
    this.itensMagicos = this.itensMagicos.filter(i => i.id !== idItem);
  }

  buscarAmuleto() {
    return this.itensMagicos.find(i => i.tipo === "Amuleto") || null;
  }

  get forcaTotal() {
    return this.forcaBase + this.itensMagicos.reduce((s, i) => s + i.forca, 0);
  }

  get defesaTotal() {
    return this.defesaBase + this.itensMagicos.reduce((s, i) => s + i.defesa, 0);
  }

  exibir() {
    return `
      ${this.nomeAventureiro} (${this.classe}) - Level ${this.level}
      Força Total: ${this.forcaTotal} | Defesa Total: ${this.defesaTotal}
      Itens: ${this.itensMagicos.map(i => i.nome).join(", ") || "Nenhum"}
    `;
  }
}


class ItemMagico {
  constructor(id, nome, tipo, forca, defesa) {
    this.id = id;
    this.nome = nome;
    this.tipo = tipo;

    if (tipo === "Arma") {
      this.forca = this.validarValor(forca, "força");
      this.defesa = 0;
    } else if (tipo === "Armadura") {
      this.forca = 0;
      this.defesa = this.validarValor(defesa, "defesa");
    } else if (tipo === "Amuleto") {
      this.forca = this.validarValor(forca, "força");
      this.defesa = this.validarValor(defesa, "defesa");
    } else {
      throw new Error("Tipo de item inválido. Use Arma, Armadura ou Amuleto.");
    }

    if (this.forca === 0 && this.defesa === 0) {
      throw new Error("Item mágico não pode ter força e defesa iguais a 0.");
    }
  }

  validarValor(valor, atributo) {
    if (valor < 0 || valor > 10) {
      throw new Error(`${atributo} deve estar entre 0 e 10.`);
    }
    return valor;
  }

  exibir() {
    return `Item: ${this.nome} | Tipo: ${this.tipo} | Força: ${this.forca} | Defesa: ${this.defesa}`;
  }
}


//-----------------------------------------------------------------
let contadorPersonagem = 1;
let contadorItem = 1;

function gerarIdPersonagem() {
  return `p${contadorPersonagem++}`;
}

function gerarIdItem() {
  return `im${contadorItem++}`;
}

const personagens = [];
const itensMagicos = [];

const formPersonagem = document.getElementById("form-personagem");
const formItem = document.getElementById("form-item");
const listaPersonagens = document.getElementById("lista-personagens");
const listaItens = document.getElementById("lista-itens");

formPersonagem.addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const nomeAventureiro = document.getElementById("nomeAventureiro").value;
  const classe = document.getElementById("classe").value;
  const level = parseInt(document.getElementById("level").value);
  const forcaBase = parseInt(document.getElementById("forcaBase").value);
  const defesaBase = parseInt(document.getElementById("defesaBase").value);

  try {
    const personagem = new Personagem(
      gerarIdPersonagem(),
      nome,
      nomeAventureiro,
      classe,
      level,
      forcaBase,
      defesaBase
    );
    personagens.push(personagem);
    atualizarListaPersonagens();
    formPersonagem.reset();
  } catch (error) {
    alert("Erro ao criar personagem: " + error.message);
  }
});

formItem.addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nomeItem").value;
  const tipo = document.getElementById("tipoItem").value;
  const forca = parseInt(document.getElementById("forcaItem").value);
  const defesa = parseInt(document.getElementById("defesaItem").value);

  try {
    const item = new ItemMagico(gerarIdItem(), nome, tipo, forca, defesa);
    itensMagicos.push(item);
    atualizarListaItens();
    formItem.reset();
  } catch (error) {
    alert("Erro ao criar item: " + error.message);
  }
});

function atualizarListaPersonagens() {
  listaPersonagens.innerHTML = "";
  personagens.forEach((p) => {
    const li = document.createElement("li");

    let itensHtml = p.itensMagicos.length
      ? p.itensMagicos.map((i) => `${i.nome} (${i.tipo})`).join(", ")
      : "Nenhum";

    li.innerHTML = `
      <strong>ID:</strong> ${p.id} 
      <button onclick="copiarTexto('${p.id}')">📋</button>
      <button onclick="editarPersonagem('${p.id}')">✏️</button>
      <button onclick="deletarPersonagem('${p.id}')">🗑️</button>
      <br>
      <strong>Nome Aventureiro:</strong> ${p.nomeAventureiro} (${p.classe})<br>
      <strong>Level:</strong> ${p.level}<br>
      <strong>Item Mágico:</strong> ${itensHtml}<br>
      <strong>Força:</strong> ${p.forcaBase} | <strong>Defesa:</strong> ${p.defesaBase}<br>
      <strong>Força Total:</strong> ${p.forcaTotal} | <strong>Defesa Total:</strong> ${p.defesaTotal}
    `;
    listaPersonagens.appendChild(li);
  });
}

function atualizarListaItens() {
  listaItens.innerHTML = "";
  itensMagicos.forEach((i) => {
    const emUso = personagens.some((p) =>
      p.itensMagicos.some((item) => item.id === i.id)
    );

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>ID:</strong> ${i.id}
      <button onclick="copiarTexto('${i.id}')">📋</button>
      <button onclick="editarItem('${i.id}')" ${emUso ? "disabled" : ""}>✏️</button>
      <button onclick="deletarItem('${i.id}')" ${emUso ? "disabled" : ""}>🗑️</button>
      <br>
      <strong>Nome:</strong> ${i.nome} (${i.tipo})<br>
      <strong>Força:</strong> ${i.forca} | <strong>Defesa:</strong> ${i.defesa}
    `;
    listaItens.appendChild(li);
  });
}

// ------------------------------------------------------------------------------------------------------------------
const formAddItem = document.getElementById("form-adicionar-item");

formAddItem.addEventListener("submit", function (e) {
  e.preventDefault();
  const idPersonagem = document.getElementById("idPersonagemItem").value;
  const idItem = document.getElementById("idItemAdicionar").value;

  const personagem = personagens.find((p) => p.id === idPersonagem);
  const item = itensMagicos.find((i) => i.id === idItem);

  if (!personagem || !item) {
    alert("Personagem ou Item não encontrado!");
    return;
  }

  try {
    personagem.adicionarItem(item);
    atualizarListaPersonagens();
    alert("Item adicionado com sucesso!");
    formAddItem.reset();
  } catch (err) {
    alert("Erro ao adicionar item: " + err.message);
  }
});

const formRemoverItem = document.getElementById("form-remover-item");

formRemoverItem.addEventListener("submit", function (e) {
  e.preventDefault();
  const idPersonagem = document.getElementById("idPersonagemRemover").value;
  const idItem = document.getElementById("idItemRemover").value;

  const personagem = personagens.find((p) => p.id === idPersonagem);

  if (!personagem) {
    alert("Personagem não encontrado!");
    return;
  }

  personagem.removerItem(idItem);
  atualizarListaPersonagens();
  alert("Item removido com sucesso!");
  formRemoverItem.reset();
});

const formBuscarAmuleto = document.getElementById("form-buscar-amuleto");
const resultadoAmuleto = document.getElementById("resultado-amuleto");

formBuscarAmuleto.addEventListener("submit", function (e) {
  e.preventDefault();
  const idPersonagem = document.getElementById("idPersonagemBuscarAmuleto").value;

  const personagem = personagens.find((p) => p.id === idPersonagem);

  if (!personagem) {
    resultadoAmuleto.textContent = "Personagem não encontrado.";
    return;
  }

  const amuleto = personagem.buscarAmuleto();
  if (amuleto) {
    resultadoAmuleto.textContent = `Amuleto encontrado: ${amuleto.nome} (Força: ${amuleto.forca}, Defesa: ${amuleto.defesa})`;
  } else {
    resultadoAmuleto.textContent = "Este personagem não possui um amuleto.";
  }
});

//-------------------------------------------------------------
function copiarTexto(id) {
  navigator.clipboard.writeText(id)
    .then(() => alert("ID copiado com sucesso: " + id))
    .catch(() => alert("Erro ao copiar ID."));
}

function editarPersonagem(id) {
  const personagem = personagens.find(p => p.id === id);
  if (!personagem) return alert("Personagem não encontrado!");

  document.getElementById("edit-id").value = personagem.id;
  document.getElementById("edit-nome").value = personagem.nome;
  document.getElementById("edit-nomeAventureiro").value = personagem.nomeAventureiro;
  document.getElementById("edit-classe").value = personagem.classe;
  document.getElementById("edit-level").value = personagem.level;
  document.getElementById("edit-forcaBase").value = personagem.forcaBase;
  document.getElementById("edit-defesaBase").value = personagem.defesaBase;

  document.getElementById("modal-editar").style.display = "flex";
}

function fecharModal() {
  document.getElementById("modal-editar").style.display = "none";
}

document.getElementById("form-editar-personagem").addEventListener("submit", function (e) {
  e.preventDefault();
  const id = document.getElementById("edit-id").value;
  const personagem = personagens.find(p => p.id === id);
  if (!personagem) return alert("Personagem não encontrado!");

  try {
    personagem.nome = document.getElementById("edit-nome").value;
    personagem.nomeAventureiro = document.getElementById("edit-nomeAventureiro").value;
    personagem.classe = document.getElementById("edit-classe").value;
    personagem.level = parseInt(document.getElementById("edit-level").value);
    personagem.forcaBase = parseInt(document.getElementById("edit-forcaBase").value);
    personagem.defesaBase = parseInt(document.getElementById("edit-defesaBase").value);

    if (personagem.forcaBase + personagem.defesaBase > 10) {
      throw new Error("A soma de força e defesa não pode ultrapassar 10.");
    }

    atualizarListaPersonagens();
    fecharModal();
  } catch (err) {
    alert("Erro: " + err.message);
  }
});

function deletarPersonagem(id) {
  const index = personagens.findIndex(p => p.id === id);
  if (index !== -1) {
    personagens.splice(index, 1);
    atualizarListaPersonagens();
    salvarNoLocalStorage();
  } else {
    alert("Personagem não encontrado.");
  }
}

function editarItem(id) {
  const item = itensMagicos.find(i => i.id === id);
  if (!item) return alert("Item não encontrado!");

  document.getElementById("edit-item-id").value = item.id;
  document.getElementById("edit-item-nome").value = item.nome;
  document.getElementById("edit-item-tipo").value = item.tipo;
  document.getElementById("edit-item-forca").value = item.forca;
  document.getElementById("edit-item-defesa").value = item.defesa;

  document.getElementById("modal-editar-item").style.display = "flex";
}

function fecharModalItem() {
  document.getElementById("modal-editar-item").style.display = "none";
}

document.getElementById("form-editar-item").addEventListener("submit", function (e) {
  e.preventDefault();
  const id = document.getElementById("edit-item-id").value;
  const item = itensMagicos.find(i => i.id === id);
  if (!item) return alert("Item não encontrado!");

  const novoNome = document.getElementById("edit-item-nome").value;
  const novoTipo = document.getElementById("edit-item-tipo").value;
  const novaForca = parseInt(document.getElementById("edit-item-forca").value);
  const novaDefesa = parseInt(document.getElementById("edit-item-defesa").value);

  try {
    const novoItem = new ItemMagico(id, novoNome, novoTipo, novaForca, novaDefesa);

    const index = itensMagicos.findIndex(i => i.id === id);
    itensMagicos[index] = novoItem;

    atualizarListaItens();
    fecharModalItem();
  } catch (err) {
    alert("Erro: " + err.message);
  }
});

function deletarItem(id) {
  const emUso = personagens.some(p => p.itensMagicos.some(i => i.id === id));
  if (emUso) {
    alert("Este item está equipado por um personagem e não pode ser deletado.");
    return;
  }

  const index = itensMagicos.findIndex(i => i.id === id);
  if (index !== -1) {
    itensMagicos.splice(index, 1);
    atualizarListaItens();
    salvarNoLocalStorage();
  } else {
    alert("Item não encontrado.");
  }
}

setTimeout(() => {
  document.getElementById("edit-nome").focus();
}, 100);

window.copiarTexto = copiarTexto;
window.editarPersonagem = editarPersonagem;
window.deletarPersonagem = deletarPersonagem;
window.editarItem = editarItem;
window.deletarItem = deletarItem;
window.fecharModalItem = fecharModalItem;

// -------------------------------------------------------------------------------------

function salvarDados() {
  localStorage.setItem("personagens", JSON.stringify(personagens));
  localStorage.setItem("itensMagicos", JSON.stringify(itensMagicos));
  localStorage.setItem("contadorPersonagem", contadorPersonagem);
  localStorage.setItem("contadorItem", contadorItem);
}

function salvarNoLocalStorage() {
  localStorage.setItem("personagens", JSON.stringify(personagens));
  localStorage.setItem("itensMagicos", JSON.stringify(itensMagicos));
}

function carregarDados() {
  const dadosPersonagens = localStorage.getItem("personagens");
  const dadosItens = localStorage.getItem("itensMagicos");
  const contadorP = localStorage.getItem("contadorPersonagem");
  const contadorI = localStorage.getItem("contadorItem");

  if (dadosItens) {
    const itens = JSON.parse(dadosItens);
    itens.forEach((i) => {
      try {
        const item = new ItemMagico(i.id, i.nome, i.tipo, i.forca, i.defesa);
        itensMagicos.push(item);
      } catch (e) {
        console.warn("Item inválido ignorado:", i);
      }
    });
  }

  if (dadosPersonagens) {
    const pers = JSON.parse(dadosPersonagens);
    pers.forEach((p) => {
      try {
        const personagem = new Personagem(
          p.id,
          p.nome,
          p.nomeAventureiro,
          p.classe,
          p.level,
          p.forcaBase,
          p.defesaBase
        );

        p.itensMagicos.forEach((i) => {
          const item = itensMagicos.find((im) => im.id === i.id);
          if (item) personagem.adicionarItem(item);
        });

        personagens.push(personagem);
      } catch (e) {
        console.warn("Personagem inválido ignorado:", p);
      }
    });
  }

  if (contadorP) contadorPersonagem = parseInt(contadorP);
  if (contadorI) contadorItem = parseInt(contadorI);

  atualizarListaPersonagens();
  atualizarListaItens();
}

carregarDados();

[
  formPersonagem,
  formItem,
  formAddItem,
  formRemoverItem,
  document.getElementById("form-editar-personagem"),
  document.getElementById("form-editar-item"),
].forEach((form) => {
  form.addEventListener("submit", () => {
    setTimeout(salvarDados, 100);
  });
});

//------------------------------------------------------------------
document.querySelector('h1').addEventListener('click', function () {
  this.classList.add('jewel-effect');
  setTimeout(() => this.classList.remove('jewel-effect'), 3000);
});

document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', function (e) {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${e.clientX + Math.random() * 20 - 10}px`;
      particle.style.top = `${e.clientY + Math.random() * 20 - 10}px`;
      particle.style.background = ['#00D6D6', '#B22222', '#FFFF55'][Math.floor(Math.random() * 3)];
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 500);
    }
  });
});