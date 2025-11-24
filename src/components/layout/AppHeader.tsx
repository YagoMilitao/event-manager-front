import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { clearToken } from '../../store/authSlice';

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
 

  const handleLogout = () => {
    dispatch(clearToken());
    navigate('/login');
  };
  // Se quiser esconder o header em algumas rotas:
  const hideHeaderOnRoutes = ['/login', '/register'];
  if (hideHeaderOnRoutes.includes(location.pathname)) {
    return null;
  }

  const handleGoHome = () => navigate('/');

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
              <Button color="inherit" component={RouterLink} to="/login">
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
