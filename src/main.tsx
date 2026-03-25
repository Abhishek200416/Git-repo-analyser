import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorProvider } from './components/GlobalErrorDisplay';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorProvider>
      <App />
    </ErrorProvider>
  </StrictMode>,
);
