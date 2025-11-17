import React from 'react';
import Chip from '@mui/material/Chip';
import { SxProps, Theme } from '@mui/material';

interface EventBadgeProps {
  icon?: React.ReactElement;
  label: string;
  color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  variant?: "filled" | "outlined";
  clickable?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export default function EventBadge({
  icon,
  label,
  color = "primary",
  variant = "outlined",
  clickable = false,
  onClick,
  sx = {},
}: EventBadgeProps) {
  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      variant={variant}
      clickable={clickable}
      onClick={onClick}
      sx={{
        borderRadius: "6px",
        fontWeight: 500,
        ...sx,
      }}
    />
  );
}
