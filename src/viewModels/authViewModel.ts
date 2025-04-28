import api from '../api/api'
import { toast } from 'react-toastify'

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password })
    const { token, user } = response.data
    return { token, user }
  } catch (error) {
    toast.error('Erro ao fazer login')
    throw error
  }
}
