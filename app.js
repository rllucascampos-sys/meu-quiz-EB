const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// SENSACIONAL: Faz o Node servir a sua própria pasta como site!
app.use(express.static(__dirname));

let bancoUsuarios = [
    { nome: "Lucas campos", email: "lucas.campos@ebeducacao.com", ebcoins: 23 },
    { nome: "Graziele Correia", email: "grazi@ebeducacao.com", ebcoins: 12 },
    { nome: "Sabrina martins", email: "sabrina@ebeducacao.com", ebcoins: 10 },
    { nome: "Patricia cardoso", email: "patricia@ebeducacao.com", ebcoins: 5 },
    { nome: "kelly", email: "kelly@ebeducacao.com", ebcoins: 2 }
];

const listaPerguntas = [
    {
        id: 1,
        texto: "De acordo com a CLT, qual é o prazo legal limite para o empregador efetuar o pagamento do salário mensal do colaborador?",
        opcoes: [
            "Até o 5º dia útil do mês subsequente ao trabalhado", 
            "Até o dia 30 de cada mês vigente", 
            "Até o 5º dia corrido do mês subsequente", 
            "Até o dia 10 do mês subsequente ao trabalhado"
        ],
        correta: "Até o 5º dia útil do mês subsequente ao trabalhado"
    },
    {
        id: 2,
        texto: "Ao calcular as verbas rescisórias de uma demissão sem justa causa, qual é a alíquota da multa rescisória do FGTS que a empresa deve depositar?",
        opcoes: [
            "20% sobre o saldo do FGTS", 
            "10% sobre o saldo do FGTS", 
            "40% sobre o saldo do FGTS", 
            "50% sobre o saldo do FGTS"
        ],
        correta: "40% sobre o saldo do FGTS"
    }
];

app.get('/perguntas/:email', (req, res) => {
    res.json({ success: true, perguntas: listaPerguntas });
});

app.post('/responder-unica', (req, res) => {
    const { email, id, resposta } = req.body;
    const pergunta = listaPerguntas.find(p => p.id === id);
    const usuario = bancoUsuarios.find(u => u.email === email);

    if (!pergunta || !usuario) return res.status(400).json({ success: false });

    const acertou = pergunta.correta === resposta;
    let ganhos = 0;
    if (acertou) { ganhos = 10; usuario.ebcoins += ganhos; }

    res.json({ acertou, ganhos, totalEbcoins: usuario.ebcoins });
});

app.get('/hall', (req, res) => {
    const top5 = [...bancoUsuarios].sort((a, b) => b.ebcoins - a.ebcoins).slice(0, 5);
    res.json({ top5 });
});

app.post('/comprar-item', (req, res) => {
    const { email, preco } = req.body;
    const usuario = bancoUsuarios.find(u => u.email === email);
    if (!usuario || usuario.ebcoins < preco) return res.status(400).json({ success: false });

    usuario.ebcoins -= preco;
    res.json({ success: true, novoSaldo: usuario.ebcoins });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor e Site rodando juntos em http://localhost:${PORT}`);
});