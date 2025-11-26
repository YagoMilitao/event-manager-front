import React from 'react';
import { Link as RouterLink } from 'react-router-dom';        // links internos
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
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

import { formatHour, formatDatePt } from '../../utils/dateTimeFormat'; // formata data/hora
import EventBadge from '../../components/EventBadge';                  // chip bonitinho
import { useMyEventsViewModel } from '../../viewModels/useMyEventsViewModel'; // hook de lógica

const MyEventsPageScreen: React.FC = () => {
  // Puxa tudo do ViewModel (nada vem por props mais)
  const {
    events,
    visibleEvents,
    selectedEvents,
    loading,
    error,
    selectedIds,
    isAllSelected,
    canLoadMore,
    confirmOpen,
    deleting,
    handleToggleSelect,
    handleToggleSelectAll,
    handleOpenConfirm,
    handleCloseConfirm,
    handleConfirmDelete,
    handleLoadMore,
  } = useMyEventsViewModel();

  // 👉 loading state
  if (loading) {
    return (
      <Container
        sx={{
          mt: 4,
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

  // 👉 erro
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

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* Header + ações */}
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
          {events.length > 0 && (
            <>
              <EventBadge
                icon={<SelectAllIcon fontSize="small" />}
                label={isAllSelected ? 'Limpar seleção' : 'Selecionar todos'}
                color="info"
                clickable
                onClick={handleToggleSelectAll}
              />

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

      {/* Lista / cards */}
      {events.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          Você ainda não criou nenhum evento.{' '}
          <RouterLink to="/create-event">Crie um agora!</RouterLink>
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {visibleEvents.map((event) => {
            const isSelected = selectedIds.includes(event._id);  // se está marcado
            const dateLabel = formatDatePt(event.data as unknown as string); // formata data
            const horaInicioLabel = formatHour(event.horaInicio as any);    // hora início
            const horaFimLabel = formatHour(event.horaFim as any);          // hora fim

            let timeRangeLabel = '';                                        // intervalo de hora
            if (horaInicioLabel && horaFimLabel) {
              timeRangeLabel = `${horaInicioLabel} - ${horaFimLabel}`;
            } else if (horaInicioLabel) {
              timeRangeLabel = horaInicioLabel;
            }

            return (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <Card
                  sx={(theme) => ({
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: isSelected
                      ? `2px dashed ${theme.palette.error.main}`
                      : `1px solid ${theme.palette.divider}`,
                    opacity: isSelected ? 0.5 : 1,
                    backgroundColor: theme.palette.background.paper,
                    transition: 'all 0.2s ease',
                  })}
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
                      {event.titulo}
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

      {canLoadMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button variant="outlined" onClick={handleLoadMore}>
            Carregar mais
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default MyEventsPageScreen;
