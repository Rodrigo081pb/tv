import type { RemoteCommand, SmartDevice } from '../types';
import { fetchWithTimeout } from './http';
import { BaseRemoteController } from './RemoteController';

const ROKU_KEYS: Partial<Record<RemoteCommand, string>> = {
  power: 'Power',
  home: 'Home',
  back: 'Back',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  ok: 'Select',
  volume_up: 'VolumeUp',
  volume_down: 'VolumeDown',
  channel_up: 'ChannelUp',
  channel_down: 'ChannelDown',
  mute: 'VolumeMute',
  info: 'Info',
  netflix: 'Netflix',
  menu: 'Home'
};

export class RokuController extends BaseRemoteController {
  constructor(device: SmartDevice) {
    super(device);
  }

  async connect() {
    this.shouldReconnect = true;
    await fetchWithTimeout(`http://${this.device.ip}:8060/query/device-info`, {}, 1200);
    this.startHeartbeat(() => fetchWithTimeout(`http://${this.device.ip}:8060/query/device-info`, {}, 1200));
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    this.stopReconnect();
  }

  async sendCommand(command: RemoteCommand) {
    const key = ROKU_KEYS[command];

    if (!key) {
      return;
    }

    await fetchWithTimeout(`http://${this.device.ip}:8060/keypress/${key}`, { method: 'POST' }, 1200);
  }
}