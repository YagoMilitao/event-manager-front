export type EventData = {
  _id: string
  titulo: string
  descricao: string
  data: string
  horaInicio: string
  horaFim?: string
  traje?: string
  local: string
  image?: string
  preco?: string
  organizadores?:Organizadores[]
 }

 export type Organizadores ={
  _id: string
  nome: string
  email?: string
  whatsapp?: string
  facebook?: string
  instagram?: string
  twitter?: string
 }