// src/pages/events/MyEventsPage.tsx
// Este é o componente "Container" ou "Smart Component"
// Sua única responsabilidade é conectar o ViewModel à View.

import React from 'react';
import MyEventsPageScreen from './MyEventsPageScreen'; // A View (o componente visual)
import { useMyEventsViewModel } from '../../viewModels/useMyEventsViewModel';
// O ViewModel (o custom hook de lógica)

// NOTA IMPORTANTE: Este componente MyEventsPage NÃO RECEBE PROPS DO SEU PAI (Router.tsx).
// Ele obtém todos os dados e funções necessários CHAMANDO o useMyEventsViewModel internamente.
const MyEventsPage: React.FC = () => {
  // Chama o ViewModel (custom hook) para obter os dados e funções
  const { events, loading, error, handleLogout } = useMyEventsViewModel();

  // Passa os dados e funções obtidos do ViewModel como props para a View
  return (
    <MyEventsPageScreen
      events={events}
      loading={loading}
      error={error}
      onLogout={handleLogout}
    />
  );
};

export default MyEventsPage;