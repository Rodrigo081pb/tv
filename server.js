const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const SSDP = require('node-ssdp').Client;
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Armazena TVs descobertas
let discoveredTVs = [];
let connectedTV = null;
let tvController = null;

// Configurações de TVs conhecidas
const TV_BRANDS = {
  SAMSUNG: 'samsung',
  LG: 'lg',
  SONY: 'sony',
  PHILIPS: 'philips',
  GENERIC: 'generic'
};

// Descobrir TVs na rede usando SSDP
function discoverTVs() {
  console.log('?? Procurando TVs na rede...');
  discoveredTVs = [];
  
  const client = new SSDP();
  
  client.on('response', (headers, statusCode, info) => {
    if (headers.ST && (
      headers.ST.includes('dial') || 
      headers.ST.includes('dms') ||
      headers.ST.includes('MediaRenderer')
    )) {
      const tv = {
        ip: info.address,
        name: headers.SERVER || headers.USN || 'TV Desconhecida',
        location: headers.LOCATION,
        brand: detectBrand(headers)
      };
      
      if (!discoveredTVs.find(t => t.ip === tv.ip)) {
        discoveredTVs.push(tv);
        console.log(`?? TV encontrada: ${tv.name} (${tv.ip}) - ${tv.brand}`);
        broadcastToClients({ type: 'tv_found', tv });
      }
    }
  });

  client.search('ssdp:all');
  
  setTimeout(() => {
    client.stop();
    console.log(`? Busca concluída. ${discoveredTVs.length} TV(s) encontrada(s)`);
  }, 5000);
}

// Detectar marca da TV
function detectBrand(headers) {
  const str = JSON.stringify(headers).toLowerCase();
  if (str.includes('samsung')) return TV_BRANDS.SAMSUNG;
  if (str.includes('lg') || str.includes('webos')) return TV_BRANDS.LG;
  if (str.includes('sony')) return TV_BRANDS.SONY;
  if (str.includes('philips')) return TV_BRANDS.PHILIPS;
  return TV_BRANDS.GENERIC;
}

// Conectar na TV
async function connectToTV(ip, brand) {
  try {
    console.log(`?? Conectando na TV ${ip} (${brand})...`);
    
    if (brand === TV_BRANDS.SAMSUNG) {
      const SamsungTV = require('samsung-tv-control').default;
      tvController = new SamsungTV({
        ip: ip,
        mac: '00:00:00:00:00:00',
        name: 'WebRemote',
        port: 8002,
        token: ''
      });
      
      await tvController.isAvailable();
      connectedTV = { ip, brand };
      console.log('? Conectado na Samsung TV!');
      return { success: true, message: 'Conectado na Samsung TV' };
      
    } else if (brand === TV_BRANDS.LG) {
      const lgtv = require('lgtv2');
      
      return new Promise((resolve, reject) => {
        tvController = lgtv({
          url: `ws://${ip}:3000`
        });
        
        tvController.on('connect', () => {
          connectedTV = { ip, brand };
          console.log('? Conectado na LG TV!');
          resolve({ success: true, message: 'Conectado na LG TV' });
        });
        
        tvController.on('error', (err) => {
          console.error('? Erro ao conectar:', err.message);
          reject({ success: false, message: err.message });
        });
      });
      
    } else {
      // Conexão genérica (pode implementar mais protocolos)
      connectedTV = { ip, brand };
      console.log('?? Conectado em modo genérico (funcionalidade limitada)');
      return { success: true, message: 'Conectado em modo genérico', limited: true };
    }
    
  } catch (error) {
    console.error('? Erro ao conectar:', error.message);
    return { success: false, message: error.message };
  }
}

// Enviar comando para TV
async function sendCommand(command, value = null) {
  if (!connectedTV) {
    return { success: false, message: 'Nenhuma TV conectada' };
  }
  
  try {
    console.log(`?? Enviando comando: ${command}${value ? ` (${value})` : ''}`);
    
    if (connectedTV.brand === TV_BRANDS.SAMSUNG) {
      await sendSamsungCommand(command, value);
    } else if (connectedTV.brand === TV_BRANDS.LG) {
      await sendLGCommand(command, value);
    } else {
      console.log('?? Comando não suportado em modo genérico');
      return { success: false, message: 'Comando não suportado' };
    }
    
    return { success: true, message: 'Comando enviado' };
    
  } catch (error) {
    console.error('? Erro ao enviar comando:', error.message);
    return { success: false, message: error.message };
  }
}

