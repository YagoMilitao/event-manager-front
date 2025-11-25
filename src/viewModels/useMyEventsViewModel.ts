/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { auth } from '../firebase';
import api from '../api/api';
import { EventData } from '../data/EventData';
import { RootState } from '../store/store';
import { toast } from 'react-toastify';

interface MyEventsViewModel {
  events: EventData[];
  loading: boolean;
  error: string | null;
  handleLogout: () => void;
  handleDeleteSelected: (ids: string[]) => Promise<void>;
}

export const useMyEventsViewModel = (): MyEventsViewModel => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);

  const fetchMyEvents = useCallback(async () => {
    if (!token) {
      setError('Você precisa estar logado para ver seus eventos.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📥 Buscando meus eventos em /api/events/my-event ...');
      const response = await api.get('/api/events/my-event', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Meus eventos carregados:', response.data);
      setEvents(response.data);
    } catch (err: any) {
      console.error(
        '🔥 Erro ao buscar meus eventos:',
        err?.response?.data || err?.message,
      );

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Erro ao carregar seus eventos. Tente novamente.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      console.log('👋 Usuário deslogado com sucesso');
      navigate('/login');
    } catch (err: any) {
      console.error('Erro ao fazer logout:', err);
      setError('Erro ao fazer logout. Tente novamente.');
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  }, [navigate]);

  const handleDeleteSelected= useCallback(
    async (ids: string[]) => {
      if (!token) {
        toast.error('Você precisa estar logado para excluir eventos.');
        navigate('/login');
        return;
      }

      if (!ids.length) return;

      try {
        console.log('🗑️ Deletando eventos (frontend):', ids);
        await Promise.all(
          ids.map((id) =>
            api.delete(`/api/events/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ),
        );

        console.log('✅ Eventos deletados com sucesso:', ids);

        // Remove do estado local
        setEvents((prev) => prev.filter((e) => !ids.includes(e._id)));

        toast.success(
          ids.length === 1
            ? 'Evento excluído com sucesso!'
            : `${ids.length} eventos excluídos com sucesso!`,
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
      }
    },
    [token, navigate],
  );

  return {
    events,
    loading,
    error,
    handleLogout,
    handleDeleteSelected,
  };
};
