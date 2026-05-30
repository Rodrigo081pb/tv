import type { RemoteCommand, SmartDevice } from '../types';
import { fetchWithTimeout } from './http';
import { BaseRemoteController } from './RemoteController';

const PHILIPS_KEYS: Partial<Record<RemoteCommand, string>> = {
  power: 'Standby',
  source: 'Source',
  home: 'Home',
  back: 'Back',
  exit: 'Exit',
  info: 'Info',
  up: 'CursorUp',
  down: 'CursorDown',
  left: 'CursorLeft',
  right: 'CursorRight',
  ok: 'Confirm',
  volume_up: 'VolumeUp',
  volume_down: 'VolumeDown',
  channel_up: 'ChannelStepUp',
  channel_down: 'ChannelStepDown',
  mute: 'Mute',
  hdmi: 'Source',
  menu: 'Options'
};

export class PhilipsController extends BaseRemoteController {
  constructor(device: SmartDevice) {
    super(device);
  }

  async connect() {
    this.shouldReconnect = true;
    await fetchWithTimeout(`http://${this.device.ip}:1925/6/system`, {}, 1200);
    this.startHeartbeat(() => fetchWithTimeout(`http://${this.device.ip}:1925/6/system`, {}, 1200));
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    this.stopReconnect();
  }

  async sendCommand(command: RemoteCommand) {
    const key = PHILIPS_KEYS[command];

    if (!key) {
      return;
    }

    await fetchWithTimeout(
      `http://${this.device.ip}:1925/6/input/key`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      },
      1200
    );
  }
}