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
} from '@mui/material';
import { toast } from 'react-toastify';
import { EventData } from '../../data/EventData';
import EventDetailsSkeleton from '../../components/skeletons/EventDetailsSkeleton';
import { formatDatePt, formatHour } from '../../utils/dateTimeFormat';

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideImage, setHideImage] = useState(false); // 👈 controla se a imagem deve sumir
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
        const response = await axios.get(`${baseUrl}/api/events/${id}`);
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

  // 👇 tenta detectar se esse evento TEM imagem salva no back
  // se você sabe que o model tem `images` ou `imagem`, pode ajustar aqui
  const hasImageField =
    // se usar array de imagens no modelo:
    Array.isArray((event as any).images) && (event as any).images.length > 0 ||
    // ou se usar um campo único:
    (event as any).imagem;

  const shouldRenderImage = !hideImage && hasImageField;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1rem' }}
      >
        🔙 Voltar
      </button>

      <Card>
        {/* ✅ Só renderiza a imagem se realmente houver imagem */}
        {shouldRenderImage && (
          <CardMedia
            component="img"
            height="300"
            image={`${baseUrl}/api/events/image/${event._id}`}
            alt={event.titulo}
            onError={() => setHideImage(true)} // 👈 se der 404/erro, esconde o componente
          />
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

          {event.organizadores && event.organizadores.length > 0 && (
            <Typography variant="body2" gutterBottom>
              🧑‍💼 Organizadores:{' '}
              {event.organizadores.map((org) => org.nome).join(', ')}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
