/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppSelector } from '../store/hooks';
import { CreateEventForm } from '../data/CreateEventData';
import { Organizer } from '../data/OrganizerData';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { useNavigate } from 'react-router-dom';

const initialOrganizer: Organizer = {
  organizerName: '',
  email: '',
  whatsapp: '',
  instagram: 'https://www.instagram.com/',
};

function normalizePrice(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) return '0';

  const str = String(raw).trim();
  if (!str) return '0';

  // tira tudo que não for dígito, vírgula ou ponto
  let cleaned = str.replace(/[^\d.,]/g, '');
  // vírgula -> ponto
  cleaned = cleaned.replace(',', '.');

  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  if (!cleaned || cleaned === '.') return '0';

  return cleaned;
}

export function useCreateEventViewModel() {
  const token = useAppSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateEventForm>({
    eventName: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    address: {
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      complement: '',
    },
    locationLabel: '',
    geo: undefined,
    price: '',
    dressCode: '',
    organizers: [initialOrganizer],
    images: [],
    imagePreviews: [],
    existingImages: [],
    imagesToDelete: [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrganizerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Organizer,
  ) => {
    const updated = [...form.organizers];
    updated[index] = {
      ...updated[index],
      [field]: e.target.value,
    };
    setForm((prev) => ({
      ...prev,
      organizers: updated,
    }));
  };

  const handleAddOrganizer = () => {
    setForm((prev) => ({
      ...prev,
      organizers: [...prev.organizers, { ...initialOrganizer }],
    }));
  };

  const handleRemoveOrganizer = (index: number) => {
    if (form.organizers.length === 1) {
      toast.error('Pelo menos um organizador é obrigatório');
      return;
    }
    setForm((prev) => ({
      ...prev,
      organizers: prev.organizers.filter((_, i) => i !== index),
    }));
  };

  const handleTimeChange = (time: 'startTime' | 'endTime', value: string) => {
    setForm((prev) => ({
      ...prev,
      [time]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files).slice(0, 5);
    const previews = fileArray.map((file) => URL.createObjectURL(file));

    setForm((prev) => {
      prev.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      return {
        ...prev,
        images: fileArray,
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

  async function fetchCep(cepRaw: string) {
    const cep = cepRaw.replace(/\D/g, '');
    if (cep.length !== 8) throw new Error('CEP inválido');
    
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    
    if (data.erro) throw new Error('CEP não encontrado');
    
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  }

    const formatCep = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const handleAddressChange = (field: keyof CreateEventForm['address'], value: string) => {
  setForm((prev) => {
    // ✅ se for CEP, normaliza e aplica máscara 00000-000
    if (field === 'cep') {
      return {
        ...prev,
        address: { ...prev.address, cep: formatCep(value) },
      };
    }

    // ✅ demais campos normais
    return {
      ...prev,
      address: { ...prev.address, [field]: value },
    };
  });
};

  const handleFetchCep = async () => {
    try {
      const partial = await fetchCep(form.address.cep);
      setForm((prev) => {
        const nextAddress = { ...prev.address, ...partial };
        const label = `${nextAddress.street}, ${nextAddress.number} - ${nextAddress.neighborhood}, ${nextAddress.city} - ${nextAddress.state}`;

        return {
          ...prev,
          address: nextAddress,
          locationLabel: label,
          // geo: undefined (se você ainda não geocodificar)
        };
      });
    } catch (e: any) {
      toast.error(e.message || 'Erro ao buscar CEP');
    }
  };



  const handleSaveClick = async () => {
    await handleSubmit();
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!token) {
      toast.error('Você precisa estar logado para criar um evento');
      return false;
    }

    try {
      const eventName = form.eventName.trim();
      const location = form.address.street.trim();

      if (!eventName || !form.date || !form.startTime || !location) {
        toast.error(
          'Preencha todos os campos obrigatórios (título, data, hora de início, local)',
        );
        return false;
      }

      // transforma hora "HH:MM" -> número HHMM (1903, por exemplo)
      const [hStart, mStart] = (form.startTime || '0:0').split(':').map(Number);
      const startTimeNumber = hStart * 100 + (mStart || 0);

      let endTimeNumber: number | undefined;
      if (form.endTime) {
        const [hFim, mFim] = form.endTime.split(':').map(Number);
        endTimeNumber = hFim * 100 + (mFim || 0);
      }

      const cleanedOrganizers = form.organizers.filter(
        (o) => o.organizerName.trim().length > 0,
      );

      if (cleanedOrganizers.length === 0) {
        toast.error('Adicione pelo menos um organizador com nome');
        return false;
      }

      // 🔹 SEM imagens -> JSON normal
      if (!form.images || form.images.length === 0) {
        const eventData = {
          eventName: eventName,
          description: form.description,
          date: form.date,
          startTime: startTimeNumber,
          endTime: endTimeNumber,
          address: form.address,
          // ✅ obrigatório no backend (Joi)
          locationLabel:
            form.locationLabel?.trim() ||
            `${form.address.street}, ${form.address.number} - ${form.address.neighborhood}, ${form.address.city} - ${form.address.state}`,      
          // ✅ opcional no Joi (só manda se existir)
          geo: form.geo,
          price: normalizePrice(form.price),
          dressCode: form.dressCode,
          organizers: cleanedOrganizers,
        };

        console.log('📦 eventData que será enviado (sem imagens):', eventData);

        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/events/create-event`,
          eventData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        toast.success('Evento criado com sucesso!');
        navigate('/my-events');
        return true;
      }

      // 🔹 COM imagens -> multipart/form-data (GCP)
      const formData = new FormData();
      formData.append('eventName', eventName);
      formData.append('description', form.description || '');
      formData.append('date', form.date);
      formData.append('startTime', String(startTimeNumber));
      if (endTimeNumber !== undefined) {
        formData.append('endTime', String(endTimeNumber));
      }
      formData.append('address', JSON.stringify(form.address));
      formData.append('locationLabel', form.locationLabel);
      if (form.geo) formData.append('geo', JSON.stringify(form.geo));
      formData.append('price', normalizePrice(form.price));
      formData.append('dressCode', form.dressCode || '');
      formData.append('organizers', JSON.stringify(cleanedOrganizers));

      form.images.forEach((file) => {
        formData.append('images', file);
      });

      console.log('📦 FormData enviado para create-with-images:');
      formData.forEach((value, key) => {
        console.log(key, value);
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events/create-with-images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success('Evento com imagens criado com sucesso!');
      navigate('/my-events');
      return true;
    } catch (err: unknown) {
      console.error('Erro ao criar evento:', err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const url = err.config?.url;
        const responseData = err.response?.data as any;

        console.error('Detalhes do AxiosError:', {
          message: err.message,
          status,
          url,
          responseData,
          request: err.request,
        });

        let userMessage = 'Erro ao criar evento';

        if (responseData) {
          if (typeof responseData === 'string') {
            userMessage = responseData;
          } else if (responseData.error) {
            userMessage = responseData.error;
          } else if (responseData.message) {
            userMessage = responseData.message;
          }

          if (Array.isArray(responseData.details) && responseData.details.length) {
            console.error('⚠️ Detalhes da validação:', responseData.details);
            // Também mostra no toast:
            userMessage += ' - ' + responseData.details.join(' | ');
          }
        }

        toast.error(userMessage);
      } else if (err instanceof Error) {
        toast.error(getApiErrorMessage(err));
      } else {
        toast.error('Erro ao criar evento');
      }
      return false;
    }
  };

  return {
    form,
    handleChange,
    handleImageChange,
    handleRemoveImage,
    handleOrganizerChange,
    handleTimeChange,
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleSubmit,
    handleSaveClick,
    handleAddressChange,
    handleFetchCep,
  };
}
