import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../viewModels/authViewModel';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

export default function LoginPage() {
  // States locais para capturar e gerenciar os inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Para mostrar loader durante o login

  const { login } = useAuth(); // Hook customizado que conecta no Redux
  const navigate = useNavigate(); // Para redirecionar após login

  // Função chamada ao submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true); // Ativa loading

    try {
      // Chamando a ViewModel para fazer login no backend
      const { token, user } = await loginUser(email, password);

      // Atualiza Redux com token e user
      login(token, user);

      toast.success('Login realizado com sucesso!');
      navigate('/my-events'); // Redireciona para a página dos eventos do usuário
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      toast.error('Falha no login. Verifique suas credenciais!');
    } finally {
      setLoading(false); // Sempre desativa loading
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
