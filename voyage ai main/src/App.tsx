import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import ChatPage from '@/pages/ChatPage';

function NotFound() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#04040f' }}>
      <div className="text-center space-y-2">
        <p className="text-white/15 text-[11px] uppercase tracking-widest font-medium">404</p>
        <p className="text-white/40 text-[15px]">Page not found</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 30, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '13px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
