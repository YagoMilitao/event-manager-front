import { Container, TextField, Button, Typography } from '@mui/material'
import { useCreateEventViewModel } from './CreateEventViewModel'
import { useEffect, useState } from 'react'
import EventFormSkeleton from '../../components/skeletons/EventFormSkeleton'
import axios from 'axios'
import { toast } from 'react-toastify'; 

export default function CreateEventPageScreen() {
  const { form, handleChange, handleImageChange, handleSubmit } = useCreateEventViewModel()
  const [loading, setLoading] = useState(true)

  // Hook useEffect é usado para realizar ações após a renderização do componente
 useEffect(() => {
  // Define uma função assíncrona para buscar os eventos da API
  const fetchEvents = async () => {
   try {
    // Faz uma requisição GET para a URL da API para buscar os eventos
    const response = await axios.get('https://event-manager-back.onrender.com/api/events');
    console.log(response.data)
    // Atualiza o estado 'events' com os dados recebidos da API
    // Verifica se response.data é um array ou se tem uma propriedade 'events' que é um array
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


if (loading) {
  return (
    <Container sx={{ mt: 4 }}>
      <EventFormSkeleton />
    </Container>
  )
 }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Criar Evento
      </Typography>

      <TextField
        fullWidth
        label="Título"
        name="titulo"
        value={form.titulo}
        onChange={handleChange}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Descrição"
        name="descricao"
        value={form.descricao}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={4}
      />

      <TextField
        fullWidth
        label="Data"
        name="data"
        type="date"
        value={form.data}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        label="Hora de Início"
        name="horaInicio"
        type="time"
        value={form.horaInicio}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        label="Local"
        name="local"
        value={form.local}
        onChange={handleChange}
        margin="normal"
      />

      <Button
        variant="contained"
        component="label"
        sx={{ mt: 2 }}
      >
        Upload Imagem
        <input type="file" hidden onChange={handleImageChange} />
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 4 }}
      >
        Criar Evento
      </Button>
    </Container>
  )
}
