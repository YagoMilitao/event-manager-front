import { useEffect, useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Stack,
  Box,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useCreateEventViewModel } from './CreateEventViewModel';
import EventFormSkeleton from '../../components/skeletons/EventFormSkeleton';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CreateEventPageScreen() {
  const {
    form,
    handleChange,
    handleImageChange,
    handleOrganizerChange,
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleSubmit,
  } = useCreateEventViewModel();

  const [loading, setLoading] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Carrega algo da API só pra mostrar skeleton
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/events`,
        );
        console.log('Eventos (só pra teste Skeleton):', response.data);
      } catch (error) {
        console.error('❌ Erro ao buscar eventos:', error);
        toast.error('Erro ao carregar eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 🔍 Gera/prepara URLs de preview quando as imagens mudam
  useEffect(() => {
    // limpa URLs antigas
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    if (!form.images || form.images.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = form.images.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // cleanup quando o componente desmontar
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.images]);

  const handleSaveClick = async () => {
    const success = await handleSubmit();
    if (success) {
      // se quiser, aqui você pode navegar ou limpar campos extras
      // navigate('/my-events');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <EventFormSkeleton />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Criar Evento
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Coluna esquerda */}
          <Grid item xs={12} md={8}>
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
              onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                    name="images" // 👈 bate com upload.array("images")
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>

                {form.images && form.images.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {form.images.length} imagem(ns) selecionada(s)
                  </Typography>
                )}
              </Stack>

              {/* Thumbnails */}
              {previewUrls.length > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  {previewUrls.map((url, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      sx={{
                        width: 96,
                        height: 96,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid #ccc',
                        boxShadow: 1,
                      }}
                    />
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
                    handleOrganizerChange(e, index, 'nome')
                  }
                  margin="dense"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={organizador.email}
                  onChange={(e) =>
                    handleOrganizerChange(e, index, 'email')
                  }
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="WhatsApp"
                  value={organizador.whatsapp}
                  onChange={(e) =>
                    handleOrganizerChange(e, index, 'whatsapp')
                  }
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="Instagram"
                  value={organizador.instagram}
                  onChange={(e) =>
                    handleOrganizerChange(e, index, 'instagram')
                  }
                  margin="dense"
                />

                {form.organizadores.length > 1 && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveOrganizer(index)}
                    sx={{ mt: 1 }}
                  >
                    Remover
                  </Button>
                )}
              </Paper>
            ))}

            <Button
              variant="text"
              onClick={handleAddOrganizer}
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
            onClick={handleSaveClick}
          >
            Salvar evento
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
