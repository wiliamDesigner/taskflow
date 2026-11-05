
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [tela, setTela] = useState("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [usuario, setUsuario] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [filtro, setFiltro] = useState("todas");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("media");

  const [editandoId, setEditandoId] = useState(null);

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  async function carregarTarefas() {
    try {
      const resposta = await api.get("/tarefas");
      setTarefas(resposta.data);
    } catch (erro) {
      setMensagem("Não foi possível carregar as tarefas.");
    }
  }

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    const tokenSalvo = localStorage.getItem("token");

    if (usuarioSalvo && tokenSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
      setTela("dashboard");
    }
  }, []);

  useEffect(() => {
    if (tela === "dashboard") {
      carregarTarefas();
    }
  }, [tela]);

  async function fazerLogin(event) {
    event.preventDefault();
    setMensagem("");
    setCarregando(true);

    try {
      const resposta = await axios.post(
      "https://taskflow-3hn9.onrender.com/api/usuarios/login",
        { email, senha }
      );

      localStorage.setItem("token", resposta.data.token);
      localStorage.setItem("usuario", JSON.stringify(resposta.data.usuario));

      setUsuario(resposta.data.usuario);
      setTela("dashboard");
      setSenha("");
    } catch (erro) {
      setMensagem(
        erro.response?.data?.mensagem ||
        "Não foi possível conectar ao servidor."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function fazerCadastro(event) {
    event.preventDefault();
    setMensagem("");
    setCarregando(true);

    try {
      await axios.post(
        "https://taskflow-3hn9.onrender.com/api/usuarios/cadastro",
        { nome, email, senha }
      );

      setMensagem("Cadastro realizado! Agora você já pode entrar.");
      setTela("login");
      setNome("");
      setSenha("");
    } catch (erro) {
      setMensagem(
        erro.response?.data?.mensagem ||
        "Não foi possível realizar o cadastro."
      );
    } finally {
      setCarregando(false);
    }
  }

  function limparFormulario() {
    setTitulo("");
    setDescricao("");
    setPrioridade("media");
    setEditandoId(null);
  }

  async function salvarTarefa(event) {
    event.preventDefault();
    setMensagem("");

    try {
      if (editandoId) {
        await api.put(`/tarefas/${editandoId}`, {
          titulo,
          descricao,
          prioridade,
        });

        setMensagem("Tarefa atualizada com sucesso!");
      } else {
        await api.post("/tarefas", {
          titulo,
          descricao,
          prioridade,
        });

        setMensagem("Tarefa adicionada com sucesso!");
      }

      limparFormulario();
      await carregarTarefas();
    } catch (erro) {
      setMensagem(
        erro.response?.data?.mensagem ||
        "Não foi possível salvar a tarefa."
      );
    }
  }

  function iniciarEdicao(tarefa) {
    setEditandoId(tarefa.id);
    setTitulo(tarefa.titulo);
    setDescricao(tarefa.descricao || "");
    setPrioridade(tarefa.prioridade || "media");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function excluirTarefa(id) {
    try {
      await api.delete(`/tarefas/${id}`);
      await carregarTarefas();
      setMensagem("Tarefa excluída com sucesso!");
    } catch (erro) {
      setMensagem("Não foi possível excluir a tarefa.");
    }
  }

  async function concluirTarefa(tarefa) {
    try {
      const novoStatus =
        tarefa.status === "concluida" ? "pendente" : "concluida";

      await api.put(`/tarefas/${tarefa.id}`, {
        ...tarefa,
        status: novoStatus,
      });

      await carregarTarefas();
      setMensagem("Status atualizado com sucesso!");
    } catch (erro) {
      setMensagem("Não foi possível atualizar a tarefa.");
    }
  }

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setUsuario(null);
    setTarefas([]);
    setFiltro("todas");
    setTela("login");
    setMensagem("");
    setEmail("");
    setSenha("");
    limparFormulario();
  }

  function trocarTela(novaTela) {
    setTela(novaTela);
    setMensagem("");
    setNome("");
    setEmail("");
    setSenha("");
  }

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtro === "todas") return true;
    if (filtro === "alta") return tarefa.prioridade === "alta";
    return tarefa.status === filtro;
  });

  if (tela === "dashboard") {
    const concluidas = tarefas.filter(
      (tarefa) => tarefa.status === "concluida"
    ).length;

    const pendentes = tarefas.length - concluidas;

    return (
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <h1>✓ TaskFlow</h1>
            <p>Organize suas tarefas. Simplifique seu dia.</p>
          </div>

          <button className="logout-button" onClick={sair}>
            Sair
          </button>
        </header>

        <section className="dashboard-content">
          <h2>Olá, {usuario?.nome || "usuário"}! 👋</h2>

          <p className="dashboard-subtitle">
            Vamos organizar suas atividades de hoje?
          </p>

          <div className="task-stats">
            <div className="stat-card">
              <span>Total de tarefas</span>
              <strong>{tarefas.length}</strong>
            </div>

            <div className="stat-card">
              <span>Concluídas</span>
              <strong>{concluidas}</strong>
            </div>

            <div className="stat-card">
              <span>Pendentes</span>
              <strong>{pendentes}</strong>
            </div>
          </div>

          <section className="task-form-card">
            <h3>
              {editandoId ? "Editar tarefa" : "Adicionar nova tarefa"}
            </h3>

            <form onSubmit={salvarTarefa}>
              <label htmlFor="titulo">Título</label>
              <input
                id="titulo"
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                placeholder="Ex.: Estudar React"
                required
              />

              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Descreva sua tarefa..."
              />

              <label htmlFor="prioridade">Prioridade</label>
              <select
                id="prioridade"
                value={prioridade}
                onChange={(event) => setPrioridade(event.target.value)}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>

              <button type="submit">
                {editandoId ? "Salvar alterações" : "Adicionar tarefa"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  className="cancel-edit-button"
                  onClick={limparFormulario}
                >
                  Cancelar edição
                </button>
              )}
            </form>
          </section>

          <section className="task-list-section">
            <h3>Minhas tarefas</h3>

            <div className="task-filters">
              <button
                className={filtro === "todas" ? "active" : ""}
                onClick={() => setFiltro("todas")}
              >
                Todas
              </button>

              <button
                className={filtro === "pendente" ? "active" : ""}
                onClick={() => setFiltro("pendente")}
              >
                Pendentes
              </button>

              <button
                className={filtro === "concluida" ? "active" : ""}
                onClick={() => setFiltro("concluida")}
              >
                Concluídas
              </button>

              <button
                className={filtro === "alta" ? "active" : ""}
                onClick={() => setFiltro("alta")}
              >
                Alta prioridade
              </button>
            </div>

            {tarefasFiltradas.length === 0 ? (
              <p className="empty-tasks">
                Nenhuma tarefa encontrada neste filtro.
              </p>
            ) : (
              <div className="task-list">
                {tarefasFiltradas.map((tarefa) => (
                  <article className="task-card" key={tarefa.id}>
                    <div>
                      <h4
                        className={
                          tarefa.status === "concluida" ? "completed" : ""
                        }
                      >
                        {tarefa.titulo}
                      </h4>

                      <p>{tarefa.descricao}</p>

                      <span className="task-priority">
                        Prioridade: {tarefa.prioridade}
                      </span>

                      <span className="task-status">
                        {tarefa.status}
                      </span>
                    </div>

                    <div className="task-actions">
                      <button onClick={() => iniciarEdicao(tarefa)}>
                        Editar
                      </button>

                      <button onClick={() => concluirTarefa(tarefa)}>
                        {tarefa.status === "concluida" ? "Reabrir" : "Concluir"}
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => excluirTarefa(tarefa.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {mensagem && (
            <p className="dashboard-message" role="status">
              {mensagem}
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="logo">✓</div>
        <h1>TaskFlow</h1>

        <p className="subtitle">
          Organize suas tarefas. Simplifique seu dia.
        </p>

        {tela === "login" ? (
          <>
            <h2>Bem-vindo de volta!</h2>
            <p className="description">
              Entre na sua conta para continuar.
            </p>

            <form onSubmit={fazerLogin}>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />

              <button type="submit" disabled={carregando}>
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="register-text">
              Ainda não tem uma conta?{" "}
              <a href="#cadastro" onClick={() => trocarTela("cadastro")}>
                Criar conta
              </a>
            </p>
          </>
        ) : (
          <>
            <h2>Crie sua conta</h2>
            <p className="description">
              Comece a organizar suas tarefas!
            </p>

            <form onSubmit={fazerCadastro}>
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Seu nome"
                required
              />

              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                required
              />

              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Crie uma senha"
                minLength={6}
                required
              />

              <button type="submit" disabled={carregando}>
                {carregando ? "Cadastrando..." : "Criar minha conta"}
              </button>
            </form>

            <p className="register-text">
              Já tem uma conta?{" "}
              <a href="#login" onClick={() => trocarTela("login")}>
                Fazer login
              </a>
            </p>
          </>
        )}

        {mensagem && (
          <p className="login-message" role="status">
            {mensagem}
          </p>
        )}
      </section>

      <footer>© 2026 TaskFlow. Organize seu dia.</footer>
    </main>
  );
}

export default App;
