import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Box,
  Skeleton,
} from '@mui/material';
import { Grid } from '@mui/material';
import { EventData } from '../../data/EventData'; 

interface MyEventsPageScreenProps {
  events: EventData[]; // <<-- Agora usando EventData
  loading: boolean;
  error: string | null;
  onLogout: () => void;
}

const MyEventsPageScreen: React.FC<MyEventsPageScreenProps> = ({ events, loading, error, onLogout }) => {
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        {/* <CircularProgress /> */}
        <Skeleton animation="wave" />
        {/* <Typography variant="h6" sx={{ ml: 2 }}>Carregando seus eventos...</Typography> */}
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" component={RouterLink} to="/" sx={{ mt: 2 }}>
          Voltar para a Home
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Meus Eventos
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">Home</Button>
          <Button color="inherit" component={RouterLink} to="/create-event">Criar Novo Evento</Button>
          <Button color="inherit" onClick={onLogout}>Sair</Button>
        </Toolbar>
      </AppBar>

      <Typography variant="h4" component="h1" gutterBottom align="center">
        Meus Eventos
      </Typography>

      {events.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          Você ainda não criou nenhum evento. <RouterLink to="/create-event">Crie um agora!</RouterLink>
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {event.image && (
                  <Box
                    component="img"
                    src={event.image}
                    alt={event.titulo}
                    sx={{
                      height: 180,
                      width: '100%',
                      objectFit: 'cover',
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {event.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.descricao.substring(0, 100)}...
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Data: {new Date(event.data).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Local: {event.local}
                  </Typography>
                  {event.horaInicio && (
                    <Typography variant="body2" color="text.secondary">
                      Início: {event.horaInicio}
                    </Typography>
                  )}
                  {event.horaFim && (
                    <Typography variant="body2" color="text.secondary">
                      Fim: {event.horaFim}
                    </Typography>
                  )}
                  {event.traje && (
                    <Typography variant="body2" color="text.secondary">
                      Traje: {event.traje}
                    </Typography>
                  )}
                  {event.preco && (
                    <Typography variant="body2" color="text.secondary">
                      Preço: {event.preco}
                    </Typography>
                  )}
                  {event.organizadores && event.organizadores.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Organizadores: {event.organizadores.map(org => org.nome).join(', ')}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    component={RouterLink}
                    to={`/events/${event._id}`}
                  >
                    Ver Detalhes
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    component={RouterLink}
                    to={`/edit-event/${event._id}`}
                  >
                    Editar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyEventsPageScreen;