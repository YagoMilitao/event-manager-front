import React, { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  AppBar,
  Toolbar,
  Box,
  Skeleton,
  Grid,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SelectAllIcon from '@mui/icons-material/SelectAll';

import { EventData } from '../../data/EventData';
import { formatHour, formatDatePt } from '../../utils/dateTimeFormat';
import EventBadge from '../../components/EventBadge';

interface MyEventsPageScreenProps {
  events: EventData[];
  loading: boolean;
  error: string | null;
  onLogout: () => void;
  onDeleteSelected: (ids: string[]) => Promise<void>;
}

const MyEventsPageScreen: React.FC<MyEventsPageScreenProps> = ({
  events,
  loading,
  error,
  onLogout,
  onDeleteSelected,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const allIds = useMemo(() => events.map((e) => e._id), [events]);
  const isAllSelected =
    allIds.length > 0 && selectedIds.length === allIds.length;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === allIds.length ? [] : allIds));
  };

  const handleOpenConfirm = () => {
    if (!selectedIds.length) return;
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (deleting) return;
    setConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIds.length) return;
    try {
      setDeleting(true);
      await onDeleteSelected(selectedIds);
      setSelectedIds([]);
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="100%"
          height={200}
        />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          component={RouterLink}
          to="/"
          sx={{ mt: 2 }}
        >
          Voltar para a Home
        </Button>
      </Container>
    );
  }

  const selectedEvents = events.filter((e) => selectedIds.includes(e._id));

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          Meus Eventos
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Selecionar todos */}
          {events.length > 0 && (
            <>
              <EventBadge
                icon={<SelectAllIcon fontSize="small" />}
                label={isAllSelected ? 'Limpar seleção' : 'Selecionar todos'}
                color="info"
                clickable
                onClick={handleToggleSelectAll}
              />

              {/* Lixeira - só ativa se tiver algo selecionado */}
              <EventBadge
                icon={<DeleteOutlineIcon fontSize="small" />}
                label={
                  selectedIds.length
                    ? `Excluir (${selectedIds.length})`
                    : 'Excluir'
                }
                color="error"
                clickable={!!selectedIds.length}
                disabled={!selectedIds.length}
                onClick={handleOpenConfirm}
                sx={{ ml: 1 }}
              />
            </>
          )}
        </Box>
      </Box>

      {events.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          Você ainda não criou nenhum evento.{' '}
          <RouterLink to="/create-event">Crie um agora!</RouterLink>
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => {
            const isSelected = selectedIds.includes(event._id);
            const dateLabel = formatDatePt(event.data as unknown as string);
            const horaInicioLabel = formatHour(event.horaInicio as any);
            const horaFimLabel = formatHour(event.horaFim as any);

            let timeRangeLabel = '';
            if (horaInicioLabel && horaFimLabel) {
              timeRangeLabel = `${horaInicioLabel} - ${horaFimLabel}`;
            } else if (horaInicioLabel) {
              timeRangeLabel = horaInicioLabel;
            }

            return (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: isSelected
                      ? '2px dashed #f44336'
                      : '1px solid #e0e0e0',
                    opacity: isSelected ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Checkbox no topo esquerdo */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 2,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: '50%',
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleSelect(event._id)}
                      size="small"
                    />
                  </Box>

                  {event.image && (
                    <Box
                      component="img"
                      src={event.image}
                      alt={event.titulo}
                      sx={{
                        height: 180,
                        width: '100%',
                        objectFit: 'cover',
                        borderBottom: '1px solid #e0e0e0',
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {event.titulo || event.descricao}
                    </Typography>

                    {event.descricao && (
                      <Typography variant="body2" color="text.secondary">
                        {event.descricao.length > 100
                          ? `${event.descricao.substring(0, 100)}...`
                          : event.descricao}
                      </Typography>
                    )}

                    {(dateLabel || timeRangeLabel) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {dateLabel}
                        {timeRangeLabel && ` às ${timeRangeLabel}`}
                      </Typography>
                    )}

                    {event.local && (
                      <Typography variant="body2" color="text.secondary">
                        Local: {event.local}
                      </Typography>
                    )}

                    {event.traje && (
                      <Typography variant="body2" color="text.secondary">
                        Traje: {event.traje}
                      </Typography>
                    )}

                    {event.preco && (
                      <Typography variant="body2" color="text.secondary">
                        Preço: {event.preco}
                      </Typography>
                    )}

                    {event.organizadores &&
                      event.organizadores.length > 0 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Organizadores:{' '}
                          {event.organizadores
                            .map((org) => org.nome)
                            .join(', ')}
                        </Typography>
                      )}
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      component={RouterLink}
                      to={`/api/events/${event._id}`}
                    >
                      Ver Detalhes
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      component={RouterLink}
                      to={`/edit-event/${event._id}`}
                    >
                      Editar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      <Dialog open={confirmOpen} onClose={handleCloseConfirm} fullWidth>
        <DialogTitle>
          Confirmar exclusão de {selectedIds.length} evento(s)?
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvents.length > 0 ? (
            <List dense>
              {selectedEvents.map((e) => (
                <ListItem key={e._id}>
                  <ListItemText
                    primary={e.titulo}
                    secondary={formatDatePt(e.data as unknown as string)}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2">
              Nenhum evento selecionado.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting || !selectedIds.length}
          >
            {deleting ? 'Excluindo...' : 'Confirmar exclusão'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyEventsPageScreen;
