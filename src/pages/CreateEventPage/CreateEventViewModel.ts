/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../store/hooks';
import { CreateEventForm, Organizer } from '../../data/CreateEventData';

const initialOrganizer: Organizer = {
  nome: '',
  email: '',
  whatsapp: '',
  instagram: 'https://www.instagram.com/',
};

function parseTimeToNumber(time: string): number | null {
  if (!time) return null;

  // Espera algo tipo "19:30"
  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 100 + minutes; // 19:30 -> 1930
}

export function useCreateEventViewModel() {
  const token = useAppSelector((state) => state.auth.token);

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
    image: null,
  });

  // Normaliza a base URL (remove barras no final)
  const rawBaseUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  // 📝 Campos simples (exceto imagem e organizadores)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;

    if (name === 'image' && files) {
      setForm((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      // Agora deixamos a hora como vem do input type="time" (HH:MM)
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 📸 Campo de imagem (para Button component="label")
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({
      ...prev,
      image: file,
    }));
  };

  // 👥 Organizers – alterar um campo de um organizador específico
  const handleOrganizerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Organizer
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

  // 🔹 Só deixa adicionar um novo organizador se o último tiver pelo menos NOME preenchido
  const handleAddOrganizer = () => {
    const last = form.organizadores[form.organizadores.length - 1];

    if (!last.nome.trim()) {
      toast.warning('Preencha o nome do organizador atual antes de adicionar outro.');
      return;
    }

    setForm((prev) => ({
      ...prev,
      organizadores: [...prev.organizadores, { ...initialOrganizer }],
    }));
  };

  const handleRemoveOrganizer = (index: number) => {
    if (form.organizadores.length <= 1) {
      toast.warning('O evento precisa ter pelo menos um organizador.');
      return;
    }

    const updated = [...form.organizadores];
    updated.splice(index, 1);

    setForm((prev) => ({
      ...prev,
      organizadores: updated,
    }));
  };

  // 🧹 Helper para limpar organizadores vazios antes de enviar
  const sanitizeOrganizers = (orgs: Organizer[]): Organizer[] => {
    return orgs
      .map((o) => ({
        ...o,
        nome: o.nome.trim(),
        email: o.email.trim(),
        whatsapp: o.whatsapp.trim(),
        instagram: o.instagram.trim(),
      }))
      .filter((o) => {
        const hasAnyField =
          o.nome ||
          o.email ||
          o.whatsapp ||
          (o.instagram && o.instagram !== 'https://www.instagram.com/');

        return hasAnyField;
      });
  };

  // 🚀 Envio do formulário (sem ou com imagem)
  const handleSubmit = async (): Promise<boolean> => {
    if (!token) {
      toast.error('Você precisa estar logado para criar um evento');
      return false;
    }

    const tituloTrimmed = form.titulo.trim();
    const localTrimmed = form.local.trim();

    // ✅ Validações básicas no front antes de chamar o backend
    if (!tituloTrimmed) {
      toast.error('Preencha o título do evento.');
      return false;
    }
    if (!form.data) {
      toast.error('Preencha a data do evento.');
      return false;
    }
    if (!localTrimmed) {
      toast.error('Preencha o local do evento.');
      return false;
    }
    if (!form.horaInicio) {
      toast.error('Preencha a hora de início.');
      return false;
    }

    const horaInicioNumber = parseTimeToNumber(form.horaInicio);
    if (horaInicioNumber === null) {
      toast.error('Hora de início inválida.');
      return false;
    }

    const horaFimNumber =
      form.horaFim && form.horaFim.trim() !== ''
        ? parseTimeToNumber(form.horaFim)
        : null;

    if (form.horaFim && horaFimNumber === null) {
      toast.error('Hora de fim inválida.');
      return false;
    }

    // 🔥 Limpa organizadores vazios
    const cleanedOrganizers = sanitizeOrganizers(form.organizadores);

    if (cleanedOrganizers.length === 0) {
      toast.error('Adicione pelo menos um organizador com nome.');
      return false;
    }

    // Monta payload base alinhado com o Joi do backend
    const eventData = {
      nome: tituloTrimmed,
      descricao: form.descricao,
      data: form.data, // ISO (yyyy-MM-dd)
      horaInicio: horaInicioNumber,
      horaFim: horaFimNumber ?? undefined,
      local: localTrimmed,
      preco: String(form.preco || '0'),
      traje: form.traje,
      organizadores: cleanedOrganizers,
    };

    console.log('📦 eventData que será enviado:', eventData);

    try {
      // 📸 Fluxo COM imagem → multipart/form-data
      if (form.image) {
        const formData = new FormData();
        formData.append('nome', eventData.nome);
        formData.append('descricao', eventData.descricao || '');
        formData.append('data', eventData.data);
        formData.append('horaInicio', String(eventData.horaInicio));
        if (eventData.horaFim !== undefined) {
          formData.append('horaFim', String(eventData.horaFim));
        }
        formData.append('local', eventData.local);
        formData.append('preco', eventData.preco);
        formData.append('traje', eventData.traje || '');
        formData.append('organizadores', JSON.stringify(eventData.organizadores));
        formData.append('image', form.image);

        console.log('📦 FormData enviado para create-with-images:');
        formData.forEach((value, key) => {
          console.log(key, value);
        });

        await axios.post(
          `${baseUrl}/api/events/create-with-images`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // 📄 Fluxo SEM imagem → JSON normal
        await axios.post(
          `${baseUrl}/api/events/create-event`,
          eventData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      toast.success('Evento criado com sucesso!');

      // Reset do formulário (inclusive organizadores)
      setForm({
        titulo: '',
        descricao: '',
        data: '',
        horaInicio: '',
        horaFim: '',
        local: '',
        preco: '',
        traje: '',
        organizadores: [initialOrganizer],
        image: null,
      });

      return true;
    } catch (err: unknown) {
      console.error('Erro ao criar evento:', err);

      if (axios.isAxiosError(err)) {
        const axiosErr = err;
        const status = axiosErr.response?.status;
        const url = axiosErr.config?.url;
        const responseData = axiosErr.response?.data;

        console.error('Detalhes do AxiosError:', {
          message: axiosErr.message,
          status,
          url,
          responseData,
          request: axiosErr.request,
        });

        let userMessage = 'Erro ao criar evento';
        if (responseData) {
          if (typeof responseData === 'string') {
            userMessage = responseData;
          } else if ((responseData as any).message) {
            userMessage = (responseData as any).message;
          } else if ((responseData as any).error) {
            userMessage = (responseData as any).error;
          } else {
            try {
              userMessage = JSON.stringify(responseData);
            } catch {
              userMessage = axiosErr.message;
            }
          }
        } else {
          userMessage = axiosErr.message || userMessage;
        }
        toast.error(userMessage);
      } else if (err instanceof Error) {
        console.error('Erro não-Axios:', err);
        toast.error(err.message);
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
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleSubmit,
  };
}
