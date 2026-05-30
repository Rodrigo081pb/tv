import * as Location from 'expo-location';
import * as Network from 'expo-network';

import type { Manufacturer, NetworkAccessResult, NetworkScanResult, SmartDevice } from '../types';
import { fetchWithTimeout } from './http';

const SCAN_TIMEOUT_MS = 800;
const PROBE_CONCURRENCY = 20;

export async function requestNetworkAccess(): Promise<NetworkAccessResult> {
  await Location.requestForegroundPermissionsAsync();

  const networkState = await Network.getNetworkStateAsync();
  const localIp = await Network.getIpAddressAsync().catch(() => null);
  const subnet = localIp ? deriveSubnet(localIp) : null;

  return {
    granted: Boolean(networkState.isConnected && localIp && localIp !== '0.0.0.0'),
    isConnected: Boolean(networkState.isConnected),
    localIp,
    subnet
  };
}

export function deriveSubnet(ipAddress: string) {
  const parts = ipAddress.split('.');

  if (parts.length !== 4) {
    return null;
  }

  return parts.slice(0, 3).join('.');
}

export async function scanLocalNetwork(
  localIp: string,
  onDeviceFound?: (device: SmartDevice) => void
): Promise<NetworkScanResult> {
  const subnet = deriveSubnet(localIp);

  if (!subnet) {
    throw new Error('Nao foi possivel deduzir a faixa de rede local.');
  }

  const foundDevices = new Map<string, SmartDevice>();
  const ips = Array.from({ length: 254 }, (_, index) => `${subnet}.${index + 1}`);

  for (let i = 0; i < ips.length; i += PROBE_CONCURRENCY) {
    const batch = ips.slice(i, i + PROBE_CONCURRENCY);
    await Promise.allSettled(
      batch.map(async (ip) => {
        const device = await probeDevice(ip);

        if (device && !foundDevices.has(device.ip)) {
          foundDevices.set(device.ip, device);
          onDeviceFound?.(device);
        }
      })
    );
  }

  return {
    localIp,
    subnet,
    devices: Array.from(foundDevices.values())
  };
}

async function probeDevice(ip: string) {
  const probeResults = await Promise.allSettled([
    probeSamsung(ip),
    probeLG(ip),
    probeRoku(ip),
    probePhilips(ip),
    probeSony(ip)
  ]);

  for (const result of probeResults) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }

  return null;
}

async function probeSamsung(ip: string) {
  const response = await tryFetchText(`http://${ip}:8001/api/v2/`);

  if (response && response.toLowerCase().includes('samsung')) {
    return buildDevice(ip, 'samsung', parseName(response) ?? 'Samsung Smart TV', 8001);
  }

  const websocketOpened = await probeWebSocket(`ws://${ip}:8001/api/v2/channels/samsung.remote.control`);

  if (websocketOpened) {
    return buildDevice(ip, 'samsung', 'Samsung Smart TV', 8001);
  }

  return null;
}

async function probeLG(ip: string) {
  const httpResponse = await tryFetchText(`http://${ip}:8080/`);

  if (httpResponse && /lg|webos/i.test(httpResponse)) {
    return buildDevice(ip, 'lg', parseName(httpResponse) ?? 'LG webOS TV', 8080);
  }

  const websocketOpened = await probeWebSocket(`ws://${ip}:3000`);

  if (websocketOpened) {
    return buildDevice(ip, 'lg', 'LG webOS TV', 3000);
  }

  return null;
}

async function probeRoku(ip: string) {
  const ports = [8060, 3000];

  for (const port of ports) {
    const response = await tryFetchText(`http://${ip}:${port}/query/device-info`);

    if (response && /roku/i.test(response)) {
      const name = matchXmlTag(response, 'friendly-device-name') ?? matchXmlTag(response, 'model-name') ?? 'Roku';
      return buildDevice(ip, 'roku', name, port);
    }
  }

  return null;
}

async function probePhilips(ip: string) {
  const response = await tryFetchText(`http://${ip}:1925/6/system`);

  if (!response) {
    return null;
  }

  const lowerResponse = response.toLowerCase();
  const data = parseJson(response);

  if (lowerResponse.includes('philips') || data?.brand === 'Philips') {
    return buildDevice(ip, 'philips', data?.name ?? data?.model ?? 'Philips TV', 1925);
  }

  return null;
}

async function probeSony(ip: string) {
  const body = JSON.stringify({
    id: 1,
    method: 'getSystemInformation',
    params: [],
    version: '1.0'
  });
  const ports = [55000, 80];

  for (const port of ports) {
    const url = port === 80 ? `http://${ip}/sony/system` : `http://${ip}:${port}/sony/system`;
    const response = await tryFetchText(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    const data = response ? parseJson(response) : null;
    const system = data?.result?.[0];

    if (system?.product || system?.model || response?.toLowerCase().includes('sony')) {
      return buildDevice(ip, 'sony', system?.product ?? system?.model ?? 'Sony BRAVIA', port);
    }
  }

  return null;
}

async function tryFetchText(url: string, options: RequestInit = {}) {
  try {
    const response = await fetchWithTimeout(url, options, SCAN_TIMEOUT_MS);
    return await response.text();
  } catch (error) {
    return null;
  }
}

function probeWebSocket(url: string) {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const socket = new WebSocket(url);
    const timeoutId = setTimeout(() => finish(false), SCAN_TIMEOUT_MS);

    function finish(opened: boolean) {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      socket.close();
      resolve(opened);
    }

    socket.onopen = () => finish(true);
    socket.onerror = () => finish(false);
    socket.onclose = () => finish(false);
  });
}

function buildDevice(ip: string, manufacturer: Manufacturer, name: string, port: number): SmartDevice {
  return {
    id: `${manufacturer}-${ip}`,
    ip,
    name,
    manufacturer,
    port,
    status: 'found'
  };
}

function parseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function parseName(value: string) {
  const data = parseJson(value);
  return data?.device?.name ?? data?.name ?? data?.friendlyName ?? null;
}

function matchXmlTag(value: string, tagName: string) {
  const match = value.match(new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'i'));
  return match?.[1] ?? null;
}