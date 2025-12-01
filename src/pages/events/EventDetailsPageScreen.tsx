// 🔹 Tela de detalhes do evento (somente UI + uso do viewModel)

import React from 'react'; // importa React
import { useTheme } from '@mui/material/styles'; // hook para acessar o tema (dark/light)
import {
  Container, // wrapper que centraliza conteúdo
  Typography, // textos
  Box, // div flexível
  Paper, // cartão com fundo elevado
  Chip, // etiquetas (tags)
  Button, // botões
  Stack, // layout em coluna/linha com espaçamento
  Divider, // linha separadora
  Link as MuiLink, // link estilizado do MUI
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // ícone de voltar
import ShareIcon from '@mui/icons-material/Share'; // ícone de compartilhar
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // ícone de calendário
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // ícone de relógio
import PlaceIcon from '@mui/icons-material/Place'; // ícone de local
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // ícone de preço
import PeopleIcon from '@mui/icons-material/People'; // ícone de pessoas

import { formatDatePt, formatHour } from '../../utils/dateTimeFormat'; // funções de formatação que você já tem
import { useEventDetailsViewModel } from '../../viewModels/useEventDetailsViewModel'; // nosso viewModel novinho

const EventDetailsPageScreen: React.FC = () => {
  const theme = useTheme(); // pega o tema atual (dark/light)
  const { event, loading, error, handleBack, handleShare } = useEventDetailsViewModel(); // usa o viewModel para pegar dados e ações

  // 🔹 Estado de loading
  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Carregando detalhes do evento...</Typography>
      </Container>
    );
  }

  // 🔹 Estado de erro
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

  // 🔹 Deriva dados formatados do evento
  const title = event.titulo ||  'Evento'; // garante um título
  const dateLabel = event.data ? formatDatePt(event.data) : 'Data não informada'; // formata a data
  const horaInicioLabel = event.horaInicio
    ? formatHour(event.horaInicio)
    : null; // formata hora de início
  const horaFimLabel = event.horaFim ? formatHour(event.horaFim) : null; // formata hora de fim

  let timeRangeLabel = ''; // string do horário mostrado na tela
  if (horaInicioLabel && horaFimLabel) {
    timeRangeLabel = `${horaInicioLabel} - ${horaFimLabel}`; // exemplo: 19:00 - 22:00
  } else if (horaInicioLabel) {
    timeRangeLabel = horaInicioLabel; // exemplo: 19:00
  }

  const hasOrganizers = Array.isArray(event.organizadores) && event.organizadores.length > 0; // verifica se tem organizadores

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* 🔹 Barra superior com botão de voltar e compartilhar */}
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

      {/* 🔹 Card principal do evento */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Título + tags básicas */}
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
            {/* Traje */}
            {event.traje && (
              <Chip
                label={`Traje: ${event.traje}`}
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Descrição */}
        {event.descricao && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Descrição
            </Typography>
            <Typography variant="body1">{event.descricao}</Typography>
          </Box>
        )}

        {/* Local + preço */}
        <Box sx={{ mb: 2 }}>
          {event.local && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PlaceIcon sx={{ mr: 1 }} />
              <Typography variant="body1">{event.local}</Typography>
            </Box>
          )}

          {event.preco && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoneyIcon sx={{ mr: 1 }} />
              <Typography variant="body1">Preço: {event.preco}</Typography>
            </Box>
          )}
          
        </Box>
        {event.image && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <img src={event.image} alt={event.titulo || 'Imagem do evento'} style={{ maxWidth: '100%', maxHeight: 400 }} />
            </Box>
          )}

        {/* Organizadores com links clicáveis */}
        {hasOrganizers && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Organizadores</Typography>
            </Box>

            <Stack spacing={1}>
              {event.organizadores!.map((org, index) => {
                // monta links se os campos existirem
                const whatsappLink = org.whatsapp
                  ? `https://wa.me/${org.whatsapp.replace(/\D/g, '')}`
                  : null; // remove caracteres não numéricos
                const instagramLink = org.instagram
                  ? `${org.instagram.replace('@', '')}`
                  : null;

                return (
                  <Box key={index}>
                    <Typography variant="subtitle1">{org.nome}</Typography>

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
