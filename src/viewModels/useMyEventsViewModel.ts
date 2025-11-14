import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { auth } from '../firebase';
import api from '../api/api';
import { EventData } from '../data/EventData';
import { RootState } from '../store/store';

interface MyEventsViewModel {
  events: EventData[];
  loading: boolean;
  error: string | null;
  handleLogout: () => void;
}


export const useMyEventsViewModel = (): MyEventsViewModel => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token); 
  // O Redux não tem `authLoading` ou `authError` diretamente para o token,
  // você assume que se o token existe, o usuário está "autenticado" para fins de UI.
  // O backend fará a validação real do token.

  const fetchMyEvents = useCallback(async () => {
    // A lógica agora depende apenas da existência do token do Redux
    if (!token) { // Se não há token, o usuário não está logado
      setError('Você precisa estar logado para ver seus eventos.');
      setLoading(false);
      // O PrivateRoute já deve redirecionar, mas este é um fallback para consistência da mensagem
      setTimeout(() => navigate('/login'), 2000); 
      return;
    }

    try {
      setLoading(true); // Inicia o carregamento antes da requisição
      setError(null); // Limpa erros anteriores

      // Faz a requisição ao backend usando o token do Redux
      const response = await api.get('/events/my-events', {
        headers: {
          Authorization: `Bearer ${token}` // Envia o token para o backend
        }
      });
      setEvents(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar meus eventos:', err.response?.data || err.message);
      // Se o erro for 401 ou 403 (token inválido/expirado), você pode redirecionar para o login
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sessão expirada ou não autorizada. Faça login novamente.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Erro ao carregar seus eventos. Tente novamente.');
      }
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  }, [token, navigate]); // Dependências do useCallback: apenas o token do Redux e navigate

  useEffect(() => {
    fetchMyEvents(); // Chama a função de busca quando o ViewModel é montado ou o token muda
  }, [fetchMyEvents]); // Dependência do useEffect

  // O logout também precisa interagir com o Redux se ele for o único a armazenar o token
  // Assumindo que você tem uma action de logout no seu authSlice.ts
  // Para fins de exemplo, farei um logout simples do Firebase auth,
  // mas se o Redux gerencia o token, ele deveria ser o ponto de verdade.
  // Se você tem uma action Redux para logout, ela seria disparada aqui.
  const handleLogout = useCallback(async () => {
    try {
      // Se você usa o Firebase Authentication:
      // await auth.signOut(); // Ainda pode ser necessário para limpar o estado do Firebase Auth

      // Se você gerencia o token puramente via Redux e o backend, você precisaria
      // despachar uma action para limpar o token no Redux.
      // Ex: dispatch(authActions.logout()); // Assumindo uma action 'logout'

      // Por agora, para compatibilidade com o Firebase auth que você já tem configurado para login/register:
      await auth.signOut(); 
      console.log('Usuário deslogado com sucesso!');
      navigate('/login');
    } catch (err: any) {
      console.error('Erro ao fazer logout:', err);
      setError('Erro ao fazer logout. Tente novamente.');
    }
  }, [navigate]);

  return {
    events,
    loading: loading,
    error: error,
    handleLogout,
  };
};