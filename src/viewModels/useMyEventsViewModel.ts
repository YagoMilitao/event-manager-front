/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect,useState, useCallback, useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';     
import api from '../api/api';     
import { EventData } from '../data/EventData';
import { RootState } from '../store/store';
import { toast } from 'react-toastify';

// Quantos eventos por "página" na tabela de Meus Eventos
const PAGE_SIZE = 10;                              // define o tamanho da página de eventos

// Interface que vamos retornar pro MyEventsPageScreen
interface MyEventsViewModel {
  events: EventData[];                             // TODOS os eventos do usuário
  visibleEvents: EventData[];                      // apenas os eventos da página atual (para tabela)
  selectedEvents: EventData[];                     // lista completa dos eventos selecionados

  loading: boolean;                                // indica se está carregando dados
  error: string | null;                            // mensagem de erro (se houver)
  selectedIds: string[];                           // lista de IDs selecionados
  isAllSelected: boolean;                          // true se todos os visíveis estão selecionados
  canLoadMore: boolean;                            // true se ainda há mais eventos pra mostrar
  confirmOpen: boolean;                            // controla abertura do modal de confirmação
  deleting: boolean;                               // indica se está deletando no momento

  handleToggleSelect: (id: string) => void;        // marca/desmarca UM evento
  handleToggleSelectAll: () => void;               // marca/desmarca TODOS os visíveis
  handleOpenConfirm: () => void;                   // abre modal de confirmação
  handleCloseConfirm: () => void;                  // fecha modal de confirmação
  handleConfirmDelete: () => Promise<void>;        // confirma exclusão dos selecionados
  handleLoadMore: () => void;                      // aumenta a página (mostra mais eventos)
}

