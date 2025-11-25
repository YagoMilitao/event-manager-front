import {
  Container,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';


export default function UserEventDashboard() {
  const navigate = useNavigate()
  const handleCreateEvent = () => navigate('/create-event')
  const handleMyEvents = () => navigate('/my-eventsevents')
  const handleHomePage=() => navigate('/')
  return (
    <Container sx={{ mt: 4 }}>

      <Typography variant="h4" gutterBottom>
        Evento
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleMyEvents}>
          Meus eventos criados
        </Button>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCreateEvent}>
          Criar Evento
        </Button>
      </Box>
      <Button
        variant="outlined"
        onClick={handleHomePage}
        sx={{mt:2}}
      >
        Home
      </Button>
    </Container>
  );
}