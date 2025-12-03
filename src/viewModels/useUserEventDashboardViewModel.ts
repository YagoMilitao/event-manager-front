import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Interface que define tudo que o view model devolve para a UI
export interface UserEventDashboardViewModel {
  handleGoToMyEvents: () => void;
  handleGoToCreateEvent: () => void;
  handleGoToHome: () => void;
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
