import { Button, Container, Typography, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function EventsPage() {
 const navigate = useNavigate()

 return (
  <Container sx={{ mt: 4 }}>
   <Typography variant="h4" gutterBottom>
    Área de Eventos
   </Typography>
   <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
    <Button variant="contained" onClick={() => navigate('/my-events')}>
     Meus Eventos
    </Button>
    <Button variant="outlined" onClick={() => navigate('/create-event')}>
     Criar Evento
    </Button>
   </Stack>
  </Container>
 )
}