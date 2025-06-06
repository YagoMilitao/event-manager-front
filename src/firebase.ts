import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

//Essas chaves vêm do seu console do Firebase (Configuração do projeto)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
// src/firebase.ts - APENAS PARA TESTE!

// const firebaseConfig = {
//   apiKey: "AIzaSyBPSBrxQJv-2Hkcra9-t6rteF6Za78wET0", // Valor direto
//   authDomain: "gerenciamento-eventos.firebaseapp.com", // Valor direto
//   projectId: "gerenciamento-eventos", // Valor direto
//   storageBucket: "gerenciamento-eventos.firebasestorage.app",
//   messagingSenderId: "442197069319",
//   appId: "1:442197069319:web:6aeef4bcb9415cd408a4a2"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);