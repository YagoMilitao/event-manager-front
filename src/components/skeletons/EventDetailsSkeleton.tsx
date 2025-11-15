import { Box } from '@mui/material';
import ThemedSkeleton from './ThemedSkeleton';

export default function EventDetailsSkeleton() {
  return (
    <Box sx={{ mt: 4 }}>
      {/* Título principal */}
      <ThemedSkeleton width="60%" height={32} />

      {/* Data / local */}
      <ThemedSkeleton width="40%" height={24} sx={{ mt: 2 }} />

      {/* Descrição (várias linhas) */}
      <ThemedSkeleton width="90%" height={18} sx={{ mt: 3 }} />
      <ThemedSkeleton width="95%" height={18} sx={{ mt: 1 }} />
      <ThemedSkeleton width="80%" height={18} sx={{ mt: 1 }} />
    </Box>
  );
}
