import React from 'react';
import MyEventsPageScreen from './MyEventsPageScreen';
import { useMyEventsViewModel } from '../../viewModels/useMyEventsViewModel';

const MyEventsPage: React.FC = () => {
  const {
    events,
    loading,
    error,
    handleLogout,
    onDeleteSelected ,
  } = useMyEventsViewModel();

  return (
    <MyEventsPageScreen
      events={events}
      loading={loading}
      error={error}
      onLogout={handleLogout}
      onDeleteSelected={onDeleteSelected }
    />
  );
};

export default MyEventsPage;
