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
import { CreateEventForm} from '../data/CreateEventData';
import { Organizer } from '../data/OrganizerData';

interface EventFormProps {
  mode: 'create' | 'edit';
  form: CreateEventForm;
  loading?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onTimeChange: (name: 'horaInicio' | 'horaFim', value: string) => void;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
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
  onRemoveImage,
  onOrganizerChange,
  onAddOrganizer,
  onRemoveOrganizer,
  onSubmit,
}: EventFormProps) {
  const title = mode === 'create' ? 'Criar Evento' : 'Editar Evento';
  const buttonLabel = mode === 'create' ? 'Salvar evento' : 'Atualizar evento';

  // helper pra ligar o input type="time" na função genérica
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
              label="Nome do Evento"
              name="eventName"
              value={form.eventName}
              onChange={onChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Descrição do evento"
              name="description"
              value={form.description}
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
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={onChange}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Hora de Início"
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleTimeInput('horaInicio')}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Hora de Fim"
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleTimeInput('horaFim')}
                  margin="normal"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Local"
              name="location"
              value={form.location}
              onChange={onChange}
              margin="normal"
              required
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preço (opcional)"
                  name="price"
                  value={form.price}
                  onChange={onChange}
                  margin="normal"
                  placeholder="Ex: 33,00"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Traje (opcional)"
                  name="dressCode"
                  value={form.dressCode}
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

                {/* contador simples */}
                {form.images && form.images.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {form.images.length} imagem(ns) selecionada(s)
                  </Typography>
                )}
              </Stack>

              {/* 🔹 NOVO: grade de miniaturas */}
              {form.imagePreviews && form.imagePreviews.length > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  {form.imagePreviews.map((src, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 140,
                        height: 100,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        component="img"
                        src={src}
                        alt={`Imagem ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={() => onRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          px: 1,
                          py: 0,
                          minWidth: 'auto',
                          fontSize: '0.7rem',
                        }}
                      >
                        Remover
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Coluna direita: organizadores */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Organizadores
            </Typography>

            {form.organizers.map((organizer, index) => (
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
                  value={organizer.name}
                  onChange={(e) =>
                    onOrganizerChange(e, index, 'name')
                  }
                  margin="dense"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={organizer.email}
                  onChange={(e) =>
                    onOrganizerChange(e, index, 'email')
                  }
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="WhatsApp"
                  value={organizer.whatsapp}
                  onChange={(e) =>
                    onOrganizerChange(e, index, 'whatsapp')
                  }
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="Instagram"
                  value={organizer.instagram}
                  onChange={(e) =>
                    onOrganizerChange(e, index, 'instagram')
                  }
                  margin="dense"
                />

                {form.organizers.length > 1 && (
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
