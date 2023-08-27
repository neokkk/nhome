import { Controller, Get, Logger, Render } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { NodeGateway } from './node.gateway';
import { NodeService } from './node.service';
import { SensorData, SystemData } from './node.type';

@Controller()
export class NodeController {
  private logger = new Logger('NodeController');
  private client: MqttClient;

  constructor(
    private readonly nodeService: NodeService,
    private readonly nodeGateway: NodeGateway,
  ) {
    this.client = connect('mqtt://192.168.31.128:1883');

    this.client.on('connect', () => {
      this.logger.log('on mqtt connect');
      this.client.subscribe('sensor', (err) => {
        if (err) {
          this.logger.error('on subscribe sensor error');
        }
      });
      this.client.subscribe('system', (err) => {
        if (err) {
          this.logger.error('on subscribe system error');
        }
      })
    });

    this.client.on('message', (topic, buf) => {
      this.logger.log('on mqtt message');

      switch (topic) {
        case 'sensor':
          const [temp, press] = [buf.readFloatLE(0), buf.readFloatLE(4)];
          const sensorData = { __type: topic, temp, press };
          this.nodeGateway.sendData(sensorData);
          break;
        case 'system':
          const systemData = JSON.parse(buf.toString());
          systemData.__type = topic;
          this.nodeGateway.sendData(systemData);
          break;
      }
    });
  }

  @Get()
  @Render('node/index')
  index() {
    return [];
  }
}
