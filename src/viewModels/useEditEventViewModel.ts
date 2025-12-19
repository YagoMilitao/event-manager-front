/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RootState } from '../store/store';
import { CreateEventForm } from '../data/CreateEventData';
import { Organizer } from '../data/OrganizerData';
import { EventData, EventImage } from '../data/EventData';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';

interface EditEventViewModel {
  form: CreateEventForm;
  loading: boolean;
  saving: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleTimeChange: (name: 'startTime' | 'endTime', value: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  handleToggleExistingImage: (url: string) => void;
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

      const response = await axios.get<EventData>(`${baseUrl}/api/events/${id}`);
      const event = response.data as any;

      const organizersFromApi: Organizer[] =
        event.organizers && Array.isArray(event.organizers)
          ? event.organizers
          : [emptyOrganizer];

      // Imagens existentes vêm de event.images (GCP)
      const existingImages: EventImage[] = Array.isArray(event.images)
        ? event.images
        : [];

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
        organizers: organizersFromApi.length ? organizersFromApi : [emptyOrganizer],
        images: [],
        imagePreviews: [],
        existingImages,
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
      prev.imagePreviews?.forEach((url) => URL.revokeObjectURL(url));
      return {
        ...prev,
        images: files,
        imagePreviews: previews,
      };
    });
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => {
      const newImages = [...(prev.images || [])];
      const newPreviews = [...(prev.imagePreviews || [])];

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

  const handleToggleExistingImage = (url: string) => {
    setForm((prev) => {
      const current = prev.imagesToDelete || [];
      const isMarked = current.includes(url);

      const newImagesToDelete = isMarked
        ? current.filter((u) => u !== url)
        : [...current, url];

      return {
        ...prev,
        imagesToDelete: newImagesToDelete,
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
      const newOrganizers = [...prev.organizers];
      newOrganizers[index] = {
        ...newOrganizers[index],
        [field]: value,
      };
      return { ...prev, organizers: newOrganizers };
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
      const newOrganizers = [...prev.organizers];
      newOrganizers.splice(index, 1);
      return { ...prev, organizers: newOrganizers };
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

      const hasNewImages = form.images && form.images.length > 0;
      const hasImagesToDelete =
        form.imagesToDelete && form.imagesToDelete.length > 0;

      // 👉 Se NÃO tem imagens novas E NÃO tem imagens pra deletar:
      //    usa o endpoint simples JSON: PUT /:id
      if (!hasNewImages && !hasImagesToDelete) {
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
        };

        console.log('📦 Payload enviado no update (sem imagens):', payload);

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

        console.log('✅ Resposta do update (sem imagens):', response.status, response.data);
      } else {
        // 👉 Tem imagens novas e/ou imagens a deletar:
        //    usa multipart: PUT /:id/with-images
        const formData = new FormData();

        formData.append('eventName', form.eventName);
        formData.append('description', form.description || '');
        formData.append('date', form.date);
        const start = timeStringToNumber(form.startTime);
        const end = timeStringToNumber(form.endTime);
        if (start !== undefined) formData.append('startTime', String(start));
        if (end !== undefined) formData.append('endTime', String(end));
        formData.append('location', form.location);
        formData.append('price', form.price || '0');
        formData.append('dressCode', form.dressCode || '');
        formData.append('organizers', JSON.stringify(sanitizedOrganizers));

        form.images.forEach((file) => {
          formData.append('images', file);
        });

        formData.append(
          'imagesToDelete',
          JSON.stringify(form.imagesToDelete || []),
        );

        console.log('📦 FormData enviado no update-with-images:');
        formData.forEach((v, k) => {
          console.log(k, v);
        });

        const response = await axios.put(
          `${baseUrl}/api/events/${id}/with-images`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log(
          '✅ Resposta do update (com imagens):',
          response.status,
          response.data,
        );
      }

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
    handleToggleExistingImage,
    handleOrganizerChange,
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleSubmit,
    handleUpdateClick,
  };
}
