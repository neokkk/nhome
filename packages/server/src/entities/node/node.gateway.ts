import { Injectable, Logger } from '@nestjs/common';
import { WebSocket, WebSocketServer } from 'ws';

@Injectable()
export class NodeGateway {
  private logger = new Logger('NodeGateway');
  private server: WebSocketServer;

  constructor() {
    this.server = new WebSocketServer({ port: 81 });
    this.setEvents();
  }

  private setEvents() {
    this.server.on('connection', (socket) => {
      this.logger.log('on connection');
      socket.on('message', (message: string) => {
        this.logger.log('on messag', message);
      });
      socket.on('disconnect', () => {
        this.logger.log('on disconnect');
      });
    });

    this.server.on('error', (error) => {
      this.logger.error('on error', error);
      this.server.close();
    });
  }

  sendSensorData(data: any) {
    if (!this.server) return;

    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}
