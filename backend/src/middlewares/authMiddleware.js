
import jwt from "jsonwebtoken";

export function autenticarUsuario(req, res, next) {
  try {
    const cabecalho = req.headers.authorization;

    if (!cabecalho) {
      return res.status(401).json({
        mensagem: "Token não informado."
      });
    }

    const partes = cabecalho.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
      return res.status(401).json({
        mensagem: "Formato de token inválido."
      });
    }

    const token = partes[1];

    const usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = usuario;

    next();

  } catch (erro) {
    return res.status(401).json({
      mensagem: "Token inválido ou expirado."
    });
  }
}
