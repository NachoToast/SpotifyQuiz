import { Socket } from 'socket.io';

export default function getIpFromSocket(s: Socket): string {
    if (s.handshake.address === '::1') return '127.0.0.1';
    return s.handshake.address.split(':').slice(-1)[0];
}
