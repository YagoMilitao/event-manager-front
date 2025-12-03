import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../LoginPageScreen';

const LoginModal: React.FC = () => {
  const navigate = useNavigate();

  // fecha o modal voltando pra rota de fundo (backgroundLocation)
  const handleClose = () => {
    navigate(-1); // volta um passo no histórico (de /login -> rota anterior)
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        Entrar
        <IconButton
          aria-label="close"
          onClick={handleClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <LoginPage />
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
