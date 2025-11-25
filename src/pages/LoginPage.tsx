import { Button, Container, TextField, Typography, CircularProgress } from '@mui/material';
import { useLoginViewModel } from '../viewModels/loginViewModel';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { form, handleChange, handleSubmit } = useLoginViewModel();
  const navigate = useNavigate();
  const handleMain = () => {
    navigate('/')
  }
  const handleRegister = () => {
    navigate('/register')
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Senha"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={form.loading}
        >
          {form.loading ? <CircularProgress size={24} /> : 'Entrar'}
        </Button>
      </form>
      <Button variant="outlined" 
        onClick={handleRegister} 
        sx={{ mt: 2 }}> Register</Button>
      <Button 
        variant="outlined" 
        onClick={handleMain} 
        sx={{ mt: 2 }}
      >
        Home
      </Button>
    </Container>
  );
}
