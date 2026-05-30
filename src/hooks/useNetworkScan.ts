import { useCallback, useEffect, useRef, useState } from 'react';

import { useRemoteContext } from '../context/RemoteContext';
import { requestNetworkAccess, scanLocalNetwork } from '../services/NetworkScanner';

export function useNetworkScan() {
  const { clearDevices, replaceDevices, upsertDevice } = useRemoteContext();
  const [isScanning, setIsScanning] = useState(false);
  const [localIp, setLocalIp] = useState<string | null>(null);
  const [subnet, setSubnet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scanTokenRef = useRef(0);

  useEffect(() => {
    return () => {
      scanTokenRef.current += 1;
    };
  }, []);

  const startScan = useCallback(async () => {
    scanTokenRef.current += 1;
    const token = scanTokenRef.current;

    setIsScanning(true);
    setError(null);
    clearDevices();

    try {
      const access = await requestNetworkAccess();

      if (token !== scanTokenRef.current) return;

      setLocalIp(access.localIp);
      setSubnet(access.subnet);

      if (!access.granted || !access.localIp) {
        throw new Error('Conecte o celular a uma rede Wi-Fi local para buscar TVs.');
      }

      const result = await scanLocalNetwork(access.localIp, (device) => {
        if (token === scanTokenRef.current) {
          upsertDevice(device);
        }
      });

      if (token !== scanTokenRef.current) return;

      replaceDevices(result.devices);
    } catch (scanError) {
      if (token !== scanTokenRef.current) return;
      const message = scanError instanceof Error ? scanError.message : 'Erro ao buscar dispositivos.';
      console.warn(message, scanError);
      setError(message);
    } finally {
      if (token === scanTokenRef.current) {
        setIsScanning(false);
      }
    }
  }, [clearDevices, replaceDevices, upsertDevice]);

  return {
    isScanning,
    localIp,
    subnet,
    error,
    startScan
  };
}