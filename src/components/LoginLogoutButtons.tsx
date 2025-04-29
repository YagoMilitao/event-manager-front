import { useSelector, useDispatch } from 'react-redux'; 
// Hook para acessar e mudar o estado global (Redux)

import { RootState } from '../store';
import { clearToken } from '../store/authSlice';
import { useNavigate } from 'react-router-dom'; 
// Hook para mudar de página no React Router
import { Button } from '@mui/material';

export default function LoginLogoutButtons() {
  const token = useSelector((state: RootState) => state.auth.token); 
  // Pegando o token atual do Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login');
  // Se clicar em Login, vai para a página de login

  const handleLogout = () => {
    dispatch(clearToken()); 
    // Remove o token do Redux
    navigate('/'); 
    // Volta para a página inicial
  };

  // Se tem token → botão de logout
  // Se não tem token → botão de login
  return token ? (
    <Button onClick={handleLogout} variant="outlined" color="error">
      Logout
    </Button>
  ) : (
    <Button onClick={handleLogin} variant="contained" color="primary">
      Login
    </Button>
  );
}
// Botão de login ou logout, dependendo do estado de autenticação do usuário