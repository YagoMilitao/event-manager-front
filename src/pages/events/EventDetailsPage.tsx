import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { Container, Typography, Card, CardMedia, CardContent } from '@mui/material'
import { toast } from 'react-toastify'
import { EventData } from '../../data/EventData'
import EventDetailsSkeleton from '../../components/skeletons/EventDetailsSkeleton'

export default function EventDetailsPage() {
 const { id } = useParams()
 const [event, setEvent] = useState<EventData | null>(null)
 const [loading, setLoading] = useState(true)
 const navigate = useNavigate()

 useEffect(() => {
  const fetchEvent = async () => {
   try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/:${id}`)
    setEvent(response.data)
   } catch (error) {
    toast.error('Erro ao buscar detalhes do evento')
    console.error(error)
   } finally {
    setLoading(false)
   }
  }

  fetchEvent()
 }, [id])

 if (loading) {
  return (
    <Container sx={{ mt: 4 }}>
      <EventDetailsSkeleton />
    </Container>
  )
 }

 if (!event) {
  return (
   <Container sx={{ mt: 4 }}>
    <Typography variant="h5">Evento não encontrado</Typography>
   </Container>
  )
 }

 return (
  <Container sx={{ mt: 4 }}>
    <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
    🔙 Voltar
   </button>
   <Card>
    {event.image && (
     <CardMedia
      component="img"
      height="300"
      image={`${import.meta.env.VITE_API_URL}/events/image/${event._id}`}
      alt={event.titulo}
     />
    )}
    <CardContent>
     <Typography variant="h4" gutterBottom>{event.titulo}</Typography>
     <Typography variant="body1" gutterBottom>{event.descricao || 'Sem descrição'}</Typography>
     <Typography variant="body2">📅 {new Date(event.data).toLocaleDateString()}</Typography>
     <Typography variant="body2">🕒 {event.horaInicio} {event.horaFim ? `- ${event.horaFim}` : ''}</Typography>
     <Typography variant="body2">📍 {event.local}</Typography>
     {event.preco && <Typography variant="body2">💸 Preço: {event.preco}</Typography>}
     {event.traje && <Typography variant="body2">🎽 Traje: {event.traje}</Typography>}
     {/*event.organizadores && <Typography variant="body2">🧑‍💼 Organizadores: {event.organizadores.map()}</Typography>*/}
    </CardContent>
   </Card>
  </Container>
 )
}