import { useCallback } from 'react';              // Importa useCallback para memorizar funções
import { useNavigate } from 'react-router-dom';  // Hook do react-router para navegar entre páginas

// Interface que define tudo que o view model devolve para a UI
export interface UserEventDashboardViewModel {
  handleGoToMyEvents: () => void;      // Função para ir para /my-events
  handleGoToCreateEvent: () => void;   // Função para ir para /create-event
  handleGoToHome: () => void;          // Função para ir para /
}

// Hook responsável pela "lógica" do dashboard
export const useUserEventDashboardViewModel = (): UserEventDashboardViewModel => {
  const navigate = useNavigate();  // Pega a função de navegação do react-router

  // Navega para página "Meus eventos"
  const handleGoToMyEvents = useCallback(() => {
    navigate('/my-events');        // Empurra a rota /my-events para o histórico
  }, [navigate]);                  // Depende de navigate (garante que a função é estável)

  // Navega para página de criação de evento
  const handleGoToCreateEvent = useCallback(() => {
    navigate('/create-event');     // Empurra a rota /create-event para o histórico
  }, [navigate]);

  // Navega para a Home
  const handleGoToHome = useCallback(() => {
    navigate('/');                 // Empurra a rota / para o histórico
  }, [navigate]);

  // Expondo as funções para serem usadas na tela
  return {
    handleGoToMyEvents,
    handleGoToCreateEvent,
    handleGoToHome,
  };
};
