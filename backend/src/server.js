
import "dotenv/config";

import express from "express";
import cors from "cors";

import pool from "./config/database.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import tarefaRoutes from "./routes/tarefaRoutes.js";

const app = express();

// Verificar variáveis de ambiente sem revelar os valores
console.log(
  "JWT_SECRET carregado:",
  Boolean(process.env.JWT_SECRET)
);

console.log(
  "DATABASE_URL carregado:",
  Boolean(process.env.DATABASE_URL)
);

// Configuração do CORS
const origensPermitidas = [
  "http://localhost:5173",
  "https://taskflow-git-main-wiliams-projects-a77720a3.vercel.app",
  "https://taskflow-9epdyjua5-wiliams-projects-a77720a3.vercel.app",
  "https://taskflow-cwty4a2pr-wiliams-projects-a77720a3.vercel.app"
];

app.use(cors({
  origin: origensPermitidas,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Verificar conexão com PostgreSQL
pool.query("SELECT NOW()")
  .then(() => {
    console.log("PostgreSQL conectado com sucesso!");
  })
  .catch((error) => {
    console.error(
      "Erro ao conectar ao PostgreSQL:",
      error.message
    );
  });

// Rota inicial
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bem-vindo à API do TaskFlow!"
  });
});

// Verificar funcionamento da API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "TaskFlow API está funcionando!"
  });
});

// Rotas da aplicação
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/tarefas", tarefaRoutes);

// Tratamento de rotas inexistentes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    mensagem: "Rota não encontrada."
  });
});

// Tratamento de erros
app.use((error, req, res, next) => {
  console.error("Erro na API:", error);

  res.status(500).json({
    success: false,
    mensagem: "Erro interno no servidor."
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TaskFlow API rodando na porta ${PORT}`);
});
