import { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Grid, Card, CardContent, Typography, CardMedia, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'
import { useAppSelector } from '../store/hooks'

interface Event {
  _id: string
  titulo: string
  descricao: string
  data: string
  horaInicio: string
  local: string
  image?: string
}

export default function MyEventsPage() {
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const token = useAppSelector((state) => state.auth.token)

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        if (!token) {
          toast.error('Você precisa estar logado para ver seus eventos')
          return
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/my-event`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setMyEvents(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('❌ Erro ao buscar seus eventos:', error)
        toast.error('Erro ao carregar seus eventos')
      } finally {
        setLoading(false)
      }
    }

    fetchMyEvents()
  }, [token])

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
        Meus Eventos
      </Typography>

      {myEvents.length === 0 ? (
        <Typography variant="body1">Você ainda não criou nenhum evento</Typography>
      ) : (
        <Grid container spacing={3}>
          {myEvents.map((event) => (

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
                    {event.descricao || 'Sem descrição'}
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
      )}
    </Container>
  )
}
