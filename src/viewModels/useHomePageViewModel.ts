// useHomePageViewModel.ts
import { useEffect, useState, useMemo, useCallback } from 'react'; // hooks do React
import api from '../api/api'; // instancia do axios que fala com o back
import { EventData } from '../data/EventData'; // tipo do evento

// tipo para as opções de ordenação
type SortOption = 'nearest' | 'newest' | 'cheapest';

// shape dos filtros usados na Home
interface Filters {
  searchText: string; // texto livre (nome/descrição)
  city: string;       // cidade/local
  dateFrom: string;   // data inicial (YYYY-MM-DD)
  dateTo: string;     // data final   (YYYY-MM-DD)
  priceMin: string;   // preço mínimo (string porque vem de input)
  priceMax: string;   // preço máximo
  attire: string;     // traje
  showPast: boolean;  // incluir eventos bem antigos?
  sortBy: SortOption; // tipo de ordenação
}

// o que a View (HomePageScreen) vai receber como props
export interface HomePageViewModel {
  visibleEvents: EventData[];          // lista final já filtrada/ordenada
  loading: boolean;                    // carregando primeira página
  loadingMore: boolean;                // carregando páginas seguintes
  error: string | null;                // mensagem de erro (se tiver)
  filters: Filters;                    // estado atual dos filtros
  canLoadMore: boolean;                // se ainda existem mais páginas no back

  // handlers para a tela chamar
  handleSearchChange: (value: string) => void;
  handleCityChange: (value: string) => void;
  handleDateChange: (field: 'dateFrom' | 'dateTo', value: string) => void;
  handlePriceChange: (field: 'priceMin' | 'priceMax', value: string) => void;
  handleAttireChange: (value: string) => void;
  handleShowPastChange: (checked: boolean) => void;
  handleSortChange: (value: SortOption) => void;
  handleClearFilters: () => void;
  handleLoadMore: () => void;
}

// quantos eventos por página o back vai devolver
const PAGE_SIZE = 10; // pode mudar pra 6, 8, etc

// helper pra normalizar preço em número
const parsePrice = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;        // sem valor
  const num = parseFloat(String(value).replace(',', '.'));      // troca vírgula por ponto e faz parse
  return Number.isNaN(num) ? null : num;                        // se NaN, devolve null
};

