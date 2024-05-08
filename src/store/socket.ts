import { SOCKET_URL } from '@/constants/socket';
import { Socket, io } from 'socket.io-client';
import { create } from 'zustand';

type Store = {
  socket: Socket | null;
  connect: () => Socket;
  disconnect: () => void;
  is_connected: boolean;
  connection_references: number;
};

export const useSocketStore = create<Store>()((set, get) => ({
  socket: null,
  connect: () => {
    const initial_socket = get().socket;
    if (initial_socket) {
      set({ connection_references: get().connection_references + 1 });
      return initial_socket;
    }
		const socket = io(`${SOCKET_URL}`);
    set({ socket, is_connected: true, connection_references: 1 });
    return socket;
  },
  disconnect: () => {
    const initial_socket = get().socket;
    if (!initial_socket) {
      return;
    }
    const references = get().connection_references;
    if (references > 1) {
      set({ connection_references: references - 1 });
      return;
    }
    initial_socket.removeAllListeners();
    initial_socket.disconnect();
    set({ socket: null, is_connected: false, connection_references: 0 });
  },
  is_connected: false,
  connection_references: 0,
}));