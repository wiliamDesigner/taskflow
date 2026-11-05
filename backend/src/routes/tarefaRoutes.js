import express from "express";

import {
  listarTarefas,
  criarTarefa,
  atualizarTarefa,
  excluirTarefa
} from "../controllers/tarefaController.js";

import { autenticarUsuario } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(autenticarUsuario);

// Listar tarefas
router.get("/", listarTarefas);

// Criar tarefa
router.post("/", criarTarefa);

// Atualizar tarefa
router.put("/:id", atualizarTarefa);

// Excluir tarefa
router.delete("/:id", excluirTarefa);

export default router;