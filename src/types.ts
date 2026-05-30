export type Manufacturer = 'samsung' | 'lg' | 'roku' | 'philips' | 'sony' | 'generic';

export type RemoteCommand =
  | 'power'
  | 'source'
  | 'home'
  | 'back'
  | 'exit'
  | 'info'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'ok'
  | 'volume_up'
  | 'volume_down'
  | 'channel_up'
  | 'channel_down'
  | 'mute'
  | 'hdmi'
  | 'netflix'
  | 'microphone'
  | 'menu';

export type DeviceStatus = 'found' | 'connecting' | 'connected' | 'unreachable';

export interface SmartDevice {
  id: string;
  ip: string;
  name: string;
  manufacturer: Manufacturer;
  port?: number;
  model?: string;
  status: DeviceStatus;
}

export interface NetworkAccessResult {
  granted: boolean;
  isConnected: boolean;
  localIp: string | null;
  subnet: string | null;
}

export interface NetworkScanResult {
  localIp: string;
  subnet: string;
  devices: SmartDevice[];
}