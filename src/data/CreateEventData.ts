import { Organizer } from "./OrganizerData";

export interface ExistingImage {
  url: string;
  filename: string;
}
export interface AddressForm {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface CreateEventForm {
  eventName: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  address: AddressForm;
  locationLabel: string;
  geo?: GeoPoint;
  price: string;
  dressCode: string;
  organizers: Organizer[];
  images: File[];
  imagePreviews: string[];
  existingImages?: ExistingImage[];
  imagesToDelete?: string[];
}
