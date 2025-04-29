import { useDispatch } from 'react-redux';
import { clearToken } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearToken());
    navigate('/login');
  };

  return (
    <button onClick={handleLogout}>
      Sair
    </button>
  );
}
