import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; 
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material'; // Importa componentes visuais do Material UI
import { toast } from 'react-toastify'; 
import LoginLogoutButtons from '../components/LoginLogoutButtons'; 
import { EventData } from '../data/EventData';
import { useAppSelector } from '../store/hooks'
import EventListSkeleton from '../components/skeletons/EventListSkeleton';
import { formatDatePt, formatHour } from '../utils/dateTimeFormat';

// Componente funcional HomePage
export default function HomePage() {
 // Cria um estado 'events' para armazenar a lista de eventos, inicializado como um array vazio de objetos Event
 const [events, setEvents] = useState<EventData[]>([]);
 // Cria um estado 'loading' para controlar a exibição de um indicador de carregamento, inicializado como true
 const [loading, setLoading] = useState(true);
 const token = useAppSelector((state) => state.auth.token)

 // Hook useEffect é usado para realizar ações após a renderização do componente
 useEffect(() => {
  // Define uma função assíncrona para buscar os eventos da API
  const fetchEvents = async () => {
   try {
    // Faz uma requisição GET para a URL da API para buscar os eventos
    const response = await axios.get('https://event-manager-back.onrender.com/api/events');
    // Atualiza o estado 'events' com os dados recebidos da API
    // Verifica se response.data é um array ou se tem uma propriedade 'events' que é um array
    setEvents(Array.isArray(response.data) ? response.data : response.data.events || []);
   } catch (error) {
    // Em caso de erro na requisição, loga o erro no console
    console.error('❌ Erro ao buscar eventos:', error);
    // Exibe uma notificação de erro para o usuário
    toast.error('Erro ao carregar eventos');
   } finally {
    // A cláusula finally garante que 'setLoading' seja chamado, independentemente de sucesso ou falha
    setLoading(false); // Define 'loading' como false, indicando que a busca terminou
   }
  };
  // Chama a função para buscar os eventos quando o componente é montado (ou quando suas dependências mudam, neste caso, nenhuma dependência)
  fetchEvents();
 }, []); // O array vazio de dependências significa que este efeito roda apenas uma vez após a primeira renderização

 // Se 'loading' for true, renderiza um indicador de carregamento
 if (loading) {

    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Eventos
        </Typography>

        {/* Botão de Meus Eventos só se estiver logado */}
        {token && (
          <Link to="/event-dashboard" style={{ textDecoration: 'none' }}>
            <button style={{ marginBottom: '1rem' }}>📁 Meus Eventos</button>
          </Link>
        )}
         <EventListSkeleton rows={6} showActions={true} />

        {/* Skeleton da lista de eventos */}
        <LoginLogoutButtons />
      </Container>
    );
 }
 const today = new Date()
 // Se 'loading' for false, renderiza a lista de eventos
 return (
  <Container sx={{ mt: 4 }}>
    <Typography variant="h4" gutterBottom>
      Eventos
    </Typography>
    {/* Botão de Meus Eventos só se estiver logado */}
    {token && (
      <Link to="/event-dashboard" style={{ textDecoration: 'none' }}>
       <button style={{ marginBottom: '1rem' }}>📁 Meus Eventos</button>
      </Link>
     )}
    {/* Lista de eventos futuros */}
    <List>
     {events.map((event) => {
      const eventDate = new Date(event.data)
      const isPast = eventDate < today
      const dateLabel = formatDatePt(event.data);
      const horaInicioLabel = formatHour(event.horaInicio);
      const horaFimLabel = formatHour(event.horaFim);
        
      // "19:30 - 22:00" ou só "19:30"
      let timeRangeLabel = '';
      if (horaInicioLabel && horaFimLabel) {
        timeRangeLabel = `${horaInicioLabel} - ${horaFimLabel}`;
      } else if (horaInicioLabel) {
        timeRangeLabel = horaInicioLabel;
      }
    
      // Ex.: "16/11/2025 às 19:30 - 22:00 • São Paulo"
      const secondaryText = [
        dateLabel || null,
        timeRangeLabel ? `às ${timeRangeLabel}` : null,
        event.local || null,
      ]
        .filter(Boolean)
        .join(' • ');

      return (
       <ListItem
        key={event._id}
        sx={{
         backgroundColor: isPast ? '#f0f0f0' : '#fff',
         color: isPast ? '#999' : 'inherit',
         borderBottom: '1px solid #ccc',
        }}
       >
        <ListItemText
         primary={event.titulo}
         secondary={secondaryText}
        />
        {!isPast && (
         <Link to={`/api/events/${event._id}`} style={{ textDecoration: 'none' }}>
          Ver detalhes
         </Link>
        )}
       </ListItem>
      )
     })}
    </List>
    <LoginLogoutButtons />
  </Container>
 );
}