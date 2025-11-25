// src/viewModels/useHomePageViewModel.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/api';
import { EventData } from '../data/EventData';
import { toast } from 'react-toastify';

type SortBy = 'nearest' | 'newest' | 'cheapest';

interface HomeFilters {
  searchText: string;
  city: string;
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
  attire: string;
  sortBy: SortBy;
  showPast: boolean;
}

export interface HomePageViewModel {
  visibleEvents: EventData[];
  loading: boolean;
  error: string | null;
  filters: HomeFilters;
  canLoadMore: boolean;

  handleSearchChange: (value: string) => void;
  handleCityChange: (value: string) => void;
  handleDateChange: (field: 'dateFrom' | 'dateTo', value: string) => void;
  handlePriceChange: (field: 'priceMin' | 'priceMax', value: string) => void;
  handleAttireChange: (value: string) => void;
  handleShowPastChange: (value: boolean) => void;
  handleSortChange: (value: SortBy) => void;
  handleClearFilters: () => void;
  handleLoadMore: () => void;
}

const PAGE_SIZE = 10;

const createInitialFilters = (): HomeFilters => ({
  searchText: '',
  city: '',
  dateFrom: '',
  dateTo: '',
  priceMin: '',
  priceMax: '',
  attire: '',
  sortBy: 'nearest',
  showPast: false,
});

export function useHomePageViewModel(): HomePageViewModel {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<HomeFilters>(createInitialFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchDebounceRef = useRef<number | undefined>(undefined);

  const [page, setPage] = useState(1);

  // =============================
  // Fetch de eventos (uma vez)
  // =============================
  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/api/events');
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.events || [];

        if (!cancelled) {
          setEvents(data);
        }
      } catch (err: any) {
        console.error('❌ Erro ao carregar eventos:', err?.response?.data || err);
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Erro ao carregar eventos. Tente novamente.';
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  // =============================
  // Debounce da busca por texto
  // =============================
  useEffect(() => {
    // limpa timer antigo
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(() => {
      setDebouncedSearch(filters.searchText.trim().toLowerCase());
    }, 300); // 300ms

    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, [filters.searchText]);

  // =============================
  // Helpers de datas
  // =============================
  /*const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);*/

  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // =============================
  // Aplica filtros e ordenação
  // =============================
  const filteredAndSorted = useMemo(() => {
    if (!events.length) return [];

    return (
      events
        // 1) Filtro por passado / futuro
        .filter((event) => {
          const eventDate = event.data ? new Date(event.data) : null;
          if (!eventDate) return false;

          const eventDay = new Date(eventDate);
          eventDay.setHours(0, 0, 0, 0);

          // Regra base: só mostra hoje, amanhã, futuros e ontem
          if (!filters.showPast) {
            // se é mais antigo que ontem, some
            if (eventDay < yesterday) return false;
          }

          return true;
        })

        // 2) Filtro por dataFrom / dateTo
        .filter((event) => {
          if (!filters.dateFrom && !filters.dateTo) return true;

          const eventDate = event.data ? new Date(event.data) : null;
          if (!eventDate) return false;

          const eventTime = eventDate.getTime();

          if (filters.dateFrom) {
            const from = new Date(filters.dateFrom);
            from.setHours(0, 0, 0, 0);
            if (eventTime < from.getTime()) return false;
          }

          if (filters.dateTo) {
            const to = new Date(filters.dateTo);
            to.setHours(23, 59, 59, 999);
            if (eventTime > to.getTime()) return false;
          }

          return true;
        })

        // 3) Filtro por texto (debounced)
        .filter((event) => {
          if (!debouncedSearch) return true;

          const nome = (event.titulo || '').toLowerCase();
          const descricao = (event.descricao || '').toLowerCase();

          return (
            nome.includes(debouncedSearch) || descricao.includes(debouncedSearch)
          );
        })

        // 4) Filtro por cidade / local
        .filter((event) => {
          if (!filters.city.trim()) return true;
          const local = (event.local || '').toLowerCase();
          return local.includes(filters.city.trim().toLowerCase());
        })

        // 5) Filtro por preço (min/max)
        .filter((event) => {
          const rawPreco = event.preco ?? '';
          const numeroPreco = Number(
            String(rawPreco).replace(/[^\d.,]/g, '').replace(',', '.'),
          );

          if (filters.priceMin) {
            const min = Number(filters.priceMin.replace(',', '.'));
            if (!Number.isNaN(min) && !Number.isNaN(numeroPreco)) {
              if (numeroPreco < min) return false;
            }
          }

          if (filters.priceMax) {
            const max = Number(filters.priceMax.replace(',', '.'));
            if (!Number.isNaN(max) && !Number.isNaN(numeroPreco)) {
              if (numeroPreco > max) return false;
            }
          }

          return true;
        })

        // 6) Filtro por traje
        .filter((event) => {
          if (!filters.attire.trim()) return true;
          const traje = (event.traje || '').toLowerCase();
          return traje.includes(filters.attire.trim().toLowerCase());
        })

        // 7) Ordenação
        .sort((a, b) => {
          if (filters.sortBy === 'nearest') {
            const da = a.data ? new Date(a.data).getTime() : Infinity;
            const db = b.data ? new Date(b.data).getTime() : Infinity;
            return da - db;
          }

          if (filters.sortBy === 'newest') {
            // mais recentes primeiro
            const da = a.data ? new Date(a.data).getTime() : 0;
            const db = b.data ? new Date(b.data).getTime() : 0;
            return db - da;
          }

          if (filters.sortBy === 'cheapest') {
            const pa = Number(
              String(a.preco ?? '').replace(/[^\d.,]/g, '').replace(',', '.'),
            );
            const pb = Number(
              String(b.preco ?? '').replace(/[^\d.,]/g, '').replace(',', '.'),
            );
            const na = Number.isNaN(pa) ? Infinity : pa;
            const nb = Number.isNaN(pb) ? Infinity : pb;
            return na - nb;
          }

          return 0;
        })
    );
  }, [events, filters, debouncedSearch, yesterday]);

  // =============================
  // Paginação em memória
  // =============================
  const visibleEvents = useMemo(
    () => filteredAndSorted.slice(0, page * PAGE_SIZE),
    [filteredAndSorted, page],
  );

  const canLoadMore = visibleEvents.length < filteredAndSorted.length;

  // =============================
  // Handlers dos filtros
  // =============================
  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchText: value }));
    setPage(1);
  }, []);

  const handleCityChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, city: value }));
    setPage(1);
  }, []);

  const handleDateChange = useCallback(
    (field: 'dateFrom' | 'dateTo', value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
      setPage(1);
    },
    [],
  );

  const handlePriceChange = useCallback(
    (field: 'priceMin' | 'priceMax', value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
      setPage(1);
    },
    [],
  );

  const handleAttireChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, attire: value }));
    setPage(1);
  }, []);

  const handleShowPastChange = useCallback((value: boolean) => {
    setFilters((prev) => ({ ...prev, showPast: value }));
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: SortBy) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(createInitialFilters());
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (canLoadMore) {
      setPage((prev) => prev + 1);
    }
  }, [canLoadMore]);

  return {
    visibleEvents,
    loading,
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
}
