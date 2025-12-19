/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import api from '../api/api';
import { EventData } from '../data/EventData';
import { toast } from 'react-toastify';

interface UseEventDetailsViewModelReturn {
  event: EventData | null;
  loading: boolean;
  error: string | null;
  handleBack: () => void;
  handleShare: () => void;
}

export function useEventDetailsViewModel(): UseEventDetailsViewModelReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Busca detalhes do evento na API
  const fetchEvent = useCallback(async () => {
    if (!id) { // se não tiver id na URL
      setError('Evento não encontrado.'); // seta mensagem de erro
      setLoading(false); // para o loading
      return; // sai da função
    }

    try {
      setLoading(true); 
      setError(null);

      // faz GET na API backend para /api/events/:id
      const response = await api.get(`/api/events/${id}`);

      // se vier no formato simples (um objeto só)
      setEvent(response.data as EventData); // guarda o evento no estado
    } catch (err: any) {
      console.error('🔥 Erro ao buscar detalhes do evento:', err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Erro ao carregar detalhes do evento.'; 
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false); // sempre desliga o loading
    }
  }, [id]); // refaz a função se o id mudar

  // 🔹 Dispara a busca do evento quando o componente montar
  useEffect(() => {
    fetchEvent(); // chama a função de buscar o evento
  }, [fetchEvent]); // depende de fetchEvent

  // 🔹 Voltar para a página anterior
  const handleBack = useCallback(() => {
    navigate(-1); // navega 1 passo para trás no histórico
  }, [navigate]); // depende de navigate

  // 🔹 Compartilhar evento (copia URL atual para a área de transferência)
  const handleShare = useCallback(() => {
    const url = window.location.href; // pega a URL atual da página

    if (navigator.clipboard && navigator.clipboard.writeText) {
      // se a API de clipboard existir
      navigator.clipboard
        .writeText(url) // copia o link
        .then(() => {
          toast.success('Link do evento copiado!'); // mostra sucesso
        })
        .catch((err) => {
          console.error('Erro ao copiar link:', err); // loga erro
          toast.error('Não foi possível copiar o link.'); // toast de erro
        });
    } else {
      // fallback se o navegador não suportar clipboard API
      console.log('Clipboard API não suportada. URL:', url); // loga a URL
      toast.info('Seu navegador não suporta copiar automaticamente.'); // toast informativo
    }
  }, []); // não depende de nada externo

  return {
    event, // dados do evento
    loading, // estado de carregamento
    error, // mensagem de erro
    handleBack, // ação para voltar
    handleShare, // ação para compartilhar
  };
}
