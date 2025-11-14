import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setToken, clearToken } from '../store/authSlice';
import { PayloadAction } from '@reduxjs/toolkit';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  const login = (action: PayloadAction<string>) => {
    dispatch(setToken(action.payload));
  };

  const signout = () => {
    dispatch(clearToken());
  };

  return { token, login, signout };
};
