import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  // Verifica se o token existe (usuário autenticado)
  const token = localStorage.getItem('token')

  // Se não tiver token, redireciona para login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Se estiver logado, permite acessar a rota protegida
  return <>{children}</>
}