export const useHomePageViewModel = (): HomePageViewModel => {
  // -------------------------
  // ESTADOS BÁSICOS
  // -------------------------
  const [events, setEvents] = useState<EventData[]>([]); // eventos carregados até agora
  const [page, setPage] = useState(1);                   // página atual carregada
  const [hasMore, setHasMore] = useState(true);          // se o back avisou que tem mais
  const [loading, setLoading] = useState(true);          // carregando primeira página
  const [loadingMore, setLoadingMore] = useState(false); // carregando páginas seguintes
  const [error, setError] = useState<string | null>(null); // erro geral

  // filtros iniciais
  const [filters, setFilters] = useState<Filters>({
    searchText: '',
    city: '',
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    attire: '',
    showPast: false,      // por padrão NÃO mostra eventos mais antigos que ontem
    sortBy: 'nearest',    // ordenação padrão = data mais próxima
  });

  // -------------------------
  // FETCH com paginação no BACK
  // -------------------------
  const fetchPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      try {
        if (pageToLoad === 1) {
          setLoading(true);      // primeira página => loading principal
        } else {
          setLoadingMore(true);  // próximas páginas => loading "Carregar mais"
        }

        setError(null); // limpa erro antes da requisição

        const response = await api.get('/api/events', {
          params: {
            page: pageToLoad,   // manda ?page=
            limit: PAGE_SIZE,   // e ?limit=
          },
        });

        // o back devolve { events, page, limit, total, hasMore }
        const { events: newEvents, hasMore: newHasMore } = response.data;

        setEvents((prev) =>
          append ? [...prev, ...newEvents] : newEvents // se append=true, concatena
        );
        setPage(pageToLoad);           // atualiza página atual
        setHasMore(!!newHasMore);      // garante boolean
      } catch (err) {
        console.error('🔥 Erro ao carregar eventos paginados:', err);
        setError('Erro ao carregar eventos. Tente novamente.');
      } finally {
        setLoading(false);     // em qualquer caso, tira loading inicial
        setLoadingMore(false); // e loadingMore também
      }
    },
    []
  );

  // carrega a PRIMEIRA página ao montar a Home
  useEffect(() => {
    fetchPage(1, false); // page=1, append=false (substitui qualquer coisa)
  }, [fetchPage]);

  // -------------------------
  // HANDLERS dos filtros
  // -------------------------
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchText: value })); // só troca searchText
  };

  const handleCityChange = (value: string) => {
    setFilters((prev) => ({ ...prev, city: value }));
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value })); // atualiza só dateFrom ou dateTo
  };

  const handlePriceChange = (field: 'priceMin' | 'priceMax', value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttireChange = (value: string) => {
    setFilters((prev) => ({ ...prev, attire: value }));
  };

  const handleShowPastChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, showPast: checked }));
  };

  const handleSortChange = (value: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchText: '',
      city: '',
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      attire: '',
      showPast: false,
      sortBy: 'nearest',
    });
  };

  // -------------------------
  // FILTRAGEM + ORDENACÃO no FRONT (em cima dos eventos já carregados)
  // -------------------------
  const filteredEvents = useMemo(() => {
    const today = new Date(); // data atual
    today.setHours(0, 0, 0, 0); // zera hora pra comparar só dia

    // ontem = hoje - 1 dia
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // converte datas dos filtros (se existirem)
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;

    const minPrice = parsePrice(filters.priceMin);
    const maxPrice = parsePrice(filters.priceMax);

    return events
      .filter((event) => {
        // ----- FILTRO: esconder eventos muito antigos (regra da Home) -----
        const eventDate = event.data ? new Date(event.data) : today;
        eventDate.setHours(0, 0, 0, 0);

        const isOlderThanYesterday = eventDate < yesterday;

        // se showPast = false e o evento é mais antigo que ontem => some
        if (!filters.showPast && isOlderThanYesterday) {
          return false;
        }

        // ----- FILTRO: busca por texto (nome/descrição/local) -----
        const search = filters.searchText.trim().toLowerCase();
        if (search) {
          const inName = (event.titulo || '')
            .toLowerCase()
            .includes(search);
          const inDesc = (event.descricao || '')
            .toLowerCase()
            .includes(search);
          const inLocal = (event.local || '')
            .toLowerCase()
            .includes(search);

          if (!inName && !inDesc && !inLocal) return false;
        }

        // ----- FILTRO: cidade/local -----
        const cityFilter = filters.city.trim().toLowerCase();
        if (cityFilter) {
          const local = (event.local || '').toLowerCase();
          if (!local.includes(cityFilter)) return false;
        }

        // ----- FILTRO: intervalo de datas -----
        if (dateFrom && eventDate < dateFrom) return false;
        if (dateTo && eventDate > dateTo) return false;

        // ----- FILTRO: preço -----
        const eventPrice = parsePrice(event.preco);
        if (minPrice !== null && eventPrice !== null && eventPrice < minPrice) {
          return false;
        }
        if (maxPrice !== null && eventPrice !== null && eventPrice > maxPrice) {
          return false;
        }

        // ----- FILTRO: traje -----
        const attireFilter = filters.attire.trim().toLowerCase();
        if (attireFilter) {
          const attire = (event.traje || '').toLowerCase();
          if (!attire.includes(attireFilter)) return false;
        }

        return true; // passou em todos os filtros
      })
      .sort((a, b) => {
        // ORDENACÃO baseada no sortBy
        const dateA = a.data ? new Date(a.data) : new Date();
        const dateB = b.data ? new Date(b.data) : new Date();

        if (filters.sortBy === 'nearest') {
          // mais próximos (data asc)
          return dateA.getTime() - dateB.getTime();
        }

        if (filters.sortBy === 'newest') {
          // mais recentes (data desc)
          return dateB.getTime() - dateA.getTime();
        }

        if (filters.sortBy === 'cheapest') {
          // mais baratos
          const priceA = parsePrice(a.preco) ?? Number.MAX_SAFE_INTEGER;
          const priceB = parsePrice(b.preco) ?? Number.MAX_SAFE_INTEGER;
          return priceA - priceB;
        }

        return 0;
      });
  }, [events, filters]);

  const visibleEvents = filteredEvents; // já filtrado e ordenado
  const canLoadMore = hasMore && !loading; // só mostra "Carregar mais" se tiver mais e não estiver no loading inicial

  // -------------------------
  // HANDLER de paginação (chamado pelo botão "Carregar mais")
  // -------------------------
  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return; // não faz nada se já estiver carregando ou não tiver mais
    fetchPage(page + 1, true);           // próxima página, em modo append
  };

  // o que a tela vai receber
  return {
    visibleEvents,
    loading,
    loadingMore,
    error,
    filters,
    canLoadMore,
    handleSearchChange,
    handleCityChange,
    handleDateChange,
    handlePriceChange,
    handleAttireChange,
    handleShowPastChange,
    handleSortChange,
    handleClearFilters,
    handleLoadMore,
  };
};
