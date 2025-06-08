import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import { JSX } from 'react/jsx-runtime';
import EventsPage from '../pages/events/MyEventsPageScreen';
import EventDetailsPage from '../pages/events/EventDetailsPage';
import UserEventDashboard from '../pages/events/UserEventDashboard';
import RegisterPage from '../pages/Logon/RegisterPage';
import CreateEventPage from '../pages/createEventPage/CreateEventPage';
import MyEventsPage from '../pages/events/MyEventsPage';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? children : <Navigate to="/login" />;
};

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage />
          } 
        />
        <Route 
          path="/login" 
          element={
            <LoginPage />
          } 
        />
        <Route 
          path="/register" 
          element={
            <RegisterPage />
          } 
        />
        <Route
          path="/event-dashboard"
          element={ 
            <PrivateRoute>
              <UserEventDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="my-events"
          element={
          <PrivateRoute>
            <MyEventsPage />
          </PrivateRoute>
          }
        />
        <Route 
          path="/create-event" 
          element={
            <PrivateRoute> 
              <CreateEventPage /> 
            </PrivateRoute>
          }
        />

        <Route
          path="/api/events/:id"
          element={
            <EventDetailsPage />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
