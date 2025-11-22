/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

import { RootState } from '../store/store';
import { CreateEventForm, Organizer } from '../data/CreateEventData';
import { EventData } from '../data/EventData';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';

interface EditEventViewModel {
  form: CreateEventForm;
  loading: boolean;
  saving: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleTimeChange: (name: 'horaInicio' | 'horaFim', value: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOrganizerChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Organizer
  ) => void;
  handleAddOrganizer: () => void;
  handleRemoveOrganizer: (index: number) => void;
  handleSubmit: () => Promise<void>;
}

const emptyOrganizer: Organizer = {
  nome: '',
  email: '',
  whatsapp: '',
  instagram: 'https://www.instagram.com/',
};

const emptyForm: CreateEventForm = {
  titulo: '',
  descricao: '',
  data: '',
  horaInicio: '',
  horaFim: '',
  local: '',
  preco: '',
  traje: '',
  organizadores: [emptyOrganizer],
  images: [],
};

function numberToTimeString(value?: number | null): string {
  if (value === null || value === undefined) return '';
  const raw = value.toString().padStart(4, '0'); // 930 -> "0930"
  const hh = raw.slice(0, 2);
  const mm = raw.slice(2, 4);
  return `${hh}:${mm}`;
}

function timeStringToNumber(value: string): number | undefined {
  if (!value) return undefined;
  const onlyDigits = value.replace(':', '');
  const num = Number(onlyDigits);
  if (Number.isNaN(num)) return undefined;
  return num;
}

export function useEditEventViewModel(): EditEventViewModel {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);

  const [form, setForm] = useState<CreateEventForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

  const fetchEvent = useCallback(async () => {
    if (!id) {
      toast.error('ID do evento não encontrado na rota.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get<EventData>(
        `${baseUrl}/api/events/${id}`,
      );
      const event = response.data as any;

      const organizersFromApi: Organizer[] =
        event.organizadores && Array.isArray(event.organizadores)
          ? event.organizadores
          : [emptyOrganizer];

      setForm({
        titulo: event.nome || event.titulo || '',
        descricao: event.descricao || '',
        data: event.data ? event.data.substring(0, 10) : '',
        horaInicio: numberToTimeString(event.horaInicio),
        horaFim: numberToTimeString(event.horaFim),
        local: event.local || '',
        preco: event.preco || '',
        traje: event.traje || '',
        organizadores: organizersFromApi.length
          ? organizersFromApi
          : [emptyOrganizer],
        images: [],
      });
    } catch (error) {
      console.error('Erro ao carregar evento para edição:', error);
      toast.error('Erro ao carregar dados do evento.');
    } finally {
      setLoading(false);
    }
  }, [id, baseUrl]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTimeChange = (name: 'horaInicio' | 'horaFim', value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const handleOrganizerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Organizer,
  ) => {
    const value = e.target.value;
    setForm((prev) => {
      const newOrganizadores = [...prev.organizadores];
      newOrganizadores[index] = {
        ...newOrganizadores[index],
        [field]: value,
      };
      return { ...prev, organizadores: newOrganizadores };
    });
  };

  const handleAddOrganizer = () => {
    setForm((prev) => ({
      ...prev,
      organizadores: [...prev.organizadores, { ...emptyOrganizer }],
    }));
  };

  const handleRemoveOrganizer = (index: number) => {
    setForm((prev) => {
      if (prev.organizadores.length === 1) return prev;
      const newOrganizadores = [...prev.organizadores];
      newOrganizadores.splice(index, 1);
      return { ...prev, organizadores: newOrganizadores };
    });
  };

const handleSubmit = async () => {
  if (!id) {
    toast.error('ID do evento inválido.');
    return;
  }

  if (!token) {
    toast.error('Você precisa estar logado para editar um evento.');
    navigate('/login');
    return;
  }

  console.log('🔄 Iniciando update do evento...', { id });

  setSaving(true);

  try {
    // 🔹 remove _id e qualquer campo extra dos organizadores
    const sanitizedOrganizers = form.organizadores.map((org) => ({
      nome: org.nome,
      email: org.email,
      whatsapp: org.whatsapp,
      instagram: org.instagram,
    }));

    const payload = {
      nome: form.titulo,
      descricao: form.descricao,
      data: form.data,
      horaInicio: timeStringToNumber(form.horaInicio),
      horaFim: timeStringToNumber(form.horaFim),
      local: form.local,
      preco: form.preco || '0',
      traje: form.traje,
      organizadores: sanitizedOrganizers,
    };

    console.log('📦 Payload enviado no update:', payload);

    const response = await axios.put(
      `${baseUrl}/api/events/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Resposta do update:', response.status, response.data);

    toast.success('Evento atualizado com sucesso!');
    navigate('/my-events');
    } catch (error: any) {
    console.error(
      'Erro ao atualizar evento (detalhado):',
      error?.response?.data || error
    );
  
    const msg = getApiErrorMessage(error);
    toast.error(msg);
  } finally {
    setSaving(false);
  }
};


  return {
    form,
    loading,
    saving,
    handleChange,
    handleTimeChange,
    handleImageChange,
    handleOrganizerChange,
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleSubmit,
  };
}
