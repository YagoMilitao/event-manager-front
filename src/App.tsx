import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBPSBrxQJv-2Hkcra9-t6rteF6Za78wET0",
  authDomain: "gerenciamento-eventos.firebaseapp.com",
  projectId: "gerenciamento-eventos",
  storageBucket: "gerenciamento-eventos.firebasestorage.app",
  messagingSenderId: "442197069319",
  appId: "1:442197069319:web:6aeef4bcb9415cd408a4a2",
  measurementId: "G-DCD6K4PNJJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [token, setToken] = useState("");
  const [erro, setErro] = useState("");

  const fazerLogin = async () => {
    setErro("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      const token = await cred.user.getIdToken();
      setToken(token);
    } catch (err: any) {
      setErro("Erro ao logar: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Login Firebase</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "1rem" }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        style={{ display: "block", marginBottom: "1rem" }}
      />
      <button onClick={fazerLogin}>Fazer Login</button>

      {token && (
        <div style={{ marginTop: "1rem" }}>
          <h4>ID Token:</h4>
          <textarea
            value={token}
            readOnly
            style={{ width: "100%", height: "150px" }}
          />
        </div>
      )}

      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}

export default App;
