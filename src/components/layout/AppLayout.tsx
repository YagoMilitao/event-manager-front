import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AppHeader from './AppHeader';

export default function AppLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppHeader />
      <Box sx={{ pt: 2, pb: 4 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
