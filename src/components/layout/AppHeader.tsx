import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { clearToken } from '../../store/authSlice';
import { useContext } from 'react';
import { ColorModeContext } from '../../theme/ColorModeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';


export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
 
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const handleLogout = () => {
    dispatch(clearToken());
    navigate('/login');
  };
  // Esconder o header em algumas rotas:
  const hideHeaderOnRoutes = ['/login', '/register'];
  if (hideHeaderOnRoutes.includes(location.pathname)) {
    return null;
  }

  const handleGoHome = () => navigate('/');

  const handleOpenLoginModal = () => {
    navigate('/login', {
      state: { backgroundLocation: location },  // guarda a rota atual como "fundo"
    });
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo / Título clicável */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={handleGoHome}
        >
          Event Manager
        </Typography>

        {/* Botão toggle de tema */}
        <Tooltip title={mode === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}>
          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            sx={{ mr: 1 }}
            size="large"
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>

        {/* Links principais */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>

          {token && (
            <>
              <Button color="inherit" component={RouterLink} to="/event-dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={RouterLink} to="/my-events">
                Meus Eventos
              </Button>
              <Button color="inherit" component={RouterLink} to="/create-event">
                Criar Evento
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Sair
              </Button>
            </>
          )}

          {!token && (
            <>
              {/* 👇 troca o Link por um onClick que abre o modal */}
              <Button color="inherit" onClick={handleOpenLoginModal}>
                Entrar
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Registrar
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
