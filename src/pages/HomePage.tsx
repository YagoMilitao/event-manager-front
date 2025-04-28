import { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Grid, Card, CardContent, Typography, CardMedia, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'

interface Event {
  _id: string
  titulo: string
  descricao: string
  data: string
  horaInicio: string
  local: string
  image?: string
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}api/events`)
        setEvents(Array.isArray(response.data) ? response.data : response.data.events || [])
      } catch (error) {
        console.error('❌ Erro ao buscar eventos:', error)
        toast.error('Erro ao carregar eventos')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Eventos disponíveis
      </Typography>

      <Grid container spacing={3}>
        {events.map((event) => (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {event.image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={`${import.meta.env.VITE_API_URL}/events/image/${event._id}`}
                  alt={event.titulo}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {event.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.descricao || 'Sem descrição disponível'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📅 {new Date(event.data).toLocaleDateString()} - 🕒 {event.horaInicio}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📍 {event.local}
                </Typography>
              </CardContent>
            </Card>
        ))}
      </Grid>
    </Container>
  )
}
