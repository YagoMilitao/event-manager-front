export interface Organizer {
  nome: string;
  email: string;
  whatsapp: string;
  instagram: string;
}

export interface CreateEventForm {
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  preco: string;           // string no form, convertemos antes de enviar
  traje: string;
  organizadores: Organizer[];
  images: File[];
}