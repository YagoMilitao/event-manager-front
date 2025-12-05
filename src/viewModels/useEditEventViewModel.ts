/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RootState } from '../store/store';
import { CreateEventForm } from '../data/CreateEventData';
import { Organizer } from '../data/OrganizerData';
import { EventData } from '../data/EventData';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';

interface EditEventViewModel {
  form: CreateEventForm;
  loading: boolean;
  saving: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleTimeChange: (name: 'startTime' | 'endTime', value: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  handleOrganizerChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Organizer
  ) => void;
  handleAddOrganizer: () => void;
  handleRemoveOrganizer: (index: number) => void;
  handleSubmit: () => Promise<void>;
  handleUpdateClick: () => void;
}

const emptyOrganizer: Organizer = {
  organizerName: '',
  email: '',
  whatsapp: '',
  instagram: 'https://www.instagram.com/',
};

const emptyForm: CreateEventForm = {
  eventName: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  price: '',
  dressCode: '',
  organizers: [emptyOrganizer],
  images: [],
  imagePreviews: [],
  existingImages: [],
  imagesToDelete: [],
};

function numberToTimeString(value?: number | null): string {
  if (value === null || value === undefined) return '';
  const raw = value.toString().padStart(4, '0');
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
        event.organizers && Array.isArray(event.organizers)
          ? event.organizers
          : [emptyOrganizer];

      setForm((prev) => ({
        ...prev,
        eventName: event.eventName || '',
        description: event.description || '',
        date: event.date ? event.date.substring(0, 10) : '',
        startTime: numberToTimeString(event.startTime),
        endTime: numberToTimeString(event.endTime),
        location: event.location || '',
        price: event.price || '',
        dressCode: event.dressCode || '',
        organizers: organizersFromApi.length
          ? organizersFromApi
          : [emptyOrganizer],
        images: [],
        imagePreviews: [],
        existingImages: event.existingImages || event.images || [],
        imagesToDelete: [],
      }));
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

  const handleTimeChange = (name: 'startTime' | 'endTime', value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).slice(0, 5) : [];

    const previews = files.map((file) => URL.createObjectURL(file));

    setForm((prev) => {
      prev.imagePreviews.forEach((url) => URL.revokeObjectURL(url));

      return {
        ...prev,
        images: files,
        imagePreviews: previews,
      };
    });
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => {
      const newImages = [...prev.images];
      const newPreviews = [...prev.imagePreviews];

      const [removedPreview] = newPreviews.splice(index, 1);
      if (removedPreview) {
        URL.revokeObjectURL(removedPreview);
      }

      newImages.splice(index, 1);

      return {
        ...prev,
        images: newImages,
        imagePreviews: newPreviews,
      };
    });
  };

  const handleOrganizerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Organizer,
  ) => {
    const value = e.target.value;
    setForm((prev) => {
      const neworganizers = [...prev.organizers];
      neworganizers[index] = {
        ...neworganizers[index],
        [field]: value,
      };
      return { ...prev, organizers: neworganizers };
    });
  };

  const handleAddOrganizer = () => {
    setForm((prev) => ({
      ...prev,
      organizers: [...prev.organizers, { ...emptyOrganizer }],
    }));
  };

  const handleRemoveOrganizer = (index: number) => {
    setForm((prev) => {
      if (prev.organizers.length === 1) return prev;
      const neworganizers = [...prev.organizers];
      neworganizers.splice(index, 1);
      return { ...prev, organizers: neworganizers };
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
      const sanitizedOrganizers = form.organizers.map((org) => ({
        organizerName: org.organizerName,
        email: org.email,
        whatsapp: org.whatsapp,
        instagram: org.instagram,
      }));

      const payload = {
        eventName: form.eventName,
        description: form.description,
        date: form.date,
        startTime: timeStringToNumber(form.startTime),
        endTime: timeStringToNumber(form.endTime),
        location: form.location,
        price: form.price || '0',
        dressCode: form.dressCode,
        organizers: sanitizedOrganizers,
        // ⚠️ ainda não estamos fazendo update de imagens no backend
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
        error?.response?.data || error,
      );

      const msg = getApiErrorMessage(error);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateClick = () => {
    handleSubmit();
  };

  return {
    form,
    loading,
    saving,
    handleChange,
    handleTimeChange,
    handleImageChange,
    handleRemoveImage,
    handleOrganizerChange,
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleSubmit,
    handleUpdateClick,
  };
}
