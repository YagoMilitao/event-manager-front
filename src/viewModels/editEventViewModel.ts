import { useState, useEffect } from 'react';
import axios from 'axios';
import { EventFormState } from '../data/EventFormData';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

export function useEditEventViewModel() {
  const [form, setForm] = useState<EventFormState>({
    titulo: '',
    descricao: '',
    data: '',
    horaInicio: '',
    local: '',
    preco: undefined,
    traje: '',
    image: null,
    loading: false,
  });

  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const event = response.data;
        setForm({
          titulo: event.titulo,
          descricao: event.descricao,
          data: event.data,
          horaInicio: event.horaInicio,
          local: event.local,
          preco: event.preco,
          traje: event.traje,
          image: null,
          loading: false,
        });
      } catch (error) {
        console.error('Erro ao carregar evento:', error);
        toast.error('Erro ao carregar evento.');
      }
    };
    if (token && id) {
      fetchEvent();
    }
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, loading: true }));

    try {
      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('descricao', form.descricao);
      formData.append('data', form.data);
      formData.append('horaInicio', form.horaInicio);
      formData.append('local', form.local);
      if (form.preco) formData.append('preco', form.preco.toString());
      if (form.traje) formData.append('traje', form.traje);
      if (form.image) formData.append('image', form.image);

      await axios.put(`${import.meta.env.VITE_API_URL}/events/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Evento atualizado com sucesso!');
      navigate('/my-event');
    } catch (error) {
      console.error('Erro ao editar evento:', error);
      toast.error('Erro ao editar evento.');
    } finally {
      setForm((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    form,
    handleChange,
    handleFileChange,
    handleSubmit,
  };
}
