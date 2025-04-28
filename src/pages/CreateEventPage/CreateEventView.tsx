import { Container, TextField, Button, Typography } from '@mui/material'
import { useCreateEventViewModel } from './CreateEventViewModel'

export default function CreateEventPage() {
  const { form, handleChange, handleImageChange, handleSubmit } = useCreateEventViewModel()

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Criar Evento
      </Typography>

      <TextField
        fullWidth
        label="Título"
        name="titulo"
        value={form.titulo}
        onChange={handleChange}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Descrição"
        name="descricao"
        value={form.descricao}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={4}
      />

      <TextField
        fullWidth
        label="Data"
        name="data"
        type="date"
        value={form.data}
        onChange={handleChange}
        margin="normal"
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
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        label="Local"
        name="local"
        value={form.local}
        onChange={handleChange}
        margin="normal"
      />

      <Button
        variant="contained"
        component="label"
        sx={{ mt: 2 }}
      >
        Upload Imagem
        <input type="file" hidden onChange={handleImageChange} />
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 4 }}
      >
        Criar Evento
      </Button>
    </Container>
  )
}
