import React, { useEffect, useState } from 'react'; // Importa as funcionalidades de estado e efeitos do React
import axios from 'axios'; // Importa a biblioteca axios para fazer requisições HTTP
import { Container, Grid, Card, CardContent, Typography, CardMedia, CircularProgress } from '@mui/material'; // Importa componentes visuais do Material UI
import { toast } from 'react-toastify'; // Importa a biblioteca para exibir notificações (toasts)
import LoginLogoutButtons from '../components/LoginLogoutButtons'; // Importa um componente customizado para botões de login/logout

// Interface que define a estrutura de um objeto Event
interface Event {
  _id: string; // Identificador único do evento (geralmente gerado pelo backend)
  titulo: string; // Título do evento
  descricao: string; // Descrição do evento
  data: string; // Data do evento (formato string, ex: '2024-05-10')
  horaInicio: string; // Hora de início do evento (formato string, ex: '19:00')
  local: string; // Local onde o evento acontecerá
  image?: string; // URL da imagem do evento (opcional, indicado pelo '?')
}

// Componente funcional HomePage
export default function HomePage() {
  // Cria um estado 'events' para armazenar a lista de eventos, inicializado como um array vazio de objetos Event
  const [events, setEvents] = useState<Event[]>([]);
  // Cria um estado 'loading' para controlar a exibição de um indicador de carregamento, inicializado como true
  const [loading, setLoading] = useState(true);

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
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <CircularProgress /> {/* Componente do Material UI que mostra uma animação de carregamento */}
      </Container>
    );
  }

  // Se 'loading' for false, renderiza a lista de eventos
  return (
    <Container sx={{ mt: 4 }}> {/* Container do Material UI para centralizar e dar margem ao conteúdo */}
      <Typography variant="h4" gutterBottom> {/* Título principal da seção de eventos */}
        Eventos disponíveis
      </Typography>

      {/* Container do sistema de grid do Material UI */}
      <Grid container spacing={3}>
        {/* Mapeia a lista de 'events' e para cada evento, renderiza um item de grid */}
        {events.map((event) => (
          // Cada item de grid ocupa diferentes proporções de largura em diferentes tamanhos de tela
          // xs={12}: ocupa 12 colunas (largura total) em telas extra pequenas
          // sm={6}: ocupa 6 colunas (metade da largura) em telas pequenas
          // md={4}: ocupa 4 colunas (um terço da largura) em telas médias e grandes
          // key={event._id}: uma chave única é necessária para que o React possa identificar cada item na lista
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            {/* Componente de cartão do Material UI para agrupar informações do evento */}
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Se o evento tiver uma imagem, renderiza o componente CardMedia */}
              {event.image && (
                <CardMedia
                  component="img" // Indica que o componente renderiza uma tag <img>
                  height="200" // Define a altura da imagem
                  // Monta a URL da imagem a partir da URL base da API e o ID do evento
                  image={`https://event-manager-back.onrender.com/events/image/${event._id}`}
                  alt={event.titulo} // Texto alternativo para a imagem (importante para acessibilidade)
                />
              )}
              {/* Conteúdo do cartão */}
              <CardContent>
                {/* Título do evento dentro do cartão */}
                <Typography variant="h6" gutterBottom>
                  {event.titulo}
                </Typography>
                {/* Descrição do evento, com um texto padrão caso a descrição não esteja disponível */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.descricao || 'Sem descrição disponível'}
                </Typography>
                {/* Data e hora do evento */}
                <Typography variant="body2" color="text.secondary">
                  📅 {new Date(event.data).toLocaleDateString()} - 🕒 {event.horaInicio}
                </Typography>
                {/* Local do evento */}
                <Typography variant="body2" color="text.secondary">
                  📍 {event.local}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Renderiza o componente de botões de login/logout */}
      <LoginLogoutButtons />
    </Container>
  );
}