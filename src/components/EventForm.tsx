import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Stack,
  Box,
  CircularProgress,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { ChangeEvent } from 'react';
import { CreateEventForm, Organizer } from '../data/CreateEventData';

interface EventFormProps {
  mode: 'create' | 'edit';
  form: CreateEventForm;
  loading?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onTimeChange: (name: 'horaInicio' | 'horaFim', value: string) => void;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onOrganizerChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Organizer
  ) => void;
  onAddOrganizer: () => void;
  onRemoveOrganizer: (index: number) => void;
  onSubmit: () => void;
}

export default function EventForm({
  mode,
  form,
  loading = false,
  onChange,
  onTimeChange,
  onImageChange,
  onOrganizerChange,
  onAddOrganizer,
  onRemoveOrganizer,
  onSubmit,
}: EventFormProps) {
  const title = mode === 'create' ? 'Criar Evento' : 'Editar Evento';
  const buttonLabel = mode === 'create' ? 'Salvar evento' : 'Atualizar evento';

  const handleTimeInput =
    (name: 'horaInicio' | 'horaFim') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      onTimeChange(name, e.target.value);
    };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      <Paper sx={{ p: 3, opacity: loading ? 0.6 : 1 }}>
        <Grid container spacing={2}>
          {/* Coluna esquerda */}
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Título"
              name="titulo"
              value={form.titulo}
              onChange={onChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Descrição"
              name="descricao"
              value={form.descricao}
              onChange={onChange}
              margin="normal"
              multiline
              rows={4}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Data"
                  name="data"
                  type="date"
                  value={form.data}
                  onChange={onChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Hora de Início"
                  name="horaInicio"
                  type="time"
                  value={form.horaInicio}
                  onChange={handleTimeInput('horaInicio')}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Hora de Fim"
                  name="horaFim"
                  type="time"
                  value={form.horaFim}
                  onChange={handleTimeInput('horaFim')}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Local"
              name="local"
              value={form.local}
              onChange={onChange}
              margin="normal"
              required
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preço (opcional)"
                  name="preco"
                  value={form.preco}
                  onChange={onChange}
                  margin="normal"
                  placeholder="Ex: 33,00"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Traje (opcional)"
                  name="traje"
                  value={form.traje}
                  onChange={onChange}
                  margin="normal"
                  placeholder="Ex: Esporte fino, Livre..."
                />
              </Grid>
            </Grid>

            {/* IMAGENS */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Imagens do evento
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Selecionar imagens
                  <input
                    type="file"
                    hidden
                    multiple
                    name="images"
                    accept="image/*"
                    onChange={onImageChange}
                  />
                </Button>

                {form.images && form.images.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {form.images.length} imagem(ns) selecionada(s)
                  </Typography>
                )}
              </Stack>
            </Box>
          </Grid>

          {/* Coluna direita: organizadores */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Organizadores
            </Typography>

            {form.organizadores.map((organizador, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{ p: 2, mb: 2 }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Organizador {index + 1}
                </Typography>

                <TextField
                  fullWidth
                  label="Nome"
                  value={organizador.nome}
                  onChange={(e) =>
                    onOrganizerChange(e, index, 'nome')
                  }
                  margin="dense"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={organizador.email}
                  onChange={(e) =>
                    onOrganizerChange(e, index, 'email')
                  }
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="WhatsApp"
                  value={organizador.whatsapp}
                  onChange={(e) =>
                    onOrganizerChange(e, index, 'whatsapp')
                  }
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="Instagram"
                  value={organizador.instagram}
                  onChange={(e) =>
                    onOrganizerChange(e, index, 'instagram')
                  }
                  margin="dense"
                />

                {form.organizadores.length > 1 && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onRemoveOrganizer(index)}
                    sx={{ mt: 1 }}
                  >
                    Remover
                  </Button>
                )}
              </Paper>
            ))}

            <Button
              variant="text"
              onClick={onAddOrganizer}
              sx={{ mt: 1 }}
            >
              + Adicionar organizador
            </Button>
          </Grid>
        </Grid>

         {/* Ações */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: 3 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                {mode === 'create' ? 'Salvando...' : 'Atualizando...'}
              </>
            ) : (
              buttonLabel
            )}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
