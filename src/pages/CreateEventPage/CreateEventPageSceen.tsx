import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import EventForm from '../../components/EventForm';
import EventFormSkeleton from '../../components/skeletons/EventFormSkeleton';
import { useCreateEventViewModel } from '../../viewModels/useCreateEventViewModel';

export default function CreateEventPageScreen() {
  const {
    form,
    handleChange,
    handleTimeChange,
    handleImageChange,
    handleRemoveImage,
    handleOrganizerChange,
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleSaveClick,
    handleAddressChange,
    handleFetchCep
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

  return (
    <EventForm
      mode="create"
      form={form}
      loading={false}
      onChange={handleChange}
      onTimeChange={handleTimeChange}
      onImageChange={handleImageChange}
      onRemoveImage={handleRemoveImage}
      onOrganizerChange={handleOrganizerChange}
      onAddOrganizer={handleAddOrganizer}
      onRemoveOrganizer={handleRemoveOrganizer}
      onSubmit={handleSaveClick}
      onAddressChange={handleAddressChange}
      onFetchCep={handleFetchCep}
    />
  );
}
