import type { RemoteCommand, SmartDevice } from '../types';
import { LGController } from './LGController';
import { PhilipsController } from './PhilipsController';
import { RokuController } from './RokuController';
import { SamsungController } from './SamsungController';
import { SonyController } from './SonyController';

export interface TVRemoteController {
  connect: () => Promise<void>;
  disconnect: () => void;
  sendCommand: (command: RemoteCommand) => Promise<void>;
  getDevice: () => SmartDevice;
}

export abstract class BaseRemoteController implements TVRemoteController {
  protected heartbeatId: ReturnType<typeof setInterval> | null = null;
  protected reconnectId: ReturnType<typeof setTimeout> | null = null;
  protected shouldReconnect = true;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;

  constructor(protected readonly device: SmartDevice) {}

  abstract connect(): Promise<void>;
  abstract disconnect(): void;
  abstract sendCommand(command: RemoteCommand): Promise<void>;

  getDevice() {
    return this.device;
  }

  protected startHeartbeat(action: () => Promise<unknown> | unknown) {
    this.stopHeartbeat();
    this.heartbeatId = setInterval(() => {
      Promise.resolve(action()).catch((error) => console.warn('Heartbeat falhou:', error));
    }, 30000);
  }

  protected stopHeartbeat() {
    if (this.heartbeatId) {
      clearInterval(this.heartbeatId);
      this.heartbeatId = null;
    }
  }

  protected scheduleReconnect() {
    if (!this.shouldReconnect || this.reconnectId || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    this.reconnectId = setTimeout(() => {
      this.reconnectId = null;
      this.connect().catch((error) => console.warn('Reconexao falhou:', error));
    }, 2000);
  }

  protected stopReconnect() {
    if (this.reconnectId) {
      clearTimeout(this.reconnectId);
      this.reconnectId = null;
    }
    this.reconnectAttempts = 0;
  }
}

export function createRemoteController(device: SmartDevice): TVRemoteController {
  switch (device.manufacturer) {
    case 'samsung':
      return new SamsungController(device);
    case 'lg':
      return new LGController(device);
    case 'roku':
      return new RokuController(device);
    case 'philips':
      return new PhilipsController(device);
    case 'sony':
      return new SonyController(device);
    default:
      return new RokuController({ ...device, manufacturer: 'roku', port: 8060 });
  }
}