// Comandos Samsung
async function sendSamsungCommand(command, value) {
  const keyMap = {
    'power': 'KEY_POWER',
    'volume_up': 'KEY_VOLUP',
    'volume_down': 'KEY_VOLDOWN',
    'mute': 'KEY_MUTE',
    'channel_up': 'KEY_CHUP',
    'channel_down': 'KEY_CHDOWN',
    'up': 'KEY_UP',
    'down': 'KEY_DOWN',
    'left': 'KEY_LEFT',
    'right': 'KEY_RIGHT',
    'enter': 'KEY_ENTER',
    'back': 'KEY_RETURN',
    'home': 'KEY_HOME',
    'menu': 'KEY_MENU',
    'source': 'KEY_SOURCE',
    '0': 'KEY_0', '1': 'KEY_1', '2': 'KEY_2', '3': 'KEY_3', '4': 'KEY_4',
    '5': 'KEY_5', '6': 'KEY_6', '7': 'KEY_7', '8': 'KEY_8', '9': 'KEY_9'
  };
  
  const key = keyMap[command];
  if (key && tvController) {
    await tvController.sendKey(key);
  }
}

// Comandos LG
async function sendLGCommand(command, value) {
  if (!tvController) return;
  
  const commandMap = {
    'power': () => tvController.request('ssap://system/turnOff'),
    'volume_up': () => tvController.request('ssap://audio/volumeUp'),
    'volume_down': () => tvController.request('ssap://audio/volumeDown'),
    'mute': () => tvController.request('ssap://audio/setMute', { mute: true }),
    'channel_up': () => tvController.request('ssap://tv/channelUp'),
    'channel_down': () => tvController.request('ssap://tv/channelDown'),
    'up': () => tvController.request('ssap://com.webos.service.ime/sendEnterKey'),
    'enter': () => tvController.request('ssap://com.webos.service.ime/sendEnterKey'),
    'home': () => tvController.request('ssap://system.launcher/launch', { id: 'com.webos.app.home' })
  };
  
  const action = commandMap[command];
  if (action) {
    await action();
  }
}

// WebSocket para atualizações em tempo real
wss.on('connection', (ws) => {
  console.log('?? Cliente conectado via WebSocket');
  
  ws.send(JSON.stringify({
    type: 'connected',
    tvs: discoveredTVs,
    connectedTV: connectedTV
  }));
  
  ws.on('close', () => {
    console.log('?? Cliente desconectado');
  });
});

// Broadcast para todos os clientes conectados
function broadcastToClients(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Rotas da API
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/discover', (req, res) => {
  discoverTVs();
  res.json({ message: 'Buscando TVs na rede...', tvs: discoveredTVs });
});

app.get('/api/tvs', (req, res) => {
  res.json({ tvs: discoveredTVs, connected: connectedTV });
});

app.post('/api/connect', async (req, res) => {
  const { ip, brand } = req.body;
  const result = await connectToTV(ip, brand);
  broadcastToClients({ type: 'tv_connected', tv: connectedTV });
  res.json(result);
});

app.post('/api/disconnect', (req, res) => {
  if (tvController) {
    if (tvController.disconnect) tvController.disconnect();
    tvController = null;
  }
  connectedTV = null;
  broadcastToClients({ type: 'tv_disconnected' });
  res.json({ success: true, message: 'Desconectado' });
});

app.post('/api/command', async (req, res) => {
  const { command, value } = req.body;
  const result = await sendCommand(command, value);
  res.json(result);
});

// Manual TV entry
app.post('/api/add-tv', (req, res) => {
  const { ip, name, brand } = req.body;
  const tv = { ip, name: name || 'Minha TV', brand: brand || TV_BRANDS.GENERIC };
  
  if (!discoveredTVs.find(t => t.ip === ip)) {
    discoveredTVs.push(tv);
    console.log(`? TV adicionada manualmente: ${tv.name} (${tv.ip})`);
    broadcastToClients({ type: 'tv_found', tv });
  }
  
  res.json({ success: true, tv });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
??????????????????????????????????????????
?   ?? Controle Remoto Virtual - TV     ?
?                                        ?
?   ?? Servidor: http://localhost:${PORT}  ?
?   ?? Acesse do celular na mesma Wi-Fi ?
??????????????????????????????????????????
  `);
  
  // Buscar TVs automaticamente ao iniciar
  setTimeout(() => {
    discoverTVs();
  }, 1000);
});
