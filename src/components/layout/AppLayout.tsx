// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AppHeader from './AppHeader';

export default function AppLayout() {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header full width */}
      <AppHeader />

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'center', // centraliza o conteúdo
          py: 3,
          px: 2,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
