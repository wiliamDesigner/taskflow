
import "dotenv/config";

import express from "express";
import cors from "cors";

import pool from "./config/database.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import tarefaRoutes from "./routes/tarefaRoutes.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://taskflow-cwty4a2pr-wiliams-projects-a77720a3.vercel.app",
    "https://taskflow-git-main-wiliams-projects-a77720a3.vercel.app",
    "https://taskflow-9epdyjua5-wiliams-projects-a77720a3.vercel.app"
  ]
}));

app.use(express.json());

// Testar conexão com PostgreSQL
pool.query("SELECT NOW()")
  .then(() => {
    console.log("PostgreSQL conectado com sucesso!");
  })
  .catch((erro) => {
    console.error("Erro ao conectar ao PostgreSQL:", erro.message);
  });

// Rota inicial
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bem-vindo à API do TaskFlow!"
  });
});

// Rota de verificação
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "TaskFlow API está funcionando!"
  });
});

// Rotas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/tarefas", tarefaRoutes);

// Inicialização
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TaskFlow API rodando na porta ${PORT}`);
});
