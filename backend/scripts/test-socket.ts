/**
 * Quick Socket.io smoke test — run while server is up:
 *   npx tsx scripts/test-socket.ts
 */
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  socket.emit('ping');
});

socket.on('connected', (payload) => {
  console.log('Server welcome:', payload);
});

socket.on('pong', (payload) => {
  console.log('Pong:', payload);
  socket.disconnect();
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.error('Connection failed:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('Timeout — is the server running?');
  process.exit(1);
}, 5000);
