import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCredentials, logout } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const login = (token: string, user: any) => {
    dispatch(setCredentials({ token, user }));
  };

  const signout = () => {
    dispatch(logout());
  };

  return { token, user, login, signout };
};
