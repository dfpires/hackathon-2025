// Importa as dependências necessárias
const express = require("express");      // Framework para criar o servidor web
const bodyParser = require("body-parser"); // Middleware para interpretar JSON no corpo da requisição
const cors = require("cors");              // Middleware para permitir requisições de outros domínios (Cross-Origin)

// Cria a aplicação Express
const app = express();

// Habilita CORS para permitir que o frontend (em outra porta) se conecte
app.use(cors());

// Configura o servidor para aceitar requisições no formato JSON
app.use(bodyParser.json());

// Objeto simples de sessões para guardar o estado de cada usuário
// (idealmente poderia ser armazenado em banco de dados ou cache, ex.: Redis)
let sessions = {};

/**
 * Endpoint principal do chatbot
 * Rota: POST /chat
 * Entrada esperada: { sessionId: string, message: string }
 * Saída: { reply: string }
 */
app.post("/chat", (req, res) => {
  const { sessionId, message } = req.body; // Extrai ID da sessão e a mensagem enviada pelo usuário

  // Se não existir sessão para o usuário, cria uma nova
  if (!sessions[sessionId]) {
    sessions[sessionId] = { step: 0, nome: "", nota1: null, nota2: null };
  }

  // Recupera o estado atual da sessão
  const session = sessions[sessionId];
  let reply = ""; // Resposta do bot

  // Controle de fluxo da conversa baseado no "step"
  switch (session.step) {
    case 0:
      // Passo inicial: pedir o nome
      reply = "Olá! Qual é o seu nome?";
      session.step = 1;
      break;

    case 1:
      // Usuário informou o nome → pedir a primeira nota
      session.nome = message;
      reply = `Prazer, ${session.nome}! Digite a primeira nota:`;
      session.step = 2;
      break;

    case 2:
      // Usuário informou a primeira nota → validar e pedir a segunda nota
      session.nota1 = parseFloat(message);
      if (isNaN(session.nota1)) {
        reply = "Por favor, digite um número válido para a primeira nota.";
      } else {
        reply = "Agora, digite a segunda nota:";
        session.step = 3;
      }
      break;

    case 3:
      // Usuário informou a segunda nota → validar e calcular a média
      session.nota2 = parseFloat(message);
      if (isNaN(session.nota2)) {
        reply = "Por favor, digite um número válido para a segunda nota.";
      } else {
        const media = (session.nota1 + session.nota2) / 2;
        reply = `A média das suas notas é **${media.toFixed(2)}**. Obrigado, ${session.nome}!`;
        session.step = 0; // Reseta a conversa para permitir um novo ciclo
      }
      break;

    default:
      // Caso inesperado → reinicia a conversa
      reply = "Ops, algo deu errado. Vamos começar de novo! Qual é o seu nome?";
      session.step = 1;
  }

  // Retorna a resposta em JSON para o frontend
  res.json({ reply });
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});