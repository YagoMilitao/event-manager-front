import EventForm from '../../components/EventForm';
import EventFormSkeleton from '../../components/skeletons/EventFormSkeleton';
import { useEditEventViewModel } from '../../viewModels/useEditEventViewModel';

export default function EditEventPageScreen() {
  const {
    form,
    loading,
    saving,
    handleChange,
    handleTimeChange,
    handleImageChange,
    handleRemoveImage,
    handleOrganizerChange,
    handleAddOrganizer,
    handleRemoveOrganizer,
    handleUpdateClick,
    handleToggleExistingImage,
    handleAddressChange,
    handleFetchCep
  } = useEditEventViewModel();

  if (loading) {
    return <EventFormSkeleton />;
  }

  return (
    <EventForm
      mode="edit"
      form={form}
      loading={saving}
      onChange={handleChange}
      onTimeChange={handleTimeChange}
      onImageChange={handleImageChange}
      onRemoveImage={handleRemoveImage}
      onToggleExistingImage={handleToggleExistingImage}
      onOrganizerChange={handleOrganizerChange}
      onAddOrganizer={handleAddOrganizer}
      onRemoveOrganizer={handleRemoveOrganizer}
      onSubmit={handleUpdateClick}
      onAddressChange={handleAddressChange}
      onFetchCep={handleFetchCep}
    />
  );
}
