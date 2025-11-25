import React, { useState } from 'react';
import axios from 'axios';

const CreateEvent = () => {
  const [nome, setNome] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [traje, setTraje] = useState('');
  const [local, setLocal] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [images, setImages] = useState<FileList | null>(null);

  const handleCreateEvent = async () => {
    try {
      const token = localStorage.getItem('token'); 

      // 1. Cria o evento sem imagens
      const { data } = await axios.post(
        'http://localhost:3000/api/events',
        {
          nome, horaInicio, traje, local, preco, descricao
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const eventId = data._id;

      // 2. Faz upload das imagens
      if (images && images.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < images.length; i++) {
          formData.append('images', images[i]);
        }

        await axios.post(
          `http://localhost:3000/api/events/${eventId}/images`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      alert('Evento criado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar evento');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Criar Evento</h2>

      {/* Campos do formulário */}
      <input placeholder="Nome" onChange={(e) => setNome(e.target.value)} />
      <input placeholder="Hora (ex: 1900)" onChange={(e) => setHoraInicio(e.target.value)} />
      <input placeholder="Traje" onChange={(e) => setTraje(e.target.value)} />
      <input placeholder="Local" onChange={(e) => setLocal(e.target.value)} />
      <input placeholder="Preço" onChange={(e) => setPreco(e.target.value)} />
      <textarea placeholder="Descrição" onChange={(e) => setDescricao(e.target.value)} />

      {/* Upload de imagens */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages(e.target.files)}
      />

      <button onClick={handleCreateEvent}>Criar Evento</button>
    </div>
  );
};

export default CreateEvent;
