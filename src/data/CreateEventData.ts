import { Organizer } from "./OrganizerData";

export interface ExistingImage {
  url: string;
  filename: string;
}

export interface CreateEventForm {
  eventName: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  price: string;
  dressCode: string;
  organizers: Organizer[];

  // Imagens novas selecionadas no front (ainda não foram para o servidor)
  images: File[];

  // URLs locais (ObjectURL) para mostrar thumbnails dessas imagens novas
  imagePreviews: string[];

  // Imagens que já existem no evento (só usado na edição)
  existingImages?: ExistingImage[];

  // Lista de filenames marcados para exclusão (UI de edição futura)
  imagesToDelete?: string[];
}
