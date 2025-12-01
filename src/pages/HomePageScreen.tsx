import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Paper,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import EventListSkeleton from '../components/skeletons/EventListSkeleton';
import { formatDatePt, formatHour } from '../utils/dateTimeFormat';
import { useHomePageViewModel } from '../viewModels/useHomePageViewModel';
import EventTable from '../components/EventTable';

const HomePageScreen: React.FC = () => {
  const {
    visibleEvents,
    loading,
    loadingMore,
    error,
    filters,
    canLoadMore,
    handleSearchChange,
    handleCityChange,
    handleDateChange,
    handlePriceChange,
    handleAttireChange,
    handleShowPastChange,
    handleSortChange,
    handleClearFilters,
    handleLoadMore,
  } = useHomePageViewModel();

  if (loading) {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Eventos
      </Typography>

      {/* Skeleton enquanto busca os eventos */}
      <EventListSkeleton rows={6} showActions={true} />

      {/* Texto indicando que está carregando (sabendo que o backend é lento mesmo) */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        Carregando eventos, isso pode levar alguns segundos...
      </Typography>
    </Container>
  );
}

  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          bgcolor: 'background.paper',
          py: 4,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/"
            sx={{ mt: 2 }}
          >
            Tentar novamente
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.paper',
        py: 4,
      }}
    >
      {/* Conteúdo centralizado */}
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Eventos
        </Typography>

        {/* FILTROS */}
        <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>

          <Grid container spacing={2}>
            {/* Linha 1: busca e cidade */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar por nome ou descrição"
                value={filters.searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Cidade / Local"
                value={filters.city}
                onChange={(e) => handleCityChange(e.target.value)}
                size="small"
              />
            </Grid>

            {/* Datas */}
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Data inicial"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.dateFrom}
                onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Data final"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.dateTo}
                onChange={(e) => handleDateChange('dateTo', e.target.value)}
                size="small"
              />
            </Grid>

            {/* Linha 2: preço e traje */}
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Preço mínimo"
                value={filters.priceMin}
                onChange={(e) => handlePriceChange('priceMin', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Preço máximo"
                value={filters.priceMax}
                onChange={(e) => handlePriceChange('priceMax', e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Traje"
                value={filters.attire}
                onChange={(e) => handleAttireChange(e.target.value)}
                size="small"
                placeholder="Livre, Esporte fino..."
              />
            </Grid>

            {/* Ordenação */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Ordenar por"
                value={filters.sortBy}
                onChange={(e) =>
                  handleSortChange(
                    e.target.value as 'nearest' | 'newest' | 'cheapest',
                  )
                }
                size="small"
              >
                <MenuItem value="nearest">Mais próximos (data)</MenuItem>
                <MenuItem value="newest">Mais recentes (criados)</MenuItem>
                <MenuItem value="cheapest">Mais baratos</MenuItem>
              </TextField>
            </Grid>

            {/* Mostrar passados + limpar */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.showPast}
                      onChange={(e) =>
                        handleShowPastChange(e.target.checked)
                      }
                    />
                  }
                  label="Incluir eventos mais antigos"
                />
                <Button
                  variant="text"
                  size="small"
                  onClick={handleClearFilters}
                >
                  Limpar filtros
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* LISTA DE EVENTOS */}
        {visibleEvents.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Nenhum evento encontrado com esses filtros.
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            <EventTable
              events={visibleEvents}                      // lista filtrada/paginada que você já tem
              showSelection={false}                      // na home não mostra checkbox
              detailsLinkBasePath="/api/events"          // rota base que você já usa
            />
          </Box>
        )}

        {canLoadMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              disabled={loadingMore}                // desabilita enquanto estiver carregando próxima página
            >
              {loadingMore ? 'Carregando...' : 'Carregar mais'}
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePageScreen;
