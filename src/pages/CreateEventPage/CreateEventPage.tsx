import { Button, Container, TextField, Typography, CircularProgress } from '@mui/material';
import { useCreateEventViewModel } from '../../viewModels/createEventViewModel';

export default function CreateEventPage() {
  const { form, handleChange, handleFileChange, handleSubmit } = useCreateEventViewModel();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Criar Evento
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Título"
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Descrição"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Data"
          name="data"
          type="date"
          value={form.data}
          onChange={handleChange}
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Hora de Início"
          name="horaInicio"
          type="time"
          value={form.horaInicio}
          onChange={handleChange}
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Local"
          name="local"
          value={form.local}
          onChange={handleChange}
          margin="normal"
          required
        />
        <input
          type="file"
          onChange={handleFileChange}
          style={{ marginTop: '16px' }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={form.loading}
        >
          {form.loading ? <CircularProgress size={24} /> : 'Criar Evento'}
        </Button>
      </form>
    </Container>
  );
}
