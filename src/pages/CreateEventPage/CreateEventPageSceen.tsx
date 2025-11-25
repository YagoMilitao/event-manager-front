import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import EventForm from '../../components/EventForm';
import EventFormSkeleton from '../../components/skeletons/EventFormSkeleton';
import { useCreateEventViewModel } from './CreateEventViewModel';

export default function CreateEventPageScreen() {
  const {
    form,
    handleChange,
    handleTimeChange,
    handleImageChange,
    handleOrganizerChange,
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleSubmit,
  } = useCreateEventViewModel();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/events`,
        );
        console.log('Eventos (teste skeleton):', response.data);
      } catch (error) {
        console.error('❌ Erro ao buscar eventos:', error);
        toast.error('Erro ao carregar eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <EventFormSkeleton />;
  }

  const handleSaveClick = async () => {
    await handleSubmit();
  };

  return (
    <EventForm
      mode="create"
      form={form}
      loading={false}
      onChange={handleChange}
      onTimeChange={handleTimeChange}
      onImageChange={handleImageChange}
      onOrganizerChange={handleOrganizerChange}
      onAddOrganizer={handleAddOrganizer}
      onRemoveOrganizer={handleRemoveOrganizer}
      onSubmit={handleSaveClick}
    />
  );
}
