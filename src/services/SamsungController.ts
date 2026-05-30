import type { RemoteCommand, SmartDevice } from '../types';
import { BaseRemoteController } from './RemoteController';

const SAMSUNG_KEYS: Partial<Record<RemoteCommand, string>> = {
  power: 'KEY_POWER',
  source: 'KEY_SOURCE',
  home: 'KEY_HOME',
  back: 'KEY_RETURN',
  exit: 'KEY_EXIT',
  info: 'KEY_INFO',
  up: 'KEY_UP',
  down: 'KEY_DOWN',
  left: 'KEY_LEFT',
  right: 'KEY_RIGHT',
  ok: 'KEY_ENTER',
  volume_up: 'KEY_VOLUP',
  volume_down: 'KEY_VOLDOWN',
  channel_up: 'KEY_CHUP',
  channel_down: 'KEY_CHDOWN',
  mute: 'KEY_MUTE',
  hdmi: 'KEY_HDMI',
  netflix: 'KEY_NETFLIX',
  microphone: 'KEY_MIC',
  menu: 'KEY_MENU'
};

export class SamsungController extends BaseRemoteController {
  private socket: WebSocket | null = null;

  constructor(device: SmartDevice) {
    super(device);
  }

  connect() {
    this.shouldReconnect = true;

    return new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(`ws://${this.device.ip}:8001/api/v2/channels/samsung.remote.control`);
      const timeoutId = setTimeout(() => {
        socket.close();
        reject(new Error('Timeout ao conectar na Samsung TV.'));
      }, 5000);

      socket.onopen = () => {
        clearTimeout(timeoutId);
        this.socket = socket;
        this.startHeartbeat(() => this.sendHeartbeat());
        resolve();
      };

      socket.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Falha no WebSocket Samsung.'));
      };

      socket.onclose = () => {
        this.stopHeartbeat();
        this.scheduleReconnect();
      };
    });
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    this.stopReconnect();
    this.socket?.close();
    this.socket = null;
  }

  async sendCommand(command: RemoteCommand) {
    const key = SAMSUNG_KEYS[command];

    if (!key || this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(
      JSON.stringify({
        method: 'ms.remote.control',
        params: {
          Cmd: 'Click',
          DataOfCmd: key,
          Option: 'false',
          TypeOfRemote: 'SendRemoteKey'
        }
      })
    );
  }

  private sendHeartbeat() {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(
      JSON.stringify({
        method: 'ms.channel.emit',
        params: {
          event: 'ping',
          to: 'host',
          data: '{}'
        }
      })
    );
  }
}