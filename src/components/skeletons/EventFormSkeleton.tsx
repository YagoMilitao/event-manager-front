import { Box, Grid } from '@mui/material';
import ThemedSkeleton from './ThemedSkeleton';

export default function EventFormSkeleton() {
  return (
    <Box sx={{ mt: 4 }}>
      {/* Campo: título */}
      <Box sx={{ mb: 2 }}>
        <ThemedSkeleton width="20%" height={18} /> {/* label */}
        <ThemedSkeleton width="100%" height={40} sx={{ mt: 1 }} /> {/* input */}
      </Box>

      {/* Campo: data e hora (2 colunas, se você quiser manter grid) */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <ThemedSkeleton width="30%" height={18} />
          <ThemedSkeleton width="100%" height={40} sx={{ mt: 1 }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ThemedSkeleton width="30%" height={18} />
          <ThemedSkeleton width="100%" height={40} sx={{ mt: 1 }} />
        </Grid>
      </Grid>

      {/* Campo: local */}
      <Box sx={{ mb: 2 }}>
        <ThemedSkeleton width="25%" height={18} />
        <ThemedSkeleton width="100%" height={40} sx={{ mt: 1 }} />
      </Box>

      {/* Campo: descrição */}
      <Box sx={{ mb: 2 }}>
        <ThemedSkeleton width="25%" height={18} />
        <ThemedSkeleton width="100%" height={80} sx={{ mt: 1 }} />
      </Box>

      {/* Botão de salvar */}
      <Box sx={{ mt: 3 }}>
        <ThemedSkeleton width={140} height={40} />
      </Box>
    </Box>
  );
}
