export type EventFormData = {
    eventName: string;
    description: string;
    date: string;
    startTime: string;
    location: string;
    price?: number;
    dressCode?: string;
    image?: File | null;
    loading: boolean;
  }
  