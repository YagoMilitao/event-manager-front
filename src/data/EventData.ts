import { Organizer } from "./OrganizerData"

export type EventData = {
  _id: string;
  eventName: string;
  description: string;
  date: string;
  startTime: string;
  endTime?: string;
  dressCode?: string;
  location: string;
  image?: string;
  price?: string;
  coverImage?: EventImage | null;
  images?: EventImage[];
  organizers?: Organizer[];
 }

 

 export type EventImage = {
  url: string;        // URL pública que o front pode usar no <img src="...">
  filename: string;   // nome do arquivo dentro do bucket (caso precise deletar / atualizar depois)
};