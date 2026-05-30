import { useCallback } from 'react';

import { useRemoteContext } from '../context/RemoteContext';
import { createRemoteController } from '../services/RemoteController';
import type { RemoteCommand, SmartDevice } from '../types';

export function useRemoteController() {
  const { controller, setController, setSelectedDevice, upsertDevice } = useRemoteContext();

  const connectToDevice = useCallback(
    async (device: SmartDevice) => {
      controller?.disconnect();
      upsertDevice({ ...device, status: 'connecting' });

      const nextController = createRemoteController(device);

      try {
        await nextController.connect();
      } catch (error) {
        upsertDevice({ ...device, status: 'unreachable' });
        throw error;
      }

      const connectedDevice = { ...device, status: 'connected' as const };
      setController(nextController);
      setSelectedDevice(connectedDevice);
      upsertDevice(connectedDevice);
    },
    [controller, setController, setSelectedDevice, upsertDevice]
  );

  const sendCommand = useCallback(
    async (command: RemoteCommand) => {
      try {
        await controller?.sendCommand(command);
      } catch (error) {
        console.warn('Falha silenciosa ao enviar comando:', command, error);
      }
    },
    [controller]
  );

  return {
    connectToDevice,
    sendCommand
  };
}