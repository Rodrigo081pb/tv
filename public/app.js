// Estado da aplicação
let ws = null;
let connected = false;
let discoveredTVs = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initWebSocket();
  updateUI();
});

// WebSocket para atualizações em tempo real
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('? WebSocket conectado');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWSMessage(data);
  };
  
  ws.onerror = (error) => {
    console.error('? Erro no WebSocket:', error);
  };
  
  ws.onclose = () => {
    console.log('?? WebSocket desconectado. Reconectando...');
    setTimeout(initWebSocket, 3000);
  };
}

// Processar mensagens do WebSocket
function handleWSMessage(data) {
  console.log('?? Mensagem recebida:', data);
  
  switch (data.type) {
    case 'connected':
      discoveredTVs = data.tvs || [];
      if (data.connectedTV) {
        connected = true;
        updateConnectedStatus(data.connectedTV);
      }
      renderTVList();
      break;
      
    case 'tv_found':
      if (!discoveredTVs.find(tv => tv.ip === data.tv.ip)) {
        discoveredTVs.push(data.tv);
        renderTVList();
        showNotification(`?? TV encontrada: ${data.tv.name}`);
      }
      break;
      
    case 'tv_connected':
      connected = true;
      updateConnectedStatus(data.tv);
      hideLoading();
      showNotification('? Conectado com sucesso!');
      break;
      
    case 'tv_disconnected':
      connected = false;
      updateUI();
      hideLoading();
      showNotification('Desconectado da TV');
      break;
  }
}

// Buscar TVs na rede
async function scanTVs() {
  showLoading();
  const btn = document.getElementById('scan-btn');
  btn.disabled = true;
  btn.textContent = '?? Buscando...';
  
  try {
    const response = await fetch('/api/discover');
    const data = await response.json();
    showNotification(data.message);
    
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = '?? Buscar TVs na Rede';
      hideLoading();
    }, 5000);
  } catch (error) {
    console.error('Erro ao buscar TVs:', error);
    showNotification('? Erro ao buscar TVs');
    btn.disabled = false;
    btn.textContent = '?? Buscar TVs na Rede';
    hideLoading();
  }
}

// Renderizar lista de TVs
function renderTVList() {
  const tvList = document.getElementById('tv-list');
  
  if (discoveredTVs.length === 0) {
    tvList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Nenhuma TV encontrada. Clique em "Buscar TVs" ou adicione manualmente.</p>';
    return;
  }
  
  tvList.innerHTML = discoveredTVs.map(tv => `
    <div class="tv-item">
      <div class="tv-info">
        <div class="tv-name">?? ${tv.name}</div>
        <div class="tv-ip">${tv.ip} • ${tv.brand.toUpperCase()}</div>
      </div>
      <button class="btn btn-primary" onclick="connectTV('${tv.ip}', '${tv.brand}')" style="padding: 10px 20px; width: auto;">
        Conectar
      </button>
    </div>
  `).join('');
}

// Adicionar TV manualmente
async function addManualTV() {
  const ip = document.getElementById('manual-ip').value.trim();
  const brand = document.getElementById('manual-brand').value;
  
  if (!ip) {
    showNotification('? Digite o IP da TV');
    return;
  }
  
  // Validar formato de IP
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    showNotification('? IP inválido. Use o formato: 192.168.1.100');
    return;
  }
  
  showLoading();
  
  try {
    const response = await fetch('/api/add-tv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, brand, name: `TV ${brand.toUpperCase()}` })
    });
    
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('manual-ip').value = '';
      showNotification(`? TV adicionada: ${ip}`);
    }
  } catch (error) {
    console.error('Erro ao adicionar TV:', error);
    showNotification('? Erro ao adicionar TV');
  } finally {
    hideLoading();
  }
}

// Conectar na TV
async function connectTV(ip, brand) {
  showLoading();
  
  try {
    const response = await fetch('/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, brand })
    });
    
    const data = await response.json();
    
    if (data.success) {
      connected = true;
      updateConnectedStatus({ ip, brand });
      
      if (data.limited) {
        showNotification('?? ' + data.message);
      }
    } else {
      showNotification('? ' + data.message);
      hideLoading();
    }
  } catch (error) {
    console.error('Erro ao conectar:', error);
    showNotification('? Erro ao conectar na TV');
    hideLoading();
  }
}

// Desconectar da TV
async function disconnect() {
  showLoading();
  
  try {
    await fetch('/api/disconnect', { method: 'POST' });
    connected = false;
    updateUI();
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    showNotification('? Erro ao desconectar');
  } finally {
    hideLoading();
  }
}

// Enviar comando para TV
async function sendCmd(command) {
  if (!connected) {
    showNotification('? Conecte-se a uma TV primeiro');
    return;
  }
  
  // Feedback visual
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjeP1vPJeCsFI3fG8N+PQQY=');
  audio.volume = 0.2;
  audio.play().catch(() => {});
  
  try {
    const response = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      showNotification('?? ' + data.message);
    }
  } catch (error) {
    console.error('Erro ao enviar comando:', error);
    showNotification('? Erro ao enviar comando');
  }
}

// Atualizar status de conexão
function updateConnectedStatus(tv) {
  const status = document.getElementById('status');
  const statusText = document.getElementById('status-text');
  const connectedTvName = document.getElementById('connected-tv-name');
  
  status.classList.add('connected');
  statusText.textContent = `Conectado • ${tv.ip}`;
  
  if (connectedTvName) {
    connectedTvName.textContent = `?? TV ${tv.brand.toUpperCase()} • ${tv.ip}`;
  }
  
  updateUI();
}

// Atualizar interface
function updateUI() {
  const discovery = document.getElementById('discovery');
  const remote = document.getElementById('remote');
  const status = document.getElementById('status');
  
  if (connected) {
    discovery.classList.add('hidden');
    remote.classList.remove('hidden');
  } else {
    discovery.classList.remove('hidden');
    remote.classList.add('hidden');
    status.classList.remove('connected');
    document.getElementById('status-text').textContent = 'Desconectado';
  }
}

// Mostrar loading
function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
}

// Esconder loading
function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}

// Mostrar notificação
function showNotification(message) {
  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.95);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    border: 2px solid var(--primary);
    font-size: 14px;
    z-index: 2000;
    animation: slideDown 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Animações CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(-100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Prevenir zoom no iOS
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
