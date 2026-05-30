import type { RemoteCommand, SmartDevice } from '../types';
import { BaseRemoteController } from './RemoteController';

const LG_BUTTONS: Partial<Record<RemoteCommand, string>> = {
  power: 'POWER',
  source: 'INPUT_HUB',
  home: 'HOME',
  back: 'BACK',
  exit: 'EXIT',
  info: 'INFO',
  up: 'UP',
  down: 'DOWN',
  left: 'LEFT',
  right: 'RIGHT',
  ok: 'ENTER',
  volume_up: 'VOLUMEUP',
  volume_down: 'VOLUMEDOWN',
  channel_up: 'CHANNELUP',
  channel_down: 'CHANNELDOWN',
  mute: 'MUTE',
  hdmi: 'HDMI1',
  netflix: 'NETFLIX',
  microphone: 'VOICE',
  menu: 'MENU'
};

export class LGController extends BaseRemoteController {
  private socket: WebSocket | null = null;
  private inputSocket: WebSocket | null = null;
  private requestCounter = 0;
  private clientKey: string | null = null;

  constructor(device: SmartDevice) {
    super(device);
  }

  connect() {
    this.shouldReconnect = true;

    return new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(`ws://${this.device.ip}:3000`);
      const timeoutId = setTimeout(() => {
        socket.close();
        reject(new Error('Timeout ao conectar na LG webOS.'));
      }, 20000);

      socket.onopen = () => {
        this.socket = socket;
        this.registerClient();
      };

      socket.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Falha no WebSocket LG.'));
      };

      socket.onclose = () => {
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      socket.onmessage = (event) => {
        const message = parseMessage(event.data);

        if (message?.type === 'registered') {
          this.clientKey = message.payload?.['client-key'] ?? this.clientKey;
          this.openInputSocket()
            .then(() => {
              clearTimeout(timeoutId);
              this.startHeartbeat(() => this.sendRequest('ssap://com.webos.service.connectionmanager/getstatus'));
              resolve();
            })
            .catch(reject);
        }

        if (message?.payload?.socketPath) {
          this.openInputSocket(message.payload.socketPath).catch((error) => console.warn('Input socket LG falhou:', error));
        }
      };
    });
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    this.stopReconnect();
    this.inputSocket?.close();
    this.socket?.close();
    this.inputSocket = null;
    this.socket = null;
  }

  async sendCommand(command: RemoteCommand) {
    const button = LG_BUTTONS[command];

    if (!button || this.inputSocket?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.inputSocket.send(`type:button\nname:${button}\n\n`);
  }

  private registerClient() {
    this.socket?.send(
      JSON.stringify({
        type: 'register',
        id: this.nextId(),
        payload: {
          pairingType: 'PROMPT',
          'client-key': this.clientKey ?? undefined,
          manifest: {
            manifestVersion: 1,
            appVersion: '1.0.0',
            signed: {
              created: '2026-05-30T00:00:00Z',
              appId: 'com.smartremote.mobile',
              vendorId: 'smartremote',
              localizedAppNames: { '': 'SmartRemote' },
              localizedVendorNames: { '': 'SmartRemote' },
              permissions: ['LAUNCH', 'CONTROL_INPUT_TEXT', 'CONTROL_MOUSE_AND_KEYBOARD', 'READ_INSTALLED_APPS']
            }
          }
        }
      })
    );
  }

  private async openInputSocket(socketPath?: string) {
    if (this.inputSocket?.readyState === WebSocket.OPEN) {
      return;
    }

    if (!socketPath) {
      this.sendRequest('ssap://com.webos.service.networkinput/getPointerInputSocket');
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const url = socketPath.startsWith('ws') ? socketPath : `ws://${this.device.ip}:3000${socketPath}`;
      const inputSocket = new WebSocket(url);
      const timeoutId = setTimeout(() => {
        inputSocket.close();
        reject(new Error('Timeout ao abrir input socket LG.'));
      }, 5000);

      inputSocket.onopen = () => {
        clearTimeout(timeoutId);
        this.inputSocket = inputSocket;
        resolve();
      };

      inputSocket.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Falha no input socket LG.'));
      };
    });
  }

  private sendRequest(uri: string, payload: Record<string, unknown> = {}) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(
      JSON.stringify({
        id: this.nextId(),
        type: 'request',
        uri,
        payload
      })
    );
  }

  private nextId() {
    this.requestCounter += 1;
    return `smartremote_${this.requestCounter}`;
  }
}

function parseMessage(data: unknown) {
  if (typeof data !== 'string') {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}