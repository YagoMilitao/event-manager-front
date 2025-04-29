import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setToken } from '../store/authSlice';
import { LoginState } from '../state/LoginState';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function useLoginViewModel() {
  const [form, setForm] = useState<LoginState>({ email: '', password: '', loading: false });
  // Formulário começa vazio

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Atualiza o form a cada digitação
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o refresh da página
    setForm((prev) => ({ ...prev, loading: true })); // Habilita loading

    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);

      const token = await userCredential.user.getIdToken(); // 🔥 pega o token do Firebase
      dispatch(setToken(token));
      // Salva o token retornado no Redux

      toast.success('Login realizado com sucesso!');
      navigate('/my-event'); 
      // Redireciona para a página de eventos (privada)
    } catch (error) {
      console.error('Erro ao logar:', error);
      toast.error('Email ou senha inválidos.');
    } finally {
      setForm((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    form,
    handleChange,
    handleSubmit,
  };
}
