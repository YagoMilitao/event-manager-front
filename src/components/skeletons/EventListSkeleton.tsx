import { List, ListItem, Box } from '@mui/material';
import ThemedSkeleton from './ThemedSkeleton';

interface EventListSkeletonProps {
  rows?: number;
  showActions?: boolean; 
}

export default function EventListSkeleton({
  rows = 6,
  showActions = true,
}: EventListSkeletonProps) {
  return (
    <List>
      {Array.from({ length: rows }).map((_, idx) => (
        <ListItem
          key={idx}
          sx={{
            borderBottom: '1px solid #ccc',
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ width: '80%' }}>
            {/* título */}
            <ThemedSkeleton width="50%" height={24} />

            {/* data + local */}
            <ThemedSkeleton width="70%" height={18} sx={{ mt: 1 }} />
          </Box>

          {/* "Ver detalhes" */}
          {showActions && <ThemedSkeleton width={90} height={18} />}
        </ListItem>
      ))}
    </List>
  );
}
