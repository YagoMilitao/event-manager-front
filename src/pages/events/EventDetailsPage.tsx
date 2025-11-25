/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlaceIcon from '@mui/icons-material/Place';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import ShareIcon from '@mui/icons-material/Share';
import { toast } from 'react-toastify';

import { EventData } from '../../data/EventData';
import EventDetailsSkeleton from '../../components/skeletons/EventDetailsSkeleton';
import { formatDatePt, formatHour } from '../../utils/dateTimeFormat';

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

  const handleHomePage = () => navigate('/');

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        toast.error('ID do evento não encontrado.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<EventData>(
          `${baseUrl}/api/events/${id}`,
        );
        setEvent(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao buscar detalhes do evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, baseUrl]);

  const handleShare = async () => {
    if (!event) return;

    const url = window.location.href;
    const title = event.titulo || 'Evento';

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `Dá uma olhada nesse evento: ${title}`,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success('Link do evento copiado para a área de transferência!');
      } else {
        toast.info('Seu navegador não suporta compartilhamento automático.');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <EventDetailsSkeleton />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Evento não encontrado</Typography>
        <Button variant="outlined" onClick={handleHomePage} sx={{ mt: 2 }}>
          Home
        </Button>
      </Container>
    );
  }

  const dateLabel = event.data ? formatDatePt(event.data as any) : '';
  const horaInicioLabel = formatHour(event.horaInicio as any);
  const horaFimLabel = formatHour(event.horaFim as any);

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        🔙 Voltar
      </Button>

      <Card>
        {/* Galeria simples: se tiver imagem de capa */}
        {event.image && (
          <CardMedia
            component="img"
            height="300"
            image={`${baseUrl}/api/events/image/${event._id}`}
            alt={event.titulo}
          />
        )}

        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                {event.titulo}
              </Typography>
              {event.descricao && (
                <Typography variant="body1" gutterBottom>
                  {event.descricao}
                </Typography>
              )}
            </Box>

            <IconButton
              color="primary"
              aria-label="Compartilhar evento"
              onClick={handleShare}
            >
              <ShareIcon />
            </IconButton>
          </Box>

          {/* Info principal */}
          <List dense sx={{ mt: 2 }}>
            {dateLabel && (
              <ListItem>
                <ListItemIcon>
                  <CalendarTodayIcon />
                </ListItemIcon>
                <ListItemText primary={dateLabel} />
              </ListItem>
            )}

            {(horaInicioLabel || horaFimLabel) && (
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    horaFimLabel
                      ? `${horaInicioLabel} - ${horaFimLabel}`
                      : horaInicioLabel
                  }
                />
              </ListItem>
            )}

            {event.local && (
              <ListItem>
                <ListItemIcon>
                  <PlaceIcon />
                </ListItemIcon>
                <ListItemText primary={event.local} />
              </ListItem>
            )}

            {event.preco && (
              <ListItem>
                <ListItemIcon>
                  <AttachMoneyIcon />
                </ListItemIcon>
                <ListItemText primary={`Preço: ${event.preco}`} />
              </ListItem>
            )}

            {event.traje && (
              <ListItem>
                <ListItemIcon>
                  <CheckroomIcon />
                </ListItemIcon>
                <ListItemText primary={`Traje: ${event.traje}`} />
              </ListItem>
            )}
          </List>

          {/* Organizadores */}
          {event.organizadores && event.organizadores.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Organizadores
              </Typography>

              <List dense>
                {event.organizadores.map((org, idx) => (
                  <ListItem key={idx} sx={{ alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={org.nome}
                      secondary={org.email || org.whatsapp || org.instagram}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {org.email && (
                        <IconButton
                          size="small"
                          component="a"
                          href={`mailto:${org.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      )}
                      {org.whatsapp && (
                        <IconButton
                          size="small"
                          component="a"
                          href={`https://wa.me/${org.whatsapp.replace(
                            /\D/g,
                            '',
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WhatsAppIcon fontSize="small" color="success" />
                        </IconButton>
                      )}
                      {org.instagram && (
                        <IconButton
                          size="small"
                          component="a"
                          href={org.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <InstagramIcon fontSize="small" color="secondary" />
                        </IconButton>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
