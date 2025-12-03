import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';                    // Navegação com Link
import { EventData } from '../data/EventData';                         // Tipo do evento
import { formatDatePt } from '../utils/dateTimeFormat';                // Função para formatar data

interface EventTableProps {
  events: EventData[];                         // Lista de eventos que a tabela vai renderizar

  // ---- Seleção (usado no MyEventsPage) ----
  showSelection?: boolean;                     // Se true, mostra coluna de checkbox
  selectedIds?: string[];                      // IDs selecionados
  isAllSelected?: boolean;                     // Se todos os eventos visíveis estão selecionados
  onToggleSelect?: (id: string) => void;       // Marca/desmarca UM evento
  onToggleSelectAll?: () => void;              // Marca/desmarca TODOS os eventos visíveis

  // ---- Ações / navegação ----
  detailsLinkBasePath?: string;                // Base do link de detalhes (ex: /api/events)
  showEdit?: boolean;                          // Se true, mostra botão "Editar"
  editLinkBasePath?: string;                   // Base do link de edição (ex: /edit-event)
}

const EventTable: React.FC<EventTableProps> = ({
  events,
  showSelection = false,
  selectedIds = [],
  isAllSelected,
  onToggleSelect,
  onToggleSelectAll,
  detailsLinkBasePath = '/api/events',
  showEdit = false,
  editLinkBasePath = '/edit-event',
}) => {
  const today = new Date();                    // Data atual para marcar eventos passados

  const hasEvents = events && events.length > 0;

  // Só habilita seleção se showSelection = true E onToggleSelect existir
  const selectionEnabled =
    showSelection && typeof onToggleSelect === 'function';

  return (
    <Box>
      {/* Se não tiver eventos, mostra mensagem e não renderiza tabela */}
      {!hasEvents ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Nenhum evento encontrado.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {/* Coluna de checkbox no header – só aparece se a seleção estiver habilitada */}
                {selectionEnabled && (
                  <TableCell padding="checkbox">
                    {onToggleSelectAll && typeof isAllSelected === 'boolean' && (
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={ 
                          selectedIds.length > 0 && !isAllSelected
                        }
                        onChange={() => onToggleSelectAll()}
                      />
                    )}
                  </TableCell>
                )}

                {/* Demais colunas fixas */}
                <TableCell>Data</TableCell>
                <TableCell>Nome do evento</TableCell>
                <TableCell>Local</TableCell>
                <TableCell>Traje</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell align="right">Ações</TableCell> 
              </TableRow>
            </TableHead>

            <TableBody>
              {events.map((event) => {
                const title =
                  event.eventName ||
                  'Sem título';

                // Converte data para Date pra comparar com hoje
                const eventDate = event.date
                  ? new Date(event.date)
                  : today;

                const isPast = eventDate < today;                  // já passou?

                const dateLabel = event.date
                  ? formatDatePt(event.date)
                  : '-';

                const priceLabel =
                  event.price && String(event.price).trim().length > 0
                    ? String(event.price)
                    : 'Gratuito';

                const isSelected = selectedIds.includes(event._id);

                return (
                  <TableRow
                    key={event._id}
                    sx={(theme) => ({
                      backgroundColor: isPast
                        ? theme.palette.action.hover
                        : 'inherit',
                      opacity: isPast ? 0.7 : 1,
                    })}
                  >
                    {/* Checkbox por linha (somente se seleção estiver habilitada) */}
                    {selectionEnabled && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() =>
                            onToggleSelect && onToggleSelect(event._id)
                          }
                          size="small"
                        />
                      </TableCell>
                    )}

                    {/* Data */}
                    <TableCell>{dateLabel}</TableCell>
                    {/* Nome */}
                    <TableCell>{title}</TableCell>
                    {/* Local */}
                    <TableCell>{event.location || '-'}</TableCell>
                    {/* Traje */}
                    <TableCell>{event.dressCode || '-'}</TableCell>
                    {/* Preço */}
                    <TableCell>{priceLabel}</TableCell>

                    {/* Ações: Ver detalhes + (opcional) Editar */}
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          component={RouterLink}
                          to={`${detailsLinkBasePath}/${event._id}`}
                        >
                          Ver detalhes
                        </Button>

                        {/* Botão de editar – só aparece se showEdit = true */}
                        {showEdit && (
                          <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            component={RouterLink}
                            to={`${editLinkBasePath}/${event._id}`}
                          >
                            Editar
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EventTable;
