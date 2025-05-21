import { useState } from 'react'
import { CreateEventForm } from '../../data/CreateEventData'
import api from '../../api/api'
import { toast } from 'react-toastify'

export function useCreateEventViewModel() {
  const [form, setForm] = useState<CreateEventForm>({
    titulo: '',
    descricao: '',
    data: '',
    horaInicio: '',
    local: '',
    image: null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setForm((prev) => ({
      ...prev,
      image: file,
    }))
  }

  const handleSubmit = async () => {
    try {
      const formData = new FormData()
      for (const key in form) {
        const value = (form as any)[key]
        if (value) {
          formData.append(key, value)
        }
      }

      await api.post('/events', formData)
      toast.success('Evento criado com sucesso')
      setForm({
        titulo: '',
        descricao: '',
        data: '',
        horaInicio: '',
        local: '',
        image: null,
      })
    } catch (error) {
      console.error('Erro ao criar evento', error)
      toast.error('Erro ao criar evento')
    }
  }

  return {
    form,
    handleChange,
    handleImageChange,
    handleSubmit
  }
}
