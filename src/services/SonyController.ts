import type { RemoteCommand, SmartDevice } from '../types';
import { fetchWithTimeout } from './http';
import { BaseRemoteController } from './RemoteController';

const SONY_IRCC: Partial<Record<RemoteCommand, string>> = {
  power: 'AAAAAQAAAAEAAAAVAw==',
  source: 'AAAAAQAAAAEAAAAlAw==',
  home: 'AAAAAQAAAAEAAABgAw==',
  back: 'AAAAAgAAAJcAAAAjAw==',
  info: 'AAAAAQAAAAEAAAA6Aw==',
  up: 'AAAAAQAAAAEAAAB0Aw==',
  down: 'AAAAAQAAAAEAAAB1Aw==',
  left: 'AAAAAQAAAAEAAAA0Aw==',
  right: 'AAAAAQAAAAEAAAAzAw==',
  ok: 'AAAAAQAAAAEAAABlAw==',
  volume_up: 'AAAAAQAAAAEAAAASAw==',
  volume_down: 'AAAAAQAAAAEAAAATAw==',
  channel_up: 'AAAAAQAAAAEAAAAQAw==',
  channel_down: 'AAAAAQAAAAEAAAARAw==',
  mute: 'AAAAAQAAAAEAAAAUAw==',
  netflix: 'AAAAAgAAABoAAAB8Aw==',
  menu: 'AAAAAgAAABoAAABhAw=='
};

export class SonyController extends BaseRemoteController {
  constructor(device: SmartDevice) {
    super(device);
  }

  async connect() {
    this.shouldReconnect = true;
    await this.systemRequest();
    this.startHeartbeat(() => this.systemRequest());
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    this.stopReconnect();
  }

  async sendCommand(command: RemoteCommand) {
    const code = SONY_IRCC[command];

    if (!code) {
      return;
    }

    await fetchWithTimeout(
      `http://${this.device.ip}/sony/ircc`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=UTF-8',
          SOAPACTION: '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"'
        },
        body: buildSoapBody(code)
      },
      1500
    );
  }

  private async systemRequest() {
    await fetchWithTimeout(
      `http://${this.device.ip}/sony/system`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 1, method: 'getSystemInformation', params: [], version: '1.0' })
      },
      1500
    );
  }
}

function buildSoapBody(code: string) {
  return `<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <s:Body>
    <u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1">
      <IRCCCode>${code}</IRCCCode>
    </u:X_SendIRCC>
  </s:Body>
</s:Envelope>`;
}