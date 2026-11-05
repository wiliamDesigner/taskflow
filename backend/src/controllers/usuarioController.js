
import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// CADASTRAR USUÁRIO
export async function cadastrarUsuario(req, res) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha nome, email e senha."
      });
    }

    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({
        mensagem: "Este email já está cadastrado."
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, senha)
       VALUES ($1, $2, $3)
       RETURNING id, nome, email`,
      [nome, email, senhaCriptografada]
    );

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: resultado.rows[0]
    });

  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar usuário."
    });
  }
}

// REALIZAR LOGIN
export async function loginUsuario(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "Informe email e senha."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não configurado no Render.");

      return res.status(500).json({
        mensagem: "Configuração de autenticação não encontrada."
      });
    }

    const resultado = await pool.query(
      "SELECT id, nome, email, senha FROM usuarios WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        mensagem: "Email ou senha incorretos."
      });
    }

    const usuario = resultado.rows[0];

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "Email ou senha incorretos."
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (erro) {
    console.error("Erro no login:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao realizar login."
    });
  }
}
