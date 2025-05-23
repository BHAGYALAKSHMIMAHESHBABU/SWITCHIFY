// src/socket.js
import { io } from 'socket.io-client';

let socket;

const createSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      auth: {
        token: sessionStorage.getItem('currentToken'),
      },
      transports: ['websocket'], // Only use WebSocket transport
    });
  }
  return socket;
};

export default createSocket;
