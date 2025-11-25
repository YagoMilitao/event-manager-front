import React from 'react';
import MyEventsPageScreen from './MyEventsPageScreen';
import { useMyEventsViewModel } from '../../viewModels/useMyEventsViewModel';


const MyEventsPage: React.FC = () => {
  const vm = useMyEventsViewModel();

  return <MyEventsPageScreen {...vm} />;
};

export default MyEventsPage;
