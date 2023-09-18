import { Injectable, Logger } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { WebSocket, WebSocketServer } from 'ws';

@Injectable()
export class NodeGateway {
  private logger = new Logger('NodeGateway');
  private wss: WebSocketServer;
  private mqc: MqttClient;

  constructor() {
    this.mqc = connect('mqtt://0.0.0.0:1883');
    this.wss = new WebSocketServer({ port: 30010 });

    this.setMqttEvents();
    this.setWebsocketEvents();
  }

  private setMqttEvents() {
    this.mqc.on('connect', () => {
      this.logger.log('on mqtt connect');
      this.mqc.subscribe('sensor', (err) => {
        if (err) {
          this.logger.error('on subscribe sensor error');
        }
      });
      this.mqc.subscribe('system', (err) => {
        if (err) {
          this.logger.error('on subscribe system error');
        }
      })
    });

    this.mqc.on('message', (topic, buf) => {
      this.logger.log('on mqtt message');

      switch (topic) {
        case 'sensor':
          const [temp, press] = [buf.readFloatLE(0), buf.readFloatLE(4)];
          const sensorData = { __type: topic, temp, press };
          this.sendWsData(sensorData);
          break;
        case 'system':
          const systemData = JSON.parse(buf.toString());
          systemData.__type = topic;
          this.sendWsData(systemData);
          break;
      }
    });
  }

  private setWebsocketEvents() {
    this.wss.on('connection', (socket) => {
      this.logger.log('on connection');

      socket.on('message', (message: string) => {
        this.logger.log('on message', message);
        const messageObj = JSON.parse(message);
        if (messageObj.__type === 'engine') {
          this.sendMqttData({
            num: messageObj.num,
            speed: messageObj.speed,
          });
        }
      });
      socket.on('disconnect', () => {
        this.logger.log('on disconnect');
      });
    });

    this.wss.on('error', (error) => {
      this.logger.error('on error', error);
      this.wss.close();
    });
  }

  sendWsData(data: any) {
    if (!this.wss) return;

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  sendMqttData(data: any) {
    if (!this.mqc) return;

    this.mqc.publish('engine', JSON.stringify(data), (err) => {
      if (err) {
        this.logger.error('on publish engine error');
      }
    });
  }
}
