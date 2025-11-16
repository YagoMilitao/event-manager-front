import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Stack,
  Divider,
  IconButton,
  Avatar,
  Chip,
} from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { useCreateEventViewModel } from './CreateEventViewModel';
import EventFormSkeleton from '../../components/skeletons/EventFormSkeleton';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  // Skeleton: simula carregamento inicial
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await axios.get('https://event-manager-back.onrender.com/api/events');
      } catch (error) {
        console.error('❌ Erro ao buscar eventos:', error);
        toast.error('Erro ao carregar eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Preview da imagem escolhida
  useEffect(() => {
    if (!form.image) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(form.image);
    setImagePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.image]);

  // Habilitar/desabilitar botão "Salvar" com base em campos obrigatórios
  const isSaveDisabled = useMemo(() => {
    const hasTitle = form.titulo.trim().length > 0;
    const hasDate = !!form.data;
    const hasLocal = form.local.trim().length > 0;
    const hasStartTime = !!form.horaInicio;

    const hasAtLeastOneOrganizerWithName = form.organizadores.some(
      (o) => o.nome.trim().length > 0
    );

    return !(
      hasTitle &&
      hasDate &&
      hasLocal &&
      hasStartTime &&
      hasAtLeastOneOrganizerWithName
    );
  }, [form]);

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <EventFormSkeleton />
      </Container>
    );
  }

  const handleSaveClick = async () => {
    const ok = await handleSubmit();
    if (ok) {
      navigate('/my-events'); // rota que você já usa após criar
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Criar Evento
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Preencha as informações abaixo para cadastrar um novo evento. Campos com
        <Typography component="span" color="error" sx={{ ml: 0.5 }}>
          *
        </Typography>{' '}
        são obrigatórios.
      </Typography>

      <Paper
        elevation={3}
        sx={{
          mt: 3,
          p: { xs: 2, md: 3 },
          borderRadius: 2,
        }}
      >
        {/* Seção: Informações do evento */}
        <Typography variant="h6" gutterBottom>
          Informações do evento
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Título do evento *"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            fullWidth
            required
            helperText="Um nome curto e claro para o evento."
          />

          <TextField
            label="Descrição"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            helperText="Fale um pouco sobre o evento (opcional)."
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
          >
            <TextField
              label="Data *"
              type="date"
              name="data"
              value={form.data}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />

            <TextField
              label="Hora de início *"
              name="horaInicio"
              type="time"
              value={form.horaInicio}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }} // 5 em 5 minutos
              fullWidth
              required
            />

            <TextField
              label="Hora de fim"
              name="horaFim"
              type="time"
              value={form.horaFim}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              fullWidth
            />
          </Stack>

          <TextField
            label="Local *"
            name="local"
            value={form.local}
            onChange={handleChange}
            fullWidth
            required
            helperText="Cidade, endereço ou ponto de referência."
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Preço (opcional)"
              name="preco"
              value={form.preco}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Traje (opcional)"
              name="traje"
              value={form.traje}
              onChange={handleChange}
              fullWidth
              placeholder="Ex: Esporte fino, Social, Livre..."
            />
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Seção: Organizadores */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6">Organizadores</Typography>
          <Chip
            label={`${form.organizadores.length} organizador${
              form.organizadores.length > 1 ? 'es' : ''
            }`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" mb={1}>
          Pelo menos um organizador com nome é obrigatório.
        </Typography>

        <Stack spacing={2}>
          {form.organizadores.map((organizador, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                borderColor: 'divider',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                mb={2}
              >
                <Avatar>
                  {organizador.nome
                    ? organizador.nome.charAt(0).toUpperCase()
                    : index + 1}
                </Avatar>
                <Typography variant="subtitle1">
                  Organizador {index + 1}
                </Typography>

                {form.organizadores.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveOrganizer(index)}
                    sx={{ marginLeft: 'auto' }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>

              <Stack spacing={1.5}>
                <TextField
                  label="Nome *"
                  value={organizador.nome}
                  onChange={(e) =>
                    handleOrganizerChange(e, index, 'nome')
                  }
                  required
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={organizador.email}
                  onChange={(e) =>
                    handleOrganizerChange(e, index, 'email')
                  }
                  fullWidth
                />
                <TextField
                  label="WhatsApp"
                  value={organizador.whatsapp}
                  onChange={(e) =>
                    handleOrganizerChange(e, index, 'whatsapp')
                  }
                  fullWidth
                />
                <TextField
                  label="Instagram"
                  value={organizador.instagram}
                  onChange={(e) =>
                    handleOrganizerChange(e, index, 'instagram')
                  }
                  fullWidth
                />
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddOrganizer}
          sx={{ mt: 2 }}
        >
          Adicionar organizador
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* Seção: Imagem do evento */}
        <Typography variant="h6" gutterBottom>
          Imagem do evento
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
            Selecionar imagem
            <input
              type="file"
              name="image"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>

          {form.image && (
            <Typography variant="body2" color="text.secondary">
              Arquivo selecionado: <strong>{form.image.name}</strong>
            </Typography>
          )}
        </Stack>

        {imagePreview && (
          <Box
            mt={2}
            sx={{
              width: '100%',
              maxWidth: 320,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <img
              src={imagePreview}
              alt="Pré-visualização do evento"
              style={{ width: '100%', display: 'block' }}
            />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Ações */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveClick}
            disabled={isSaveDisabled}
          >
            Salvar evento
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
