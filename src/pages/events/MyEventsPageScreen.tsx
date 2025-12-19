import React from 'react';
import { Link as RouterLink } from 'react-router-dom';        // links internos
import {
  Container,
  Typography,
  Button,
  Alert,
  Box,
  Skeleton,
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

import {formatDatePt } from '../../utils/dateTimeFormat'; // formata data/hora
import EventBadge from '../../components/EventBadge';                  // chip bonitinho
import { useMyEventsViewModel } from '../../viewModels/useMyEventsViewModel'; // hook de lógica
import EventTable from '../../components/EventTable';

const MyEventsPageScreen: React.FC = () => {
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

      {events.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          Você ainda não criou nenhum evento.{' '}
          <RouterLink to="/create-event">Crie um agora!</RouterLink>
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          <EventTable
            events={visibleEvents}             // seus eventos paginados
            showSelection                      // ativa coluna de checkbox
            selectedIds={selectedIds}          // vem do ViewModel
            isAllSelected={isAllSelected}      // vem do ViewModel
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            detailsLinkBasePath="/api/events"  // detalhes
            showEdit                           // ativa botão de editar
            editLinkBasePath="/edit-event"     // rota de edição /edit-event/:id
          />
        </Box>
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
                    primary={e.eventName}
                    secondary={formatDatePt(e.date)}
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
