import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Stack,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';

import { formatDatePt, formatHour } from '../../utils/dateTimeFormat';
import { useEventDetailsViewModel } from '../../viewModels/useEventDetailsViewModel';
import { EventImage } from '../../data/EventData';

const EventDetailsPageScreen: React.FC = () => {
  const theme = useTheme();
  const { event, loading, error, handleBack, handleShare } =
    useEventDetailsViewModel();

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Carregando detalhes do evento...</Typography>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Evento não encontrado.'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Voltar
        </Button>
      </Container>
    );
  }

  // 🔹 Dados derivados
  const title = event.eventName || 'Título não encontrado';

  const dateLabel = event.date
    ? formatDatePt(event.date as string)
    : 'Data não informada';

  const horaInicioLabel = event.startTime
    ? formatHour(event.startTime)
    : null;

  const horaFimLabel = event.endTime
    ? formatHour(event.endTime)
    : null;

  let timeRangeLabel = '';
  if (horaInicioLabel && horaFimLabel) {
    timeRangeLabel = `${horaInicioLabel} - ${horaFimLabel}`;
  } else if (horaInicioLabel) {
    timeRangeLabel = horaInicioLabel;
  }

  const hasOrganizers =
    Array.isArray(event.organizers) && event.organizers.length > 0;

  // 🔹 Resolve qual imagem principal mostrar (GCP primeiro, depois campo antigo image)
  const coverFromGcp: EventImage | undefined =
    event.coverImage ||
    (event.images && event.images.length > 0
      ? event.images[0]
      : undefined);

  const coverUrl = coverFromGcp?.url || event.image || undefined;

  // Outras imagens (galeria) — aqui você pode filtrar a capa se quiser
  const galleryImages: EventImage[] =
    event.images && event.images.length > 0 ? event.images : [];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* 🔹 Barra superior */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Voltar
        </Button>

        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={handleShare}
        >
          Compartilhar
        </Button>
      </Box>

      {/* 🔹 Card principal */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Título + chips */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {/* Data */}
            <Chip
              icon={<CalendarTodayIcon />}
              label={dateLabel}
              color="primary"
              variant="outlined"
            />

            {/* Horário */}
            {timeRangeLabel && (
              <Chip
                icon={<AccessTimeIcon />}
                label={timeRangeLabel}
                color="secondary"
                variant="outlined"
              />
            )}

            {event.dressCode && (
              <Chip label={`Traje: ${event.dressCode}`} variant="outlined" />
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 🔹 Imagem principal */}
        {coverUrl && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <img
              src={coverUrl}
              alt={title}
              style={{
                maxWidth: '100%',
                maxHeight: 400,
                borderRadius: 8,
                objectFit: 'cover',
              }}
            />
          </Box>
        )}

        {/* 🔹 Galeria de miniaturas (se houver mais de uma imagem) */}
        {galleryImages.length > 1 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Outras imagens
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {galleryImages.map((img, index) => (
                <Box
                  key={img.filename || index}
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <img
                    src={img.url}
                    alt={`Imagem ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* 🔹 Descrição */}
        {event.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Descrição
            </Typography>
            <Typography variant="body1">{event.description}</Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          {event.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PlaceIcon sx={{ mr: 1 }} />
              <Typography variant="body1">{event.location}</Typography>
            </Box>
          )}

          {event.price && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoneyIcon sx={{ mr: 1 }} />
              <Typography variant="body1">Preço: {event.price}</Typography>
            </Box>
          )}
        </Box>

        {/* 🔹 Organizadores */}
        {hasOrganizers && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Organizadores</Typography>
            </Box>

            <Stack spacing={1}>
              {event.organizers!.map((org, index) => {
                const whatsappLink = org.whatsapp
                  ? `https://wa.me/${org.whatsapp.replace(/\D/g, '')}`
                  : null;

                const instagramLink = org.instagram
                  ? `${org.instagram.replace('@', '')}`
                  : null;

                return (
                  <Box key={index}>
                    <Typography variant="subtitle1">{org.name}</Typography>

                    <Stack direction="row" spacing={1}>
                      {whatsappLink && (
                        <MuiLink
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </MuiLink>
                      )}

                      {instagramLink && (
                        <MuiLink
                          href={instagramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Instagram
                        </MuiLink>
                      )}

                      {org.email && (
                        <MuiLink href={`mailto:${org.email}`}>
                          E-mail
                        </MuiLink>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default EventDetailsPageScreen;
