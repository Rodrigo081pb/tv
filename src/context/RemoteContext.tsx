import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import type { TVRemoteController } from '../services/RemoteController';
import type { SmartDevice } from '../types';

interface RemoteContextValue {
  devices: SmartDevice[];
  selectedDevice: SmartDevice | null;
  controller: TVRemoteController | null;
  upsertDevice: (device: SmartDevice) => void;
  replaceDevices: (devices: SmartDevice[]) => void;
  clearDevices: () => void;
  setSelectedDevice: (device: SmartDevice | null) => void;
  setController: (controller: TVRemoteController | null) => void;
}

const RemoteContext = createContext<RemoteContextValue | null>(null);

interface RemoteProviderProps {
  children: ReactNode;
}

export function RemoteProvider({ children }: RemoteProviderProps) {
  const [devices, setDevices] = useState<SmartDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<SmartDevice | null>(null);
  const [controller, setController] = useState<TVRemoteController | null>(null);

  const upsertDevice = useCallback((device: SmartDevice) => {
    setDevices((currentDevices) => {
      const existingIndex = currentDevices.findIndex((item) => item.ip === device.ip);

      if (existingIndex === -1) {
        return [...currentDevices, device];
      }

      return currentDevices.map((item, index) => (index === existingIndex ? { ...item, ...device } : item));
    });
  }, []);

  const replaceDevices = useCallback((nextDevices: SmartDevice[]) => {
    setDevices(nextDevices);
  }, []);

  const clearDevices = useCallback(() => {
    setDevices([]);
  }, []);

  const value = useMemo(
    () => ({
      devices,
      selectedDevice,
      controller,
      upsertDevice,
      replaceDevices,
      clearDevices,
      setSelectedDevice,
      setController
    }),
    [clearDevices, controller, devices, replaceDevices, selectedDevice, upsertDevice]
  );

  return <RemoteContext.Provider value={value}>{children}</RemoteContext.Provider>;
}

export function useRemoteContext() {
  const context = useContext(RemoteContext);

  if (!context) {
    throw new Error('useRemoteContext must be used inside RemoteProvider');
  }

  return context;
}