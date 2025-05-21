import { useState } from 'react';
import {
  Container,
  TextField,
  Typography,
  Button,
  Box,
} from '@mui/material';
// import { useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import CreateEventPage from '../CreateEventPage/CreateEventPage';



export default function MyEventsPage() {
  

  return (
    <Container sx={{ mt: 4 }}>
      <Button><CreateEventPage /></Button>
    </Container>
  );
}