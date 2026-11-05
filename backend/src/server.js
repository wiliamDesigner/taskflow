
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./config/database.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import tarefaRoutes from "./routes/tarefaRoutes.js";

dotenv.config();

const app = express();

// Configuração do CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://taskflow-git-main-wiliams-projects-a77720a3.vercel.app",
    "https://taskflow-9epdyjua5-wiliams-projects-a77720a3.vercel.app"
  ]
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

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TaskFlow API rodando na porta ${PORT}`);
});
