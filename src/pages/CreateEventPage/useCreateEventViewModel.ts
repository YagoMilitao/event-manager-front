/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../store/hooks';
import { CreateEventForm, Organizer } from '../../data/CreateEventData';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import { useNavigate } from 'react-router-dom';

const initialOrganizer: Organizer = {
  nome: '',
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
    titulo: '',
    descricao: '',
    data: '',
    horaInicio: '',
    horaFim: '',
    local: '',
    preco: '',
    traje: '',
    organizadores: [initialOrganizer],
    images: [],
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
    const updated = [...form.organizadores];
    updated[index] = {
      ...updated[index],
      [field]: e.target.value,
    };
    setForm((prev) => ({
      ...prev,
      organizadores: updated,
    }));
  };

  const handleAddOrganizer = () => {
    setForm((prev) => ({
      ...prev,
      organizadores: [...prev.organizadores, { ...initialOrganizer }],
    }));
  };

  const handleRemoveOrganizer = (index: number) => {
    if (form.organizadores.length === 1) {
      toast.error('Pelo menos um organizador é obrigatório');
      return;
    }
    setForm((prev) => ({
      ...prev,
      organizadores: prev.organizadores.filter((_, i) => i !== index),
    }));
  };

  const handleTimeChange = (name: 'horaInicio' | 'horaFim', value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const limited = fileArray.slice(0, 5); // limita a 5 imagens

    setForm((prev) => ({
      ...prev,
      images: limited,
    }));
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
      const tituloTrimmed = form.titulo.trim();
      const localTrimmed = form.local.trim();

      if (!tituloTrimmed || !form.data || !form.horaInicio || !localTrimmed) {
        toast.error('Preencha todos os campos obrigatórios (título, data, hora de início, local)');
        return false;
      }

      // transforma hora "HH:MM" -> número HHMM (1903, por exemplo)
      const [hInicio, mInicio] = (form.horaInicio || '0:0').split(':').map(Number);
      const horaInicioNumber = hInicio * 100 + (mInicio || 0);

      let horaFimNumber: number | undefined;
      if (form.horaFim) {
        const [hFim, mFim] = form.horaFim.split(':').map(Number);
        horaFimNumber = hFim * 100 + (mFim || 0);
      }

      const cleanedOrganizers = form.organizadores.filter(
        (o) => o.nome.trim().length > 0,
      );

      if (cleanedOrganizers.length === 0) {
        toast.error('Adicione pelo menos um organizador com nome');
        return false;
      }

      const precoNormalizado = normalizePrice(form.preco);

      // Se NÃO tiver imagem -> chama rota create-event (JSON)
      if (!form.images || form.images.length === 0) {
        const eventData = {
          nome: tituloTrimmed,
          descricao: form.descricao,
          data: form.data,
          horaInicio: horaInicioNumber,
          horaFim: horaFimNumber,
          local: localTrimmed,
          preco: precoNormalizado,
          traje: form.traje,
          organizadores: cleanedOrganizers,
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

      // ✅ Com IMAGENS -> multipart/form-data
      const formData = new FormData();
      formData.append('nome', tituloTrimmed);
      formData.append('descricao', form.descricao || '');
      formData.append('data', form.data);
      formData.append('horaInicio', String(horaInicioNumber));
      if (horaFimNumber !== undefined) {
        formData.append('horaFim', String(horaFimNumber));
      }
      formData.append('local', localTrimmed);
      formData.append('preco', precoNormalizado);
      formData.append('traje', form.traje || '');
      formData.append('organizadores', JSON.stringify(cleanedOrganizers));

      // várias imagens
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
        const responseData = err.response?.data;

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
          } else if ((responseData as any).message) {
            userMessage = (responseData as any).message;
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
    handleOrganizerChange,
    handleTimeChange,
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleSubmit,
    handleSaveClick,
  };
}
