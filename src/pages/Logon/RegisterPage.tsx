import { Container, TextField, Button, Typography, CircularProgress } from '@mui/material'
import { useRegisterViewModel } from '../../viewModels/registerViewModel'

export default function RegisterPage() {
  const { form, handleChange, handleSubmit } = useRegisterViewModel()

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Criar Conta
      </Typography>

      {/* Formulário de Cadastro */}
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
        <TextField
          fullWidth
          label="Confirme a Senha"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
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
          {form.loading ? <CircularProgress size={24} /> : 'Criar Conta'}
        </Button>
      </form>
    </Container>
  )
}
