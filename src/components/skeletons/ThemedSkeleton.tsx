import { Skeleton, SkeletonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// Skeleton com tema e animação "pulse" personalizada
const StyledSkeleton = styled(Skeleton)(({ theme }) => ({
  borderRadius: 8,
  // Cor de fundo muda automaticamente conforme o tema
  backgroundColor:
    theme.palette.mode === 'light'
      ? 'rgba(0, 0, 0, 0.06)'
      : 'rgba(255, 255, 255, 0.08)',

  // Esse ::after é usado pelo MUI quando a animação é "wave"
  '&::after': {
    background:
      theme.palette.mode === 'light'
        ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)',
  },

  // Suaviza um pouco a transição da animação "pulse"
  animationDuration: '1.1s',
}));

export default function ThemedSkeleton(props: SkeletonProps) {
  return <StyledSkeleton animation="pulse" {...props} />;
}
