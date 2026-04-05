import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import ChatPage from '@/pages/ChatPage';

function NotFound() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#03030d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(167,139,250,0.3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>404</p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, margin: '6px 0 0' }}>Page not found</p>
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
            background: 'rgba(10,8,28,0.95)',
            color: '#fff',
            border: '1px solid rgba(139,92,246,0.25)',
            fontSize: 13,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backdropFilter: 'blur(24px)',
            borderRadius: 14,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 16px rgba(109,40,217,0.15)',
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
