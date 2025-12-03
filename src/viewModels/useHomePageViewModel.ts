/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useCallback,
  useEffect,
  useMemo,  
  useState,
} from 'react';
import api from '../api/api';
import { EventData } from '../data/EventData';

// quantos eventos por página queremos carregar
const PAGE_SIZE = 10;                         

// Tipo dos filtros usados na Home
type SortBy = 'nearest' | 'newest' | 'cheapest';

interface HomeFilters {
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

interface HomePageViewModel {
  visibleEvents: EventData[];   
  loading: boolean;             
  loadingMore: boolean;         
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

export const useHomePageViewModel = (): HomePageViewModel => {
  // ======= ESTADO BÁSICO DOS EVENTOS / PAGINAÇÃO =======

  const [events, setEvents] = useState<EventData[]>([]); 
  const [page, setPage] = useState(1);                   
  const [canLoadMore, setCanLoadMore] = useState(false); 
  const [loading, setLoading] = useState(true);           
  const [loadingMore, setLoadingMore] = useState(false);  
  const [error, setError] = useState<string | null>(null);

  // ======= ESTADO DOS FILTROS =======

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

  // ======= FUNÇÃO PARA BUSCAR UMA PÁGINA DE EVENTOS NO BACKEND =======
  // pageToLoad: número da página (1, 2, 3...)
  // append: se true, faz "append" (Carregar mais); se false, substitui tudo (primeiro load)
  const fetchEventsPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      // decide qual loading ligar
      if (append) {
        setLoadingMore(true);                 // caso seja "Carregar mais"
      } else {
        setLoading(true);                     // caso seja carregamento inicial / recarregar tudo
      }

      try {
        setError(null);                       // limpa erro anterior

        const response = await api.get('/api/events', {
          params: {
            page: pageToLoad,                 // page do backend
            limit: PAGE_SIZE,                 // quantos itens por página
          },
        });

        // espera-se que o backend retorne { events, page, limit, total, hasMore }
        const data = response.data;

        const newEvents = (data.events || []) as EventData[];
        const hasMore = Boolean(data.hasMore);

        setEvents((prev) =>
          append ? [...prev, ...newEvents] : newEvents, // se append, concatena; senão substitui
        );
        setPage(pageToLoad);                // atualiza page atual
        setCanLoadMore(hasMore);            // guarda se tem mais página
      } catch (err: any) {
        console.error('🔥 Erro ao buscar eventos:', err?.response?.data || err);

        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Erro ao carregar eventos. Tente novamente.';

        setError(msg);                      // guarda erro
      } finally {
        if (append) {
          setLoadingMore(false);            // desliga loading do botão
        } else {
          setLoading(false);                // desliga loading geral
        }
      }
    },
    [],
  );

  // ======= CARREGAMENTO INICIAL AUTOMÁTICO =======
  // assim que a Home monta, já chamamos a página 1 sem precisar clicar em nada
  useEffect(() => {
    fetchEventsPage(1, false);              // carrega primeira página, substituindo qualquer coisa
  }, [fetchEventsPage]);

  // ======= FILTRAGEM / ORDENAÇÃO NO FRONT (EM CIMA DOS EVENTS CARREGADOS) =======

  const visibleEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    // helper: normaliza strings pra comparar (minúsculo, sem espaços nas pontas)
    const normalize = (value: string | undefined | null) =>
      (value || '').toString().toLowerCase().trim();

    // converte string "YYYY-MM-DD" pra Date no começo do dia
    const parseDateInput = (value: string) => {
      if (!value) return null;
      const [year, month, day] = value.split('-').map(Number);
      if (!year || !month || !day) return null;
      return new Date(year, month - 1, day);
    };

    const dateFrom = parseDateInput(filters.dateFrom);
    const dateTo = parseDateInput(filters.dateTo);

    const minPrice = filters.priceMin
      ? Number(filters.priceMin.replace(',', '.'))
      : null;                                         // transforma preço min em number
    const maxPrice = filters.priceMax
      ? Number(filters.priceMax.replace(',', '.'))
      : null;                                         // transforma preço max em number

