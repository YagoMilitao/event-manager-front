import { useState } from 'react';
import axios from 'axios';
import { EventFormState } from '../state/EventFormState';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function useCreateEventViewModel() {
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

      await axios.post(`${import.meta.env.VITE_API_URL}/events`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Evento criado com sucesso!');
      navigate('/my-event');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento.');
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
