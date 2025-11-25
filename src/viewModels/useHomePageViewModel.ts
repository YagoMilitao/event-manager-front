/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import { EventData } from '../data/EventData';
import { toast } from 'react-toastify';

export type SortBy = 'nearest' | 'newest' | 'cheapest';

export interface HomeFilters {
  searchText: string;
  city: string;
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
  attire: string;
  showPast: boolean;
  sortBy: SortBy;
}

export interface HomePageViewModel {
  events: EventData[];
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
  handleShowPastChange: (checked: boolean) => void;
  handleSortChange: (value: SortBy) => void;
  handleClearFilters: () => void;
  handleLoadMore: () => void;
}

const PAGE_SIZE = 10;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parsePrice(preco?: any): number | null {
  if (preco === null || preco === undefined || preco === '') return null;
  if (typeof preco === 'number') return preco;
  if (typeof preco === 'string') {
    const normalized = preco.replace('.', '').replace(',', '.');
    const num = Number(normalized);
    return Number.isNaN(num) ? null : num;
  }
  return null;
}

export function useHomePageViewModel(): HomePageViewModel {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<HomeFilters>({
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/api/events');
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.events || [];

        setEvents(data);
      } catch (err: any) {
        console.error('🔥 Erro ao buscar eventos:', err?.response?.data || err);
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Erro ao carregar eventos. Tente novamente.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const today = startOfDay(new Date());

    return events.filter((event) => {
      const eventDate = event.data ? startOfDay(new Date(event.data)) : today;
      const diffDays =
        (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      // regra base: não mostrar eventos muito antigos,
      // só ontem, hoje e futuros — a não ser que o usuário escolha ver passados
      if (!filters.showPast && diffDays < -1) {
        return false;
      }

      // filtro texto (nome / titulo / descrição)
      const search = filters.searchText.trim().toLowerCase();
      if (search) {
        const alvo = [
          (event.titulo || '').toLowerCase(),
          (event.descricao || '').toLowerCase(),
        ].join(' ');
        if (!alvo.includes(search)) return false;
      }

      // filtro cidade/local
      const city = filters.city.trim().toLowerCase();
      if (city && !(event.local || '').toLowerCase().includes(city)) {
        return false;
      }

      // filtro data from/to
      if (filters.dateFrom) {
        const fromDate = startOfDay(new Date(filters.dateFrom));
        if (eventDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const toDate = startOfDay(new Date(filters.dateTo));
        if (eventDate > toDate) return false;
      }

      // filtro price
      const price = parsePrice((event as any).preco);
      const min = filters.priceMin ? Number(filters.priceMin) : null;
      const max = filters.priceMax ? Number(filters.priceMax) : null;

      if (min !== null && price !== null && price < min) return false;
      if (max !== null && price !== null && price > max) return false;

      // filtro traje
      const attireFilter = filters.attire.trim().toLowerCase();
      if (
        attireFilter &&
        !(event.traje || '').toLowerCase().includes(attireFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  const sortedEvents = useMemo(() => {
    const copy = [...filteredEvents];

    if (filters.sortBy === 'nearest') {
      return copy.sort((a, b) => {
        const da = a.data ? new Date(a.data) : new Date();
        const db = b.data ? new Date(b.data) : new Date();
        return da.getTime() - db.getTime();
      });
    }

    if (filters.sortBy === 'newest') {
      return copy.sort((a, b) => {
        const da = a.data ? new Date(a.data) : new Date();
        const db = b.data ? new Date(b.data) : new Date();
        return db.getTime() - da.getTime();
      });
    }

    // cheapest
    return copy.sort((a, b) => {
      const pa = parsePrice((a as any).preco) ?? Number.MAX_SAFE_INTEGER;
      const pb = parsePrice((b as any).preco) ?? Number.MAX_SAFE_INTEGER;
      return pa - pb;
    });
  }, [filteredEvents, filters.sortBy]);

  const visibleEvents = useMemo(
    () => sortedEvents.slice(0, page * PAGE_SIZE),
    [sortedEvents, page],
  );

  const canLoadMore = visibleEvents.length < sortedEvents.length;

  // handlers de filtro
  const handleSearchChange = (value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, searchText: value }));
  };

  const handleCityChange = (value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, city: value }));
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (
    field: 'priceMin' | 'priceMax',
    value: string,
  ) => {
    // só número e vírgula/ponto
    const sanitized = value.replace(/[^\d.,]/g, '');
    setPage(1);
    setFilters((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handleAttireChange = (value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, attire: value }));
  };

  const handleShowPastChange = (checked: boolean) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, showPast: checked }));
  };

  const handleSortChange = (value: SortBy) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, sortBy: value }));
  };

  const handleClearFilters = () => {
    setPage(1);
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

  const handleLoadMore = () => {
    if (canLoadMore) setPage((prev) => prev + 1);
  };

  return {
    events,
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
