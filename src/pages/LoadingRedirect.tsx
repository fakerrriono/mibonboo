import React, { useEffect } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoadingRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show the loading page for exactly 5 seconds
    const destination = location.state?.next || '/login-email';
    const timer = setTimeout(() => {
      navigate(destination); 
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, location.state]);

  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut"
  };

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-12 flex items-center justify-center min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-app-border shadow-2xl p-8 md:p-12 text-center w-full"
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="bg-green-50 p-4 rounded-full"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-text-main mb-4 tracking-tight">
          Daten werden gesichert
        </h1>
        
        <p className="text-text-muted text-[15px] leading-relaxed mb-10">
          Ihre Anfrage wird verarbeitet. Bitte schließen Sie dieses Fenster nicht, während wir eine sichere Verbindung zu unseren Servern herstellen.
        </p>

        {/* Loading Dots */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex gap-2">
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ ...dotTransition, delay: 0 }}
              className="w-2.5 h-2.5 bg-primary rounded-full"
            />
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ ...dotTransition, delay: 0.2 }}
              className="w-2.5 h-2.5 bg-primary rounded-full"
            />
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ ...dotTransition, delay: 0.4 }}
              className="w-2.5 h-2.5 bg-primary rounded-full"
            />
          </div>
          <p className="text-[12px] font-medium text-primary animate-pulse uppercase tracking-widest">
            Sie werden jetzt weitergeleitet
          </p>
        </div>

        {/* Security Info */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted">
            <Lock className="w-3 h-3" />
            End-to-End verschlüsselte Übertragung
          </div>
        </div>
      </motion.div>
    </div>
  );
}
