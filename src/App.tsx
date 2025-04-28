import RouterApp from './router/Router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <RouterApp />
      <ToastContainer />
    </>
  );
}

export default App;
