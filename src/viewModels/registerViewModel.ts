import { useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export function useRegisterViewModel() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', loading: false })
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForm((prev) => ({ ...prev, loading: true }))

    try {
      await createUserWithEmailAndPassword(auth, form.email, form.password)
      toast.success('Conta criada com sucesso!')
      navigate('/login')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Erro ao criar conta:', error)
      toast.error('Erro ao criar conta. Verifique suas credenciais.')
    } finally {
      setForm((prev) => ({ ...prev, loading: false }))
    }
  }

  return {
    form,
    handleChange,
    handleSubmit,
  }
}
