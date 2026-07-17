
/* // ......................main.tsx file ............................. */
import { createRoot } from 'react-dom/client'
import "react-toastify/dist/ReactToastify.css";
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(

    // <App />
    <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>

)
