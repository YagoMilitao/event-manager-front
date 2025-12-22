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
import { CreateEventForm } from '../data/CreateEventData';
import { Organizer } from '../data/OrganizerData';
import { EventImage } from '../data/EventData';
import { LocationMap } from './LocationMap';

interface EventFormProps {
  mode: 'create' | 'edit';
  form: CreateEventForm;
  loading?: boolean;

  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onTimeChange: (time: 'startTime' | 'endTime', value: string) => void;

  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;

  onToggleExistingImage?: (url: string) => void;

  onOrganizerChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Organizer,
  ) => void;

  onAddOrganizer: () => void;
  onRemoveOrganizer: (index: number) => void;

  onSubmit: () => void;

  // ✅ Para endereço/CEP: no CREATE e no EDIT você quer isso funcionando, então recomendo NÃO deixar opcional
  onAddressChange: (field: keyof CreateEventForm['address'], value: string) => void;
  onFetchCep: () => void;
}

export default function EventForm({
  mode,
  form,
  loading = false,
  onChange,
  onTimeChange,
  onImageChange,
  onRemoveImage,
  onToggleExistingImage,
  onOrganizerChange,
  onAddOrganizer,
  onRemoveOrganizer,
  onSubmit,
  onAddressChange,
  onFetchCep,
}: EventFormProps) {
  const title = mode === 'create' ? 'Criar Evento' : 'Editar Evento';
  const buttonLabel = mode === 'create' ? 'Salvar evento' : 'Atualizar evento';

  // helper pra ligar o input type="time" na função genérica
  const handleTimeInput =
    (time: 'startTime' | 'endTime') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      onTimeChange(time, e.target.value);
    };

  // imagens já salvas (edição)
  const existingImages: EventImage[] = form.existingImages || [];
  const imagesToDelete: string[] = form.imagesToDelete || [];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      <Paper sx={{ p: 3, opacity: loading ? 0.6 : 1 }}>
        <Grid container spacing={2}>
          {/* COLUNA ESQUERDA */}
          <Grid item xs={12} md={8}>
            {/* Nome */}
            <TextField
              fullWidth
              label="Nome do Evento"
              name="eventName"
              value={form.eventName}
              onChange={onChange}
              margin="normal"
              required
            />

            {/* Descrição */}
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

            {/* ✅ DATA/HORÁRIO (container separado e correto) */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Hora de Início"
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleTimeInput('startTime')}
                  margin="normal"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* ✅ Seu endTime tinha sumido no teu layout */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Hora de Fim"
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleTimeInput('endTime')}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* ✅ ENDEREÇO (container separado e correto) */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Endereço do evento
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={form.address.cep}
                  onChange={(e) => onAddressChange('cep', e.target.value)}
                  margin="normal"
                  placeholder="00000-000"
                  inputProps={{ maxLength: 9 }}
                />
              </Grid>

              <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={onFetchCep}
                  disabled={!form.address.cep || loading}
                  sx={{ mt: 2 }}
                >
                  Buscar CEP
                </Button>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Rua"
                  value={form.address.street}
                  onChange={(e) => onAddressChange('street', e.target.value)}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Número"
                  value={form.address.number}
                  onChange={(e) => onAddressChange('number', e.target.value)}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Bairro"
                  value={form.address.neighborhood}
                  onChange={(e) => onAddressChange('neighborhood', e.target.value)}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={form.address.city}
                  onChange={(e) => onAddressChange('city', e.target.value)}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="UF"
                  value={form.address.state}
                  onChange={(e) => onAddressChange('state', e.target.value)}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Complemento (opcional)"
                  value={form.address.complement || ''}
                  onChange={(e) => onAddressChange('complement', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>

            {/* ✅ Mostra mapa se tiver geo */}
            {form.geo?.lat && form.geo?.lng && (
              <Box sx={{ mt: 2 }}>
                <LocationMap lat={form.geo.lat} lng={form.geo.lng} />
              </Box>
            )}

            {/* Preço / traje */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
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

              {/* imagens atuais (edição) */}
              {existingImages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Imagens atuais
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {existingImages.map((img, index) => {
                      const isMarked = imagesToDelete.includes(img.url);
                      return (
                        <Box
                          key={img.filename || index}
                          sx={{
                            position: 'relative',
                            width: 140,
                            height: 100,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: isMarked ? 'error.main' : 'divider',
                            opacity: isMarked ? 0.6 : 1,
                          }}
                        >
                          <Box
                            component="img"
                            src={img.url}
                            alt={`Imagem atual ${index + 1}`}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />

                          {onToggleExistingImage && (
                            <Button
                              size="small"
                              color={isMarked ? 'inherit' : 'error'}
                              variant="contained"
                              onClick={() => onToggleExistingImage(img.url)}
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
                              {isMarked ? 'Manter' : 'Remover'}
                            </Button>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* novas imagens */}
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
                  Selecionar novas imagens
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
                    {form.images.length} nova(s) imagem(ns) selecionada(s)
                  </Typography>
                )}
              </Stack>

              {/* previews */}
              {form.imagePreviews && form.imagePreviews.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
                        alt={`Nova imagem ${index + 1}`}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

          {/* COLUNA DIREITA: organizadores */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Organizadores
            </Typography>

            {form.organizers.map((organizer, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Organizador {index + 1}
                </Typography>

                <TextField
                  fullWidth
                  label="Nome"
                  value={organizer.organizerName}
                  onChange={(e) => onOrganizerChange(e, index, 'organizerName')}
                  margin="dense"
                  required
                />

                <TextField
                  fullWidth
                  label="Email"
                  value={organizer.email}
                  onChange={(e) => onOrganizerChange(e, index, 'email')}
                  margin="dense"
                />

                <TextField
                  fullWidth
                  label="WhatsApp"
                  value={organizer.whatsapp}
                  onChange={(e) => onOrganizerChange(e, index, 'whatsapp')}
                  margin="dense"
                />

                <TextField
                  fullWidth
                  label="Instagram"
                  value={organizer.instagram}
                  onChange={(e) => onOrganizerChange(e, index, 'instagram')}
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

            <Button variant="text" onClick={onAddOrganizer} sx={{ mt: 1 }}>
              + Adicionar organizador
            </Button>
          </Grid>
        </Grid>

        {/* AÇÕES */}
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
