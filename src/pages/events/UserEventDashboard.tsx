import React from 'react';                             
import {
  Container,                                           
  Typography,                                          
  Button,                                              
  Box,                                                 
  Paper,                                               
  Stack,                                               
} from '@mui/material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HomeIcon from '@mui/icons-material/Home';

import {                                                // Importa o hook de viewModel
  useUserEventDashboardViewModel,
} from '../../viewModels/useUserEventDashboardViewModel';

// Componente de tela do dashboard do usuário
const UserEventDashboard: React.FC = () => {
  // Usa o hook para pegar as ações de navegação
  const {
    handleGoToMyEvents,
    handleGoToCreateEvent,
    handleGoToHome,   
  } = useUserEventDashboardViewModel();

  // Renderização da UI
  return (
    <Container
      maxWidth="md"           // Limita a largura máxima para ficar mais centralizado
      sx={{ mt: 4, mb: 4 }}   // Margem em cima e embaixo
    >
      <Paper
        elevation={3}         // Sombra do card
        sx={(theme) => ({     // Usa o tema atual (respeita light/dark mode)
          p: 3,               // Padding interno
          borderRadius: 3,    // Bordas arredondadas
          backgroundColor: theme.palette.background.paper, // Cor do fundo baseada no tema
        })}
      >
        {/* Título + ícone */}
        <Box
          sx={{
            display: 'flex',              // Layout em linha
            alignItems: 'center',         // Centraliza verticalmente
            mb: 2,                        // Margem abaixo
            gap: 1,                       // Espaço entre ícone e texto
          }}
        >
          <CelebrationIcon />
          <Typography
            variant="h4"                  // Tamanho do título
            component="h1"                // Semântica HTML
          >
            Painel do Organizador
          </Typography>
        </Box>

        {/* Subtítulo explicando a página */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Aqui você gerencia todos os eventos que criou e pode adicionar novos.
        </Typography>

        {/* Botões principais em layout responsivo */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}  // Em telas pequenas: coluna; em maiores: linha
          spacing={2}                              // Espaço entre os botões
        >
          <Button
            variant="contained"                    // Botão "principal"
            color="primary"
            startIcon={<ListAltIcon />}            // Ícone de lista
            onClick={handleGoToMyEvents}           // Vai para /my-events
            fullWidth                              // Ocupa toda a largura da coluna
          >
            Meus eventos criados
          </Button>

          <Button
            variant="outlined"                     // Botão secundário
            color="primary"
            startIcon={<AddCircleOutlineIcon />}   // Ícone de "+"
            onClick={handleGoToCreateEvent}        // Vai para /create-event
            fullWidth
          >
            Criar novo evento
          </Button>
        </Stack>

        {/* Botão de voltar para Home, alinhado à direita */}
        <Box
          sx={{
            mt: 3,               // Margem acima
            display: 'flex',
            justifyContent: 'flex-end', // Joga o botão para a direita
          }}
        >
          <Button
            variant="text"       // Botão mais "leve"
            color="inherit"      // Usa a cor herdada do AppBar/tema
            startIcon={<HomeIcon />}
            onClick={handleGoToHome}  // Vai para /
          >
            Voltar para a Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserEventDashboard;
