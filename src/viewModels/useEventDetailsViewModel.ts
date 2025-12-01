// 🔹 Hook responsável por toda a lógica da tela de detalhes do evento.

import { useEffect, useState, useCallback } from 'react'; // importa hooks do React
import { useNavigate, useParams } from 'react-router-dom'; // hooks de rota (pegar :id e navegar)
import api from '../api/api'; // instância configurada do axios
import { EventData } from '../data/EventData'; // tipo de evento que você já usa
import { toast } from 'react-toastify'; // para mostrar toasts de erro / sucesso

interface UseEventDetailsViewModelReturn {
  event: EventData | null; // dados do evento carregado (ou null se ainda não veio)
  loading: boolean; // estado de carregamento
  error: string | null; // mensagem de erro (se der ruim)
  handleBack: () => void; // voltar para a tela anterior
  handleShare: () => void; // copiar link do evento
}

// 🔸 Hook principal da tela de detalhes
export function useEventDetailsViewModel(): UseEventDetailsViewModelReturn {
  const { id } = useParams<{ id: string }>(); // pega o :id da URL
  const navigate = useNavigate(); // hook para navegar entre rotas

  const [event, setEvent] = useState<EventData | null>(null); // guarda o evento retornado pela API
  const [loading, setLoading] = useState<boolean>(true); // indica se está carregando
  const [error, setError] = useState<string | null>(null); // guarda mensagem de erro, se existir

  // 🔹 Busca detalhes do evento na API
  const fetchEvent = useCallback(async () => {
    if (!id) { // se não tiver id na URL
      setError('Evento não encontrado.'); // seta mensagem de erro
      setLoading(false); // para o loading
      return; // sai da função
    }

    try {
      setLoading(true); // inicia loading
      setError(null); // limpa erro anterior

      // faz GET na API backend para /api/events/:id
      const response = await api.get(`/api/events/${id}`);

      // se vier no formato simples (um objeto só)
      setEvent(response.data as EventData); // guarda o evento no estado
    } catch (err: any) {
      console.error('🔥 Erro ao buscar detalhes do evento:', err); // log no console

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Erro ao carregar detalhes do evento.'; // monta mensagem amigável

      setError(msg); // atualiza estado de erro
      toast.error(msg); // mostra toast na tela
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

  // 🔹 Retorna tudo que a UI precisa para renderizar
  return {
    event, // dados do evento
    loading, // estado de carregamento
    error, // mensagem de erro
    handleBack, // ação para voltar
    handleShare, // ação para compartilhar
  };
}
