import React from 'react';
import Chip from '@mui/material/Chip';
import { SxProps, Theme } from '@mui/material';

interface EventBadgeProps {
  icon?: React.ReactElement;
  label: string;
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  variant?: 'filled' | 'outlined';
  clickable?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export default function EventBadge({
  icon,
  label,
  color = 'primary',
  variant = 'outlined',
  clickable = false,
  disabled = false,
  onClick,
  sx = {},
}: EventBadgeProps) {
  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      variant={variant}
      clickable={clickable && !disabled}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      sx={{
        borderRadius: '6px',
        fontWeight: 500,
        ...(disabled && {
          opacity: 0.5,
          cursor: 'not-allowed',
        }),
        ...sx,
      }}
    />
  );
}
