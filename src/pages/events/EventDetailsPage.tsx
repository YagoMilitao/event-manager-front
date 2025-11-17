// src/pages/events/EventDetailsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box,
} from '@mui/material';
import { toast } from 'react-toastify';
import { EventData } from '../../data/EventData';
import EventDetailsSkeleton from '../../components/skeletons/EventDetailsSkeleton';
import { formatDatePt, formatHour } from '../../utils/dateTimeFormat';

type EventImage = {
  data: string;
  contentType: string;
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideFallbackImage, setHideFallbackImage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const navigate = useNavigate();
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

  const handleHomePage = () => navigate('/');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/events/${id}`,
        );
        setEvent(response.data);
      } catch (error) {
        console.error('Erro ao buscar detalhes do evento:', error);
        toast.error('Erro ao buscar detalhes do evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, baseUrl]);

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
        <Typography variant="h5" gutterBottom>
          Evento não encontrado
        </Typography>
        <Button
          variant="outlined"
          onClick={handleHomePage}
          sx={{ mt: 2 }}
        >
          Home
        </Button>
      </Container>
    );
  }

  const dateLabel = formatDatePt(event.data as unknown as string);
  const horaInicioLabel = formatHour(event.horaInicio as any);
  const horaFimLabel = formatHour(event.horaFim as any);

  const timeRangeLabel =
    horaInicioLabel && horaFimLabel
      ? `${horaInicioLabel} - ${horaFimLabel}`
      : horaInicioLabel;

  // 👇 tenta ler o array de imagens retornado pelo back
  const images = (event as any).images as EventImage[] | undefined;
  const hasImages = Array.isArray(images) && images.length > 0;

  // URL da imagem principal (capa da galeria)
  const mainImageSrc = hasImages
    ? `data:${images[selectedImageIndex].contentType};base64,${images[selectedImageIndex].data}`
    : !hideFallbackImage
    ? `${baseUrl}/api/events/image/${event._id}`
    : undefined;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1rem' }}
      >
        🔙 Voltar
      </button>

      <Card>
        {/* IMAGEM PRINCIPAL */}
        {mainImageSrc && (
          <CardMedia
            component="img"
            height="320"
            image={mainImageSrc}
            alt={event.titulo}
            onError={() => setHideFallbackImage(true)}
          />
        )}

        {/* THUMBNAILS DA GALERIA */}
        {hasImages && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              px: 2,
              py: 1.5,
              overflowX: 'auto',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {images.map((img, idx) => {
              const thumbSrc = `data:${img.contentType};base64,${img.data}`;
              const isSelected = idx === selectedImageIndex;
              return (
                <Box
                  key={idx}
                  component="img"
                  src={thumbSrc}
                  alt={`Imagem ${idx + 1}`}
                  onClick={() => setSelectedImageIndex(idx)}
                  sx={{
                    width: 72,
                    height: 72,
                    objectFit: 'cover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: isSelected
                      ? '2px solid #1976d2'
                      : '1px solid #ccc',
                    opacity: isSelected ? 1 : 0.7,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      opacity: 1,
                      boxShadow: 2,
                    },
                  }}
                />
              );
            })}
          </Box>
        )}

        <CardContent>
          <Typography variant="h4" gutterBottom>
            {event.titulo}
          </Typography>

          <Typography variant="body1" gutterBottom>
            {event.descricao || 'Sem descrição'}
          </Typography>

          {dateLabel && (
            <Typography variant="body2" gutterBottom>
              📅 {dateLabel}
            </Typography>
          )}

          {timeRangeLabel && (
            <Typography variant="body2" gutterBottom>
              🕒 {timeRangeLabel}
            </Typography>
          )}

          {event.local && (
            <Typography variant="body2" gutterBottom>
              📍 {event.local}
            </Typography>
          )}

          {event.preco && (
            <Typography variant="body2" gutterBottom>
              💸 Preço: {event.preco}
            </Typography>
          )}

          {event.traje && (
            <Typography variant="body2" gutterBottom>
              🎽 Traje: {event.traje}
            </Typography>
          )}

          {event.organizadores &&
            event.organizadores.length > 0 && (
              <Typography variant="body2" gutterBottom>
                🧑‍💼 Organizadores:{' '}
                {event.organizadores
                  .map((org) => org.nome)
                  .join(', ')}
              </Typography>
            )}
        </CardContent>
      </Card>
    </Container>
  );
}
