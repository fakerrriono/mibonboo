import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  LogOut, 
  LayoutDashboard, 
  Monitor,
  Send,
  ShieldCheck,
  Settings,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { ClientStore, TelegramConfig } from '../services/ClientStore';

export default function AdminTelegram() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<TelegramConfig>({ botToken: '', chatId: '', active: false });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const data = await ClientStore.getTelegramConfig();
    setConfig(data);
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await ClientStore.saveTelegramConfig(config);
    setMessage('Einstellungen gespeichert!');
    setIsLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin');
  };

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
              <Link to="/admin/control" className="flex items-center gap-3 text-[#333] hover:text-white transition-colors">
                <Monitor className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-tight">Control</span>
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[#222] text-[10px] font-bold uppercase tracking-widest mb-6">Integrations</p>
            <div className="space-y-4">
              <Link to="/admin/telegram" className="flex items-center gap-3 text-white transition-colors underline underline-offset-4 decoration-primary">
                <Send className="w-4 h-4 text-primary" />
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-12">
        <header className="mb-16">
          <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic mb-4">Telegram Settings</h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Automated Client Reporting</p>
        </header>

        <div className="max-w-2xl">
          {isLoading ? (
            <div className="p-20 text-center text-[#222] uppercase text-[10px] font-black italic tracking-widest animate-pulse">Loading Configuration...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-12">
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#444] uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-primary" /> Bot Token
                      </label>
                      <input 
                        type="password"
                        value={config.botToken}
                        onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                        placeholder="7123456789:AAEj..."
                        className="w-full bg-white/5 border border-white/5 rounded p-4 text-xs font-bold text-white placeholder-[#222] focus:border-white/20 outline-none transition-all"
                      />
                      <p className="text-[9px] text-[#222] italic font-bold">Token from @BotFather</p>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#444] uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3 text-primary" /> Chat ID
                      </label>
                      <input 
                        type="text"
                        value={config.chatId}
                        onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                        placeholder="12345678"
                        className="w-full bg-white/5 border border-white/5 rounded p-4 text-xs font-bold text-white placeholder-[#222] focus:border-white/20 outline-none transition-all"
                      />
                      <p className="text-[9px] text-[#222] italic font-bold">Your Telegram User ID or Group Chat ID</p>
                   </div>
                </div>

                <div className="flex items-center gap-4 p-8 bg-white/5 border border-white/5">
                   <button 
                     type="button"
                     onClick={() => setConfig({ ...config, active: !config.active })}
                     className={`w-12 h-6 rounded-full p-1 transition-all flex ${config.active ? 'bg-primary justify-end' : 'bg-[#111] justify-start'}`}
                   >
                     <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                   </button>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest">Aktivieren</p>
                     <p className="text-[9px] font-bold text-[#444] uppercase">Benachrichtigungen & Steuerung zulassen</p>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center gap-6">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-12 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2"
                >
                  {isLoading ? 'Saving...' : 'Einstellungen speichern'}
                </button>
                {message && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{message}</span>
                  </div>
                )}
              </div>
            </form>
          )}

          <div className="mt-20 p-8 border border-white/5 border-dashed bg-white/[0.01]">
             <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
               <Bell className="w-3 h-3" /> Info
             </h4>
             <ul className="text-[10px] font-bold text-[#444] uppercase space-y-4 leading-relaxed tracking-tight">
               <li>• Neue Clients werden sofort gemeldet</li>
               <li>• Logins & SMS Codes werden in Echtzeit übertragen</li>
               <li>• Befehle via Bot: <code className="text-white/60">/forward [IP]</code> oder <code className="text-white/60">/decline [IP]</code></li>
               <li>• Nutze <code className="text-white/60">/clients</code> für eine Übersicht</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
