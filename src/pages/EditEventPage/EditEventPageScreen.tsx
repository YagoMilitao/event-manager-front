import EventForm from '../../components/EventForm';
import EventFormSkeleton from '../../components/skeletons/EventFormSkeleton';
import { useEditEventViewModel } from '../../viewModels/editEventViewModel';

export default function EditEventPageScreen() {
  const {
    form,
    loading,
    saving,
    handleChange,
    handleTimeChange,
    handleImageChange,
    handleOrganizerChange,
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleSubmit,
  } = useEditEventViewModel();

  if (loading) {
    return <EventFormSkeleton />;
  }

  const handleUpdateClick = () => {
     handleSubmit();
  };

  return (
    <EventForm
      mode="edit"
      form={form}
      loading={saving}
      onChange={handleChange}
      onTimeChange={handleTimeChange}
      onImageChange={handleImageChange}
      onOrganizerChange={handleOrganizerChange}
      onAddOrganizer={handleAddOrganizer}
      onRemoveOrganizer={handleRemoveOrganizer}
      onSubmit={handleUpdateClick}
    />
  );
}
