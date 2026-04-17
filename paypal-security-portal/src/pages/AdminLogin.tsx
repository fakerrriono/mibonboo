import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ADMIN_CONFIG } from '../config/admin';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
      localStorage.setItem('isAdminAuthenticated', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid Credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 font-mono">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-[360px] border border-white/10 p-12 bg-black"
      >
        <div className="text-center mb-16">
          <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">917 PANELS</h1>
          <p className="text-[#222] text-[9px] font-bold uppercase tracking-[0.3em] mt-2 italic">Terminal Access v1.0.0</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-[#222] uppercase tracking-widest pl-1">Login</p>
            <input 
              type="text" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-white/5 text-white px-5 py-4 focus:border-white/20 focus:outline-none transition-all placeholder-[#111] font-bold text-xs uppercase"
            />
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-bold text-[#222] uppercase tracking-widest pl-1">Security Key</p>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/5 text-white px-5 py-4 focus:border-white/20 focus:outline-none transition-all placeholder-[#111] font-bold text-xs"
            />
          </div>

          {error && <p className="text-red-900 text-[9px] font-black uppercase text-center tracking-widest">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-white text-black font-black py-5 hover:bg-neutral-200 transition-all uppercase text-[10px] tracking-[0.3em]"
          >
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
}
