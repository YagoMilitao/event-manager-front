/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
    Container,
    TextField,
    Typography,
    Button,
    Box,
} from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const initialOrganizer = { nome: '', email: '', whatsapp: '', instagram: 'https://www.instagram.com/' };

export default function CreateEventPage() {
    const token = useAppSelector((state) => state.auth.token);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        titulo: '',
        descricao: '',
        data: '',
        horaInicio: '',
        horaFim: '',
        local: '',
        preco: 0,
        traje: '',
        organizadores: [initialOrganizer],
        image: null as File | null,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;

        if (name === 'image' && files) {
            setForm({ ...form, image: files[0] });
        } else if (name === 'horaInicio') {
            const formattedTime = value.replace(':', '');
            setForm({ ...form, [name]: formattedTime });
        } else {
            setForm({ ...form, [name]: value });
        }
    }

    const handleOrganizerChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number,
        field: string
    ) => {
        const updatedOrganizers = [...form.organizadores];
        updatedOrganizers[index] = {
            ...updatedOrganizers[index],
            [field]: e.target.value,
        };
        setForm({ ...form, organizadores: updatedOrganizers });
    };

    const handleAddOrganizer = () => {
        setForm({ ...form, organizadores: [...form.organizadores, initialOrganizer] });
    };

    const handleRemoveOrganizer = (index: number) => {
        if (form.organizadores.length > 1) {
            const updatedOrganizers = [...form.organizadores];
            updatedOrganizers.splice(index, 1);
            setForm({ ...form, organizadores: updatedOrganizers });
        }
    }

    const handleMain = () => {
        navigate('/');
    }

    const handleSubmit = async () => {
        if (!token) {
            toast.error('Você precisa estar logado para criar um evento');
            return;
        }

        const eventData = {
            titulo: form.titulo,
            descricao: form.descricao,
            data: form.data,
            horaInicio: form.horaInicio,
            horaFim: form.horaFim,
            local: form.local,
            preco: String(form.preco) || '0',
            traje: form.traje,
            organizadores: form.organizadores,
        };

        try {
            await axios.post(
                form.image
                    ? `${import.meta.env.VITE_API_URL}/api/events/create-with-images`
                    : `${import.meta.env.VITE_API_URL}/api/events/create-event`,
                form.image ? (() => {
                    const formData = new FormData();
                    Object.entries(form).forEach(([key, value]) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formData.append(key, value as any); // Use 'any' para evitar erro de tipo com File
                    });
                    formData.append('organizadores', JSON.stringify(form.organizadores));
                    formData.append('preco', String(form.preco) || '0');
                    return formData;
                })() : eventData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...(form.image ? {} : { 'Content-Type': 'application/json' }), // deixe o navegador definir multipart boundary quando houver imagem
                        //'Content-Type': form.image ? 'multipart/form-data' : 'application/json', // ✅ Define o Content-Type como application/json se não houver imagem
                    },
                }
            );
            toast.success('Evento criado com sucesso!');
            navigate('/eventos');
        } catch (err: unknown) {
            console.error('Erro ao criar evento:', err);
             if (axios.isAxiosError(err)) {
                    const axiosErr = err;
                    const status = axiosErr.response?.status;
                    const url = axiosErr.config?.url;
                    const responseData = axiosErr.response?.data;

                    console.error('Detalhes do AxiosError:', {
                        message: axiosErr.message,
                        status,
                        url,
                        responseData,
                        request: axiosErr.request,
                    });

                    // extrai mensagem amigável para o usuário
                    let userMessage = 'Erro ao criar evento';
                    if (responseData) {
                        if (typeof responseData === 'string') {
                            userMessage = responseData;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } else if ((responseData as any).message) {
                            userMessage = (responseData as any).message;
                        } else {
                            try {
                                userMessage = JSON.stringify(responseData);
                            } catch {
                                userMessage = axiosErr.message;
                            }
                        }
                    } else {
                        userMessage = axiosErr.message || userMessage;
                    }
                    toast.error(userMessage);
            } else if (err instanceof Error) {
                    // outros erros JS
                    console.error('Erro não-Axios:', err);
                    toast.error(err.message);
                } else {
                    toast.error('Erro ao criar evento');
                }
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Criar Evento
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="Título" name="titulo" value={form.titulo} onChange={handleChange} fullWidth required />
                <TextField label="Descrição" name="descricao" value={form.descricao} onChange={handleChange} multiline rows={4} />
                <TextField label="Data" type="date" name="data" value={form.data} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
                <TextField label="Hora de Início (HHMM)" name="horaInicio" value={form.horaInicio} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
                <TextField label="Hora de Fim (HHMM)" type="time" name="horaFim" value={form.horaFim} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                <TextField label="Local" name="local" value={form.local} onChange={handleChange} required />
                <TextField label="Preço (opcional)" name="preco" value={form.preco} onChange={handleChange} />
                <TextField label="Traje (opcional)" name="traje" value={form.traje} onChange={handleChange} />

                <Typography variant="h6" mt={2}>Organizadores</Typography>
                {form.organizadores.map((organizador, index) => (
                    <Box key={index} sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 1, mt: 1 }}>
                        <Typography variant="subtitle1">Organizador {index + 1}</Typography>
                        <TextField
                            label="Nome"
                            value={organizador.nome}
                            onChange={(e) => handleOrganizerChange(e, index, 'nome')}
                            required
                            fullWidth
                            sx={{ mt: 1 }}
                        />
                        <TextField
                            label="Email"
                            value={organizador.email}
                            onChange={(e) => handleOrganizerChange(e, index, 'email')}
                            fullWidth
                            sx={{ mt: 1 }}
                        />
                        <TextField
                            label="WhatsApp"
                            value={organizador.whatsapp}
                            onChange={(e) => handleOrganizerChange(e, index, 'whatsapp')}
                            fullWidth
                            sx={{ mt: 1 }}
                        />
                        <TextField
                            label="Instagram"
                            value={organizador.instagram}
                            onChange={(e) => handleOrganizerChange(e, index, 'instagram')}
                            fullWidth
                            sx={{ mt: 1 }}
                        />
                        {form.organizadores.length > 1 && (
                            <Button onClick={() => handleRemoveOrganizer(index)} color="error" sx={{ mt: 1 }}>Remover</Button>
                        )}
                    </Box>
                ))}
                <Button onClick={handleAddOrganizer} sx={{ mt: 2 }}>Adicionar Organizador</Button>
                <input type="file" name="image" accept="image/*" onChange={handleChange} />
                <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
                    Salvar
                </Button>
                <Button variant="outlined" onClick={handleMain} sx={{ mt: 2 }}>
                    Home
                </Button>
            </Box>
        </Container>
    );
}