    // 1) filtra
    const filtered = events.filter((event) => {
      const eventName = normalize(event.eventName);
      const description = normalize(event.description);
      const city = normalize(event.location);
      const attire = normalize(event.dressCode);

      const search = normalize(filters.searchText);
      const filterCity = normalize(filters.city);
      const filterAttire = normalize(filters.attire);

      // data do evento
      const eventDate = event.date
        ? new Date(event.date)
        : null;

      // ----- filtro: busca por texto -----
      if (search) {
        const matchesSearch =
          eventName.includes(search) || description.includes(search);
        if (!matchesSearch) return false;
      }

      // ----- filtro: cidade/local -----
      if (filterCity) {
        if (!city.includes(filterCity)) return false;
      }

      // ----- filtro: data inicial -----
      if (dateFrom && eventDate) {
        // se o evento for ANTES da dataFrom, exclui
        if (eventDate < dateFrom) return false;
      }

      // ----- filtro: data final -----
      if (dateTo && eventDate) {
        // se o evento for DEPOIS da dataTo, exclui
        if (eventDate > dateTo) return false;
      }

      // ----- filtro: preço -----
      if (minPrice !== null || maxPrice !== null) {
        // tenta converter event.preco pra number
        const rawPrice = (event as any).preco;
        const numericPrice = rawPrice
          ? Number(String(rawPrice).replace(/[^\d,.-]/g, '').replace(',', '.'))
          : 0;

        if (minPrice !== null && numericPrice < minPrice) return false;
        if (maxPrice !== null && numericPrice > maxPrice) return false;
      }

      // ----- filtro: traje -----
      if (filterAttire) {
        if (!attire.includes(filterAttire)) return false;
      }

      // ----- filtro: mostrar passados ou não -----
      if (!filters.showPast && eventDate) {
          const eventDay = new Date(eventDate);  // cópia
          eventDay.setHours(0, 0, 0, 0);         // zera hora pra comparar só o dia
          // se o dia do evento for antes de hoje, aí sim é "passado"
          if (eventDay < today) return false;
      }
      return true; // passou em todos os filtros
    });

    // 2) ordena
    const sorted = [...filtered].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date();
      const dateB = b.date ? new Date(b.date) : new Date();

      if (filters.sortBy === 'nearest') {
        // mais próximos pela data do evento (ascendente)
        return Number(dateA) - Number(dateB);
      }

      if (filters.sortBy === 'newest') {
        // mais recentes pela createdAt (fallback pra data)
        const createdA = (a as any).createdAt
          ? new Date((a as any).createdAt)
          : dateA;
        const createdB = (b as any).createdAt
          ? new Date((b as any).createdAt)
          : dateB;
        return Number(createdB) - Number(createdA); // decrescente
      }

      if (filters.sortBy === 'cheapest') {
        // ordena por preço numérico
        const rawPriceA = (a as any).preco;
        const rawPriceB = (b as any).preco;

        const priceA = rawPriceA
          ? Number(String(rawPriceA).replace(/[^\d,.-]/g, '').replace(',', '.'))
          : 0;
        const priceB = rawPriceB
          ? Number(String(rawPriceB).replace(/[^\d,.-]/g, '').replace(',', '.'))
          : 0;

        return priceA - priceB;
      }

      return 0;
    });

    return sorted;                                // essa lista é a que vai pra tabela na Home
  }, [events, filters]);

  // ======= HANDLERS DE FILTRO =======

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchText: value }));
  };

  const handleCityChange = (value: string) => {
    setFilters((prev) => ({ ...prev, city: value }));
  };

  const handleDateChange = (
    field: 'dateFrom' | 'dateTo',
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (
    field: 'priceMin' | 'priceMax',
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttireChange = (value: string) => {
    setFilters((prev) => ({ ...prev, attire: value }));
  };

  const handleShowPastChange = (value: boolean) => {
    setFilters((prev) => ({ ...prev, showPast: value }));
  };

  const handleSortChange = (value: SortBy) => {
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

  // ======= PAGINAÇÃO: CARREGAR MAIS =======

  const handleLoadMore = () => {
    // só tenta carregar mais se tiver mais e não estiver carregando já
    if (!canLoadMore || loadingMore) return;

    const nextPage = page + 1;                  // próxima página
    fetchEventsPage(nextPage, true);            // chama backend em modo append
  };

  // ======= RETORNA TUDO QUE A TELA PRECISA =======

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
