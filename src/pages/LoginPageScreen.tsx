import React, { useEffect, useState } from 'react';                               // React + hooks de estado
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
} from '@mui/material';                                                
import GoogleIcon from '@mui/icons-material/Google';                   
import { useNavigate } from 'react-router-dom';                        
import { useDispatch } from 'react-redux';                             
import { 
  signInWithEmailAndPassword,                                          
  signInWithPopup                                                      
} from 'firebase/auth'; 
import XIcon from '@mui/icons-material/X';                             
import { auth, googleProvider, setAuthPersistence, twitterProvider } from '../firebase';   
import { setToken } from '../store/authSlice';                         
import { toast } from 'react-toastify';                                

const LoginPageScreen: React.FC = () => {
  // ---------- ESTADOS DO FORM ----------
  const [email, setEmail] = useState('');                               // guarda o email digitado
  const [password, setPassword] = useState('');                         // guarda a senha digitada
  const [rememberEmail, setRememberEmail] = useState(false);

  // ---------- ESTADOS DE LOADING ----------
  const [isLoading, setIsLoading] = useState(false);                    // loading do login email/senha
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);        // loading do login Google
  const [isLoadingTwitter, setIsLoadingTwitter] = useState(false);      // 👈 NOVO: login Twitter

  

  const navigate = useNavigate();                                       // hook pra redirecionar o usuário
  const dispatch = useDispatch();                                       // hook pra disparar actions no Redux

  useEffect(() => {
    // lê do localStorage se o usuário já tinha pedido pra lembrar o e-mail
    const savedEmail = localStorage.getItem('login_email');        // e-mail salvo (se existir)
    const savedRemember = localStorage.getItem('login_remember');  // "true" ou "false"

    if (savedEmail && savedRemember === 'true') {
      setEmail(savedEmail);             // preenche o campo de e-mail
      setRememberEmail(true);           // marca a checkbox
    }
}, []);


  // =======================================================
  // 1) LOGIN COM EMAIL + SENHA
  // =======================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();                                                 // evita reload da página

    try {
      setIsLoading(true);                                               // liga spinner do botão "Entrar"
      await setAuthPersistence(rememberEmail);

      // Faz o login no Firebase usando email e senha
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Pega o ID token JWT desse usuário logado
      const idToken = await cred.user.getIdToken();

      // Joga o token no Redux pra usarmos no backend (Authorization: Bearer <token>)
      dispatch(setToken(idToken));

      toast.success('Login realizado com sucesso!');                    // feedback positivo

      navigate('/event-dashboard');                                     // redireciona pro dashboard
      // Salva ou limpa o e-mail no localStorage, conforme a checkbox
      if (rememberEmail) {
        localStorage.setItem('login_email', email);     // guarda o e-mail
        localStorage.setItem('login_remember', 'true'); // marca que era pra lembrar
      } else {
        localStorage.removeItem('login_email');         // limpa se desmarcar
        localStorage.removeItem('login_remember');
      }

    } catch (err: any) {
      console.error('Erro no login:', err);                             // log no console
      toast.error('Erro ao fazer login. Verifique seus dados.');        // mensagem pro usuário
    } finally {
      setIsLoading(false);                                              // desliga o loading sempre
    }
  };

  // =======================================================
  // 2) LOGIN COM GOOGLE (POPUP)
  // =======================================================
  const handleGoogleLogin = async () => {
    try {
      setIsLoadingGoogle(true);                                         // liga loading do botão Google

      // Abre o popup do Google usando o provider googleProvider
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;                                         // usuário retornado pelo Firebase

      const idToken = await user.getIdToken();                          // pega o ID token JWT
      dispatch(setToken(idToken));                                      // salva no Redux

      console.log('👤 Usuário logado pelo Google:', {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      });

      toast.success('Login com Google realizado com sucesso!');         // feedback
      navigate('/event-dashboard');                                     // redireciona
    } catch (err: any) {
      console.error('Erro no login com Google:', err);

      if (err?.code === 'auth/popup-closed-by-user') {                  // usuário fechou o popup
        toast.info('Login com Google cancelado.');
      } else {
        toast.error('Erro ao fazer login com Google.');
      }
    } finally {
      setIsLoadingGoogle(false);                                        // desliga loading
    }
  };

  const handleTwitterLogin = async () => {
  try {
    setIsLoadingTwitter(true); // liga loading só do botão do X

    // Abre popup do X/Twitter
    const result = await signInWithPopup(auth, twitterProvider);

    // Usuário logado retornado pelo Firebase
    const user = result.user;

    // Token JWT para mandar pro backend se quiser
    const idToken = await user.getIdToken();

    // Guarda o token no Redux, igual Google
    dispatch(setToken(idToken));

    console.log('🐦 Usuário logado pelo X/Twitter:', {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
    });

    toast.success('Login com X/Twitter realizado com sucesso!');
    navigate('/event-dashboard'); // manda pra onde você quiser
  } catch (err: any) {
    console.error('Erro no login com X/Twitter:', err);

    if (err?.code === 'auth/operation-not-allowed') {
      toast.error('Provedor X/Twitter não está habilitado no Firebase.');
    } else if (err?.code === 'auth/popup-closed-by-user') {
      toast.info('Login com X/Twitter cancelado.');
    } else {
      toast.error('Erro ao fazer login com X/Twitter.');
    }
  } finally {
    setIsLoadingTwitter(false); // desliga loading
  }
};

  // =======================================================
  // RENDERIZAÇÃO DA TELA
  // =======================================================
  return (
    
    <Container maxWidth="sm" sx={{ mt: 6 }}>                            {/* container centralizado */}
      <Paper sx={{ p: 4 }}>                                             {/* card de fundo */}
        <Typography variant="h4" gutterBottom align="center">
          Entrar
        </Typography>

        {/* FORMULARIO DE LOGIN TRADICIONAL */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="E-mail"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}                  // atualiza estado email
          />
          <TextField
            fullWidth
            label="Senha"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}              // atualiza estado senha
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isLoading || isLoadingGoogle || isLoadingTwitter}   // bloqueia se QUALQUER login estiver carregando
            sx={{ mt: 2 }}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
              size="small"
            />
          }
          label="Lembrar do e-mail"
        />

        {/* SEPARADOR */}
        <Divider sx={{ my: 2 }}>ou</Divider>

        {/* BOTÃO GOOGLE */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}                                     // ícone do Google
          onClick={handleGoogleLogin}
          disabled={isLoadingGoogle || isLoading || isLoadingTwitter}      // se algum loading, bloqueia
          sx={{ mb: 1 }}
        >
          {isLoadingGoogle ? 'Conectando ao Google...' : 'Entrar com Google'}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<XIcon />} 
          onClick={handleTwitterLogin}
          disabled={isLoadingTwitter || isLoading || isLoadingGoogle}
        >
          {isLoadingTwitter ? 'Conectando ao X...' : 'Entrar com X'}
        </Button>
      </Paper>
    </Container>
  );
};

export default LoginPageScreen;
