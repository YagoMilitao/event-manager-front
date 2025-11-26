/* eslint-disable @typescript-eslint/no-explicit-any */
import {                      // importa hooks do React
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';  // pra redirecionar
import { useSelector } from 'react-redux';       // pra pegar o token do Redux
import api from '../api/api';                    // axios configurado
import { EventData } from '../data/EventData';   // tipo dos eventos
import { RootState } from '../store/store';      // tipo do estado global
import { toast } from 'react-toastify';          // toasts bonitinhos

// Interface que descreve tudo que a View (MyEventsPageScreen) vai usar
export interface MyEventsViewModel {
  events: EventData[];            // todos os eventos do usuário
  visibleEvents: EventData[];     // eventos da página atual (paginação)
  selectedEvents: EventData[];    // eventos selecionados (checkbox)
  loading: boolean;               // se está carregando
  error: string | null;           // mensagem de erro (se tiver)

  selectedIds: string[];          // ids selecionados
  isAllSelected: boolean;         // se todos da página estão selecionados
  canLoadMore: boolean;           // se dá pra carregar mais páginas
  confirmOpen: boolean;           // se o modal de confirmação está aberto
  deleting: boolean;              // se está deletando agora

  handleToggleSelect: (id: string) => void;  // seleciona/deseleciona 1 evento
  handleToggleSelectAll: () => void;         // seleciona/deseleciona todos
  handleOpenConfirm: () => void;             // abre modal de confirmação
  handleCloseConfirm: () => void;            // fecha modal de confirmação
  handleConfirmDelete: () => Promise<void>;  // confirma exclusão
  handleLoadMore: () => void;                // aumenta a página (paginação)
}

// Hook que concentra toda a lógica da tela "Meus eventos"
export const useMyEventsViewModel = (): MyEventsViewModel => {
  const [events, setEvents] = useState<EventData[]>([]);  // lista completa
  const [loading, setLoading] = useState(true);           // estado de loading
  const [error, setError] = useState<string | null>(null); // estado de erro

  // estados da UI
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // ids marcados
  const [confirmOpen, setConfirmOpen] = useState(false);        // modal aberto?
  const [deleting, setDeleting] = useState(false);              // deletando?
  const [page, setPage] = useState(1);                          // página atual
  const PAGE_SIZE = 6;                                          // eventos por página

  const navigate = useNavigate();                               // pra redirecionar
  const token = useSelector((state: RootState) => state.auth.token); // pega token do Redux

  // Busca os eventos do usuário logado
  const fetchMyEvents = useCallback(async () => {
    if (!token) {                                              // se não tem token
      setError('Você precisa estar logado para ver seus eventos.'); // seta erro
      setLoading(false);                                       // tira loading
      setTimeout(() => navigate('/login'), 1500);              // manda pro login depois de 1.5s
      return;                                                  // sai da função
    }

    try {
      setLoading(true);                                        // começa loading
      setError(null);                                          // limpa erro

      console.log('📥 Buscando meus eventos em /api/events/my-event ...');
      const response = await api.get('/api/events/my-event', { // chama API protegida
        headers: {
          Authorization: `Bearer ${token}`,                    // manda token no header
        },
      });

      console.log('✅ Meus eventos carregados:', response.data);
      setEvents(response.data);                                // joga eventos no state
      setPage(1);                                              // sempre volta pra página 1 ao recarregar
      setSelectedIds([]);                                      // limpa seleção
    } catch (err: any) {
      console.error(
        '🔥 Erro ao buscar meus eventos:',
        err?.response?.data || err?.message,
      );

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Erro ao carregar seus eventos. Tente novamente.';      // mensagem fallback

      setError(msg);                                           // seta erro
      toast.error(msg);                                        // mostra toast de erro
    } finally {
      setLoading(false);                                       // sempre tira loading
    }
  }, [token, navigate]);                                       // depende de token e navigate

  // roda uma vez (e sempre que token mudar) pra buscar os eventos
  useEffect(() => {
    fetchMyEvents();                                           // chama a função de buscar eventos
  }, [fetchMyEvents]);                                         // depende do callback

  // Lista de todos os ids (pra seleção total)
  const allIds = useMemo(
    () => events.map((e) => e._id),                            // pega só o _id de cada evento
    [events],                                                  // recalcula quando events mudar
  );

  // Ordena os eventos por data (mais próximos primeiro)
  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {                             // faz cópia do array e ordena
        const da = a.data ? new Date(a.data) : new Date();     // data do evento A
        const db = b.data ? new Date(b.data) : new Date();     // data do evento B
        return da.getTime() - db.getTime();                    // ascendente
      }),
    [events],                                                  // recalcula quando events mudar
  );

  // Eventos visíveis na página atual (paginação simples)
  const visibleEvents = useMemo(
    () => sortedEvents.slice(0, page * PAGE_SIZE),             // pega até page * PAGE_SIZE
    [sortedEvents, page],                                      // depende da lista ordenada e da página
  );

  // Se ainda tem mais eventos pra carregar
  const canLoadMore = useMemo(
    () => visibleEvents.length < sortedEvents.length,          // true se ainda tem mais
    [visibleEvents.length, sortedEvents.length],               // depende dos tamanhos
  );

  // Eventos selecionados (baseado em selectedIds)
  const selectedEvents = useMemo(
    () => events.filter((e) => selectedIds.includes(e._id)),   // mantém só os que estão em selectedIds
    [events, selectedIds],                                     // recalcula quando mudar
  );

  // Se todos os eventos estão selecionados
  const isAllSelected = useMemo(
    () => allIds.length > 0 && selectedIds.length === allIds.length, // true se tudo marcado
    [allIds.length, selectedIds.length],                             // depende dos tamanhos
  );

  // Alterna seleção de um único evento
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)                                            // se já estava selecionado
        ? prev.filter((item) => item !== id)                       // remove
        : [...prev, id],                                           // senão, adiciona
    );
  }, []);

  // Seleciona ou limpa seleção de todos os eventos visíveis
  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === allIds.length ? [] : allIds,               // se já tinha tudo -> limpa; senão -> marca tudo
    );
  }, [allIds]);

  // Abre o modal de confirmação (se tiver algo selecionado)
  const handleOpenConfirm = useCallback(() => {
    if (!selectedIds.length) return;                             // não faz nada se não tiver seleção
    setConfirmOpen(true);                                        // abre modal
  }, [selectedIds.length]);

  // Fecha o modal de confirmação (se não estiver deletando)
  const handleCloseConfirm = useCallback(() => {
    if (deleting) return;                                        // se estiver deletando, não deixa fechar
    setConfirmOpen(false);                                       // fecha modal
  }, [deleting]);

  // Carrega mais eventos (aumenta a página)
  const handleLoadMore = useCallback(() => {
    if (!canLoadMore) return;                                    // se não tiver mais, não faz nada
    setPage((prev) => prev + 1);                                 // incrementa a página
  }, [canLoadMore]);

  // Confirma exclusão dos eventos selecionados
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedIds.length) return;                             // se nada selecionado, sai
    if (!token) {                                                // se não tiver token
      toast.error('Você precisa estar logado para excluir eventos.'); // avisa
      navigate('/login');                                        // redireciona
      return;
    }

    try {
      setDeleting(true);                                         // começa estado de deletando
      console.log('🗑️ Deletando eventos (frontend):', selectedIds);

      // dispara delete pra cada id selecionado
      await Promise.all(
        selectedIds.map((id) =>
          api.delete(`/api/events/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,                  // manda token
            },
          }),
        ),
      );

      console.log('✅ Eventos deletados com sucesso:', selectedIds);

      // Remove do estado local tudo que foi deletado
      setEvents((prev) => prev.filter((e) => !selectedIds.includes(e._id)));

      // limpa seleção e fecha modal
      setSelectedIds([]);
      setConfirmOpen(false);

      // toast de sucesso
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
      toast.error(msg);                                         // mostra toast de erro
    } finally {
      setDeleting(false);                                       // sempre tira o estado de deletando
    }
  }, [selectedIds, token, navigate]);

  // Retorna tudo que a tela precisa
  return {
    events,
    visibleEvents,
    selectedEvents,
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
