// === USUÁRIO PADRÃO CONFIGURADO DIRECTO ===
const usuarioLogado = {
    nome: "Lucas campos",
    email: "lucas.campos@ebeducacao.com", 
    ebcoins: 23
};

let perguntas = [];
let currentIndex = 0;
let ebcoinsAtual = usuarioLogado.ebcoins;
let feedbackAtivo = false;

// URL do seu backend Node.js (ou do Render/nuvem se for o caso)
const API_URL = 'https://sua-api-do-render.onrender.com';

// Itens oficiais do Mercado (6 itens)
const itensLoja = [
    { id: 1, nome: "6 meses de Com prof responde", preco: 450, icone: "📔", video: "https://link-video1.com" },
    { id: 2, nome: "6 meses Dp sem limites", preco: 550, icone: "🥤", video: "https://link-video2.com" },
    { id: 3, nome: "Planilha EB", preco: 650, icone: "🧢", video: "https://link-video3.com" },
    { id: 4, nome: "Formação Analista Snr", preco: 800, icone: "👕", video: "https://link-video4.com" },
    { id: 5, nome: "MBA 100%", preco: 5000, icone: "🎓", video: "https://link-video6.com" }
];

let txtNome, txtEbcoins, txtSaldoLoja, cardConteudo, modalLoja, modalRanking;

// Inicializa quando o HTML carregar
document.addEventListener('DOMContentLoaded', () => {
    txtNome = document.getElementById('nome-usuario');
    txtEbcoins = document.getElementById('ebcoins');
    txtSaldoLoja = document.getElementById('saldo-loja');
    cardConteudo = document.getElementById('card-conteudo');
    modalLoja = document.getElementById('modal-loja');
    modalRanking = document.getElementById('modal-ranking');

    if (txtNome) txtNome.innerText = `👤 ${usuarioLogado.nome}`;
    atualizarSaldoTela(ebcoinsAtual);
    buscarPerguntas();
    configurarEventos();
});

function atualizarSaldoTela(valor) {
    ebcoinsAtual = valor;
    if (txtEbcoins) txtEbcoins.innerText = valor;
    if (txtSaldoLoja) txtSaldoLoja.innerText = valor;
    renderizarProdutosLoja();
}

function buscarPerguntas() {
    const emailStr = encodeURIComponent(usuarioLogado.email);
    fetch(`${API_URL}/perguntas/${emailStr}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.perguntas.length > 0) {
                perguntas = data.perguntas;
                mostrarPergunta();
            } else {
                cardConteudo.innerHTML = `<h2>🎉 Parabéns!</h2><p>Você concluiu todos os desafios de hoje.</p>`;
            }
        })
        .catch(() => {
            cardConteudo.innerHTML = `<h2>❌ Erro</h2><p>Não foi possível conectar ao servidor backend.</p>`;
        });
}

function mostrarPergunta() {
    if (!cardConteudo) return;
    if (currentIndex >= perguntas.length) {
        cardConteudo.innerHTML = `<h2>🎉 Parabéns!</h2><p>Todos os desafios diários concluídos.</p>`;
        return;
    }

    const pergunta = perguntas[currentIndex];
    feedbackAtivo = false;

    cardConteudo.innerHTML = `
        <p><small>Desafio ${currentIndex + 1}</small></p>
        <h2>${pergunta.texto}</h2>
        <div class="opcoes" id="container-opcoes"></div>
        <div id="feedback-container"></div>
    `;

    const containerOpcoes = document.getElementById('container-opcoes');
    pergunta.opcoes.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.addEventListener('click', () => verificarResposta(opt));
        containerOpcoes.appendChild(btn);
    });
}

function verificarResposta(respostaSelecionada) {
    if (feedbackAtivo) return;
    feedbackAtivo = true;

    const perguntaAtual = perguntas[currentIndex];
    const botoes = cardConteudo.querySelectorAll('#container-opcoes button');
    botoes.forEach(btn => btn.disabled = true);

    fetch(`${API_URL}/responder-unica`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuarioLogado.email, id: perguntaAtual.id, resposta: respostaSelecionada })
    })
    .then(res => res.json())
    .then(data => {
        const feedbackContainer = document.getElementById('feedback-container');
        atualizarSaldoTela(data.totalEbcoins);

        if (data.acertou) {
            feedbackContainer.innerHTML = `<div class="feedback-box feedback-acertou">✅ Excelente! +${data.ganhos} EC</div>`;
        } else {
            feedbackContainer.innerHTML = `<div class="feedback-box feedback-errou">❌ Incorreto! A resposta era: ${perguntaAtual.correta}</div>`;
        }

        setTimeout(() => {
            currentIndex++;
            mostrarPergunta();
        }, 2000);
    })
    .catch(() => { feedbackAtivo = false; });
}

function renderizarProdutosLoja() {
    const gridProdutos = document.getElementById('grid-produtos');
    if (!gridProdutos) return;
    gridProdutos.innerHTML = '';

    itensLoja.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        const botaoDesabilitado = ebcoinsAtual < item.preco;
        const textoBotao = ebcoinsAtual < item.preco ? 'Saldo Insuficiente' : 'Trocar';

        itemCard.innerHTML = `
            <span class="icone-item">${item.icone}</span>
            <h4>${item.nome}</h4>
            <p>💰 ${item.preco} EC</p>
            <button class="btn-previa">👀 Prévia</button>
            <button class="btn-comprar" ${botaoDesabilitado ? 'disabled' : ''}>${textoBotao}</button>
        `;

        itemCard.querySelector('.btn-previa').addEventListener('click', () => window.open(item.video, '_blank'));
        if (!botaoDesabilitado) {
            itemCard.querySelector('.btn-comprar').addEventListener('click', () => comprarItem(item.preco));
        }
        gridProdutos.appendChild(itemCard);
    });
}

function comprarItem(preco) {
    fetch(`${API_URL}/comprar-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usuarioLogado.email, preco })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            atualizarSaldoTela(data.novoSaldo);
            alert("Troca realizada com sucesso!");
        }
    });
}

// === RANKING ===
function carregarRanking() {
    const listaRanking = document.getElementById('lista-ranking');
    if (!listaRanking) return;
    listaRanking.innerHTML = '<p>Carregando ranking...</p>';

    fetch(`${API_URL}/hall`)
        .then(res => res.json())
        .then(data => {
            const top5 = data.top5 || [];
            listaRanking.innerHTML = top5.map((user, i) => `
                <div class="ranking-item">
                    <span>${i + 1}. ${user.nome}</span>
                    <span>${user.ebcoins} EC</span>
                </div>
            `).join('');
        });
}

function configurarEventos() {
    const btnAbrirLoja = document.getElementById('btn-abrir-loja');
    const btnFecharLoja = document.getElementById('btn-fechar-loja');
    if (btnAbrirLoja && modalLoja) btnAbrirLoja.addEventListener('click', () => modalLoja.style.display = 'flex');
    if (btnFecharLoja && modalLoja) btnFecharLoja.addEventListener('click', () => modalLoja.style.display = 'none');

    const btnAbrirRanking = document.getElementById('btn-abrir-ranking');
    const btnFecharRanking = document.getElementById('btn-fechar-ranking');
    if (btnAbrirRanking && modalRanking) {
        btnAbrirRanking.addEventListener('click', () => { modalRanking.style.display = 'flex'; carregarRanking(); });
    }
    if (btnFecharRanking && modalRanking) btnFecharRanking.addEventListener('click', () => modalRanking.style.display = 'none');
}
