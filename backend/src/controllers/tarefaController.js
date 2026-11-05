import pool from "../config/database.js";

// LISTAR TAREFAS
export async function listarTarefas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT * FROM tarefas
       WHERE usuario_id = $1
       ORDER BY criado_em DESC`,
      [req.usuario.id]
    );

    return res.status(200).json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao listar tarefas:", erro);
    return res.status(500).json({ mensagem: "Erro ao listar tarefas." });
  }
}

// CRIAR TAREFA
export async function criarTarefa(req, res) {
  try {
    const { titulo, descricao, prioridade, data_vencimento } = req.body;

    if (!titulo) {
      return res.status(400).json({
        mensagem: "O título da tarefa é obrigatório."
      });
    }

    const resultado = await pool.query(
      `INSERT INTO tarefas
       (usuario_id, titulo, descricao, prioridade, data_vencimento)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.usuario.id,
        titulo,
        descricao || null,
        prioridade || "media",
        data_vencimento || null
      ]
    );

    return res.status(201).json({
      mensagem: "Tarefa criada com sucesso!",
      tarefa: resultado.rows[0]
    });
  } catch (erro) {
    console.error("Erro ao criar tarefa:", erro);
    return res.status(500).json({ mensagem: "Erro ao criar tarefa." });
  }
}

// ATUALIZAR TAREFA
export async function atualizarTarefa(req, res) {
  try {
    const { id } = req.params;
    const { titulo, descricao, status, prioridade, data_vencimento } = req.body;

    const resultado = await pool.query(
      `UPDATE tarefas
       SET titulo = COALESCE($1, titulo),
           descricao = COALESCE($2, descricao),
           status = COALESCE($3, status),
           prioridade = COALESCE($4, prioridade),
           data_vencimento = COALESCE($5, data_vencimento)
       WHERE id = $6 AND usuario_id = $7
       RETURNING *`,
      [
        titulo ?? null,
        descricao ?? null,
        status ?? null,
        prioridade ?? null,
        data_vencimento ?? null,
        id,
        req.usuario.id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Tarefa não encontrada." });
    }

    return res.status(200).json({
      mensagem: "Tarefa atualizada com sucesso!",
      tarefa: resultado.rows[0]
    });
  } catch (erro) {
    console.error("Erro ao atualizar tarefa:", erro);
    return res.status(500).json({ mensagem: "Erro ao atualizar tarefa." });
  }
}

// EXCLUIR TAREFA
export async function excluirTarefa(req, res) {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM tarefas
       WHERE id = $1 AND usuario_id = $2
       RETURNING id`,
      [id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Tarefa não encontrada." });
    }

    return res.status(200).json({
      mensagem: "Tarefa excluída com sucesso!"
    });
  } catch (erro) {
    console.error("Erro ao excluir tarefa:", erro);
    return res.status(500).json({ mensagem: "Erro ao excluir tarefa." });
  }
}