export const useMyEventsViewModel = (): MyEventsViewModel => {
  // =============== ESTADOS BÁSICOS ===============

  const [events, setEvents] = useState<EventData[]>([]);   // guarda TODOS os eventos do usuário
  const [loading, setLoading] = useState(true);            // indica se está carregando
  const [error, setError] = useState<string | null>(null); // mensagem de erro

  const [page, setPage] = useState(1);                     // página atual de exibição (client-side)
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // ids de eventos selecionados

  const [confirmOpen, setConfirmOpen] = useState(false);   // controle do modal de confirmação
  const [deleting, setDeleting] = useState(false);         // indica se está apagando eventos agora

  const navigate = useNavigate();                          // hook de navegação
  const token = useSelector((state: RootState) => state.auth.token); // lê token do Redux

  // =============== CARREGAR MEUS EVENTOS ===============

  const fetchMyEvents = useCallback(async () => {
    // se não tiver token, manda logar e aborta
    if (!token) {
      setError('Você precisa estar logado para ver seus eventos.'); // seta erro
      setLoading(false);                                            // para loading
      setTimeout(() => navigate('/login'), 1500);                   // redireciona para login
      return;
    }

    try {
      setLoading(true);                                             // começa loading
      setError(null);                                               // limpa erro anterior

      console.log('📥 Buscando meus eventos em /api/events/my-event ...');

      const response = await api.get('/api/events/my-event', {      // chama backend
        headers: {
          Authorization: `Bearer ${token}`,                         // envia token JWT
        },
      });

      console.log('✅ Meus eventos carregados:', response.data);
      setEvents(response.data as EventData[]);                      // salva eventos no estado
      setPage(1);                                                   // reseta página pra primeira
      setSelectedIds([]);                                           // limpa seleção
    } catch (err: any) {
      console.error(
        '🔥 Erro ao buscar meus eventos:',
        err?.response?.data || err?.message,
      );

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Erro ao carregar seus eventos. Tente novamente.';          // mensagem amigável

      setError(msg);                                               // salva mensagem de erro
      toast.error(msg);                                            // mostra toast
    } finally {
      setLoading(false);                                           // encerra loading
    }
  }, [token, navigate]);

  // chama fetchMyEvents ao montar o hook ou quando token mudar
  useEffect(() => {
    fetchMyEvents();                                               // dispara busca inicial
  }, [fetchMyEvents]);

  // =============== DERIVADOS: visibleEvents, canLoadMore, etc ===============

  const visibleEvents = useMemo(() => {
    // fatia os eventos até a página atual (client-side pagination)
    // garante SEMPRE um array (mesmo se events estiver vazio)
    return events.slice(0, page * PAGE_SIZE);
  }, [events, page]);

  const canLoadMore = useMemo(() => {
    // se o número de visíveis for menor que o total, ainda dá pra carregar mais
    return visibleEvents.length < events.length;
  }, [visibleEvents.length, events.length]);

  const selectedEvents = useMemo(() => {
    // lista detalhada dos eventos selecionados (pra exibir no modal de confirmação)
    return events.filter((e) => selectedIds.includes(e._id));
  }, [events, selectedIds]);

  const isAllSelected = useMemo(() => {
    // true se TODOS os eventos visíveis estão na lista de selecionados
    return (
      visibleEvents.length > 0 &&
      selectedIds.length === visibleEvents.length
    );
  }, [visibleEvents.length, selectedIds.length]);

  // =============== AÇÕES DE SELEÇÃO ===============

  const handleToggleSelect = useCallback(
    (id: string) => {
      // alterna a presença do ID dentro de selectedIds
      setSelectedIds((prev) =>
        prev.includes(id)                             // se já estiver selecionado...
          ? prev.filter((x) => x !== id)             // remove da lista
          : [...prev, id],                           // senão, adiciona
      );
    },
    [],
  );

  const handleToggleSelectAll = useCallback(() => {
    // se já estiver tudo selecionado, limpamos a seleção
    if (isAllSelected) {
      setSelectedIds([]);                            // limpa tudo
      return;
    }

    // se não estiver tudo selecionado, seleciona TODOS os visíveis
    const ids = visibleEvents.map((e) => e._id);     // pega apenas os IDs
    setSelectedIds(ids);                             // registra na seleção
  }, [isAllSelected, visibleEvents]);

  // =============== CONTROLE DO MODAL DE CONFIRMAÇÃO ===============

  const handleOpenConfirm = useCallback(() => {
    // só abre modal se tiver pelo menos 1 selecionado
    if (selectedIds.length === 0) {
      toast.info('Selecione pelo menos um evento para excluir.');
      return;
    }
    setConfirmOpen(true);                            // abre modal
  }, [selectedIds.length]);

  const handleCloseConfirm = useCallback(() => {
    setConfirmOpen(false);                           // fecha modal
  }, []);

  // =============== EXCLUSÃO DE EVENTOS SELECIONADOS ===============

  const handleConfirmDelete = useCallback(async () => {
    // se não tiver nada selecionado, não faz nada
    if (selectedIds.length === 0) {
      return;
    }

    if (!token) {
      toast.error('Você precisa estar logado para excluir eventos.');
      navigate('/login');
      return;
    }

    try {
      setDeleting(true);                             // marca que estamos excluindo
      console.log('🗑️ Deletando eventos (frontend):', selectedIds);

      // dispara as chamadas de deleção em paralelo
      await Promise.all(
        selectedIds.map((id) =>
          api.delete(`/api/events/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,      // manda token JWT pro backend
            },
          }),
        ),
      );

      console.log('✅ Eventos deletados com sucesso:', selectedIds);

      // remove os eventos deletados da lista local
      setEvents((prev) => prev.filter((e) => !selectedIds.includes(e._id)));

      // limpa seleção e fecha modal
      setSelectedIds([]);
      setConfirmOpen(false);

      // feedback pro usuário
      toast.success(
        selectedIds.length === 1
          ? 'Evento excluído com sucesso!'
          : `${selectedIds.length} eventos excluídos com sucesso!`,
      );
    } catch (err: any) {
      console.error(
        '🔥 Erro ao excluir eventos:',
        err?.response?.data || err,
      );

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Erro ao excluir eventos. Tente novamente.';

      toast.error(msg);
    } finally {
      setDeleting(false);                            // encerra estado de deleção
    }
  }, [selectedIds, token, navigate]);

  // =============== PAGINAÇÃO (CARREGAR MAIS) ===============

  const handleLoadMore = useCallback(() => {
    // só aumenta a página se ainda houver mais eventos
    if (canLoadMore) {
      setPage((prev) => prev + 1);                   // incrementa página
    }
  }, [canLoadMore]);

  // =============== RETORNO PARA A TELA ===============

  return {
    events,                                          // todos os eventos brutos
    visibleEvents,                                   // eventos exibidos na página atual
    selectedEvents,                                  // lista detalhada dos selecionados
    loading,
    error,
    selectedIds,
    isAllSelected,
    canLoadMore,
    confirmOpen,
    deleting,
    handleToggleSelect,
    handleToggleSelectAll,
    handleOpenConfirm,
    handleCloseConfirm,
    handleConfirmDelete,
    handleLoadMore,
  };
};
