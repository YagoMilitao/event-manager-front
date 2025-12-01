import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { JSX } from 'react/jsx-runtime';

import { RootState } from '../store/store';
import HomePageScreen from '../pages/HomePageScreen';
import LoginPage from '../pages/LoginPageScreen'
import EventDetailsPage from '../pages/events/EventDetailsPageScreen';
import UserEventDashboard from '../pages/events/UserEventDashboard';
import RegisterPage from '../pages/Logon/RegisterPage';
import MyEventsPage from '../pages/events/MyEventsPageScreen';
import CreateEventPageScreen from '../pages/CreateEventPage/CreateEventPageSceen';
import EditEventPageScreen from '../pages/EditEventPage/EditEventPageScreen';
import AppLayout from '../components/layout/AppLayout';
import LoginModal from '../components/auth/LoginModal'; // 👈 novo componente (vamos criar já já)

// PrivateRoute continua igual
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? children : <Navigate to="/login" />;
};

// Este componente fica **dentro** do BrowserRouter pra poder usar hooks do router
function AppRoutesWithModals() {
  // location atual
  const location = useLocation();

  // Se o navigate foi feito com state { backgroundLocation: ... }
  const state = location.state as { backgroundLocation?: Location };

  return (
    <>
      {/* Rotas "normais" – se tiver backgroundLocation, usamos ele;
          senão, usamos a location atual */}
      <Routes location={state?.backgroundLocation || location}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePageScreen />} />

          {/* /login como página normal (fallback para acesso direto) */}
          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/event-dashboard"
            element={
              <PrivateRoute>
                <UserEventDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-events"
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
                <CreateEventPageScreen />
              </PrivateRoute>
            }
          />

          <Route path="/api/events/:id" element={<EventDetailsPage />} />

          <Route
            path="/edit-event/:id"
            element={
              <PrivateRoute>
                <EditEventPageScreen />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>

      {/* Se tiver backgroundLocation → quer dizer que /login foi aberto como MODAL */}
      {state?.backgroundLocation && (
        <Routes>
          <Route path="/login" element={<LoginModal />} />
        </Routes>
      )}
    </>
  );
}

// Componente principal que envolve tudo no BrowserRouter
export default function RouterApp() {
  return (
    <BrowserRouter>
      <AppRoutesWithModals />
    </BrowserRouter>
  );
}
