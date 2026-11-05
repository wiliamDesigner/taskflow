
import express from "express";

import {
  cadastrarUsuario,
  loginUsuario
} from "../controllers/usuarioController.js";

const router = express.Router();

// Rota de cadastro
router.post("/cadastro", cadastrarUsuario);

// Rota de login
router.post("/login", loginUsuario);

export default router;
