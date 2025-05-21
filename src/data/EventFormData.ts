export type EventFormData = {
    titulo: string;
    descricao: string;
    data: string;
    horaInicio: string;
    local: string;
    preco?: number;
    traje?: string;
    image?: File | null;
    loading: boolean;
  }
  