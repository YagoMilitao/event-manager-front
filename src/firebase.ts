import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, browserSessionPersistence, getAuth, GoogleAuthProvider, setPersistence, TwitterAuthProvider  } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// 🔥 Inicializa o app Firebase do FRONT (React)
const app = initializeApp(firebaseConfig);      // Cria a instância do app client-side

// 🔐 Pega o "auth" usado no front (login, logout, etc)
export const auth = getAuth(app);               // Hook principal para Auth no cliente

// Função helper pra configurar persistence baseado em "lembrar login"
export async function setAuthPersistence(remember: boolean) {
  await setPersistence(
    auth,
    remember ? browserLocalPersistence : browserSessionPersistence
  );
}

// 🟢 Provider do Google — é ele que o signInWithPopup usa
export const googleProvider = new GoogleAuthProvider(); // Configura o provider Google

// (Opcional) sempre mostrar seleção de conta, mesmo se já logado no navegador
googleProvider.setCustomParameters({
  prompt: 'select_account',                     // Força mostrar as contas sempre
});

export const twitterProvider = new TwitterAuthProvider();
// Você pode opcionalmente pedir email:
twitterProvider.setCustomParameters({
  lang: 'pt',          // interface em pt
  // 'force_login': 'true' // se quiser SEMPRE forçar escolher conta
});
