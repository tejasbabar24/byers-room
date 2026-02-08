import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string) || 'http://localhost:3001';

export const socket: Socket = io(SOCKET_URL, { autoConnect: false });

export default socket;
