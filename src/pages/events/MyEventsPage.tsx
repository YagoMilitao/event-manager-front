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
import CreateEventPage from '../createEventPage/CreateEventPage';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';



export default function MyEventsPage() {
  const navigate = useNavigate()
  const handleCreateEvent = () => navigate('/create-event')
  const handleMyEvents = () => navigate('/my-event')
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Events
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleMyEvents}>
          My Events
        </Button>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCreateEvent}>
          Create Event
        </Button>
      </Box>
    </Container>
  );
}