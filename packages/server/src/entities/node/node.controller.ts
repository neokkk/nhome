import { Controller, Get, Logger, Render } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { NodeGateway } from './node.gateway';
import { NodeService } from './node.service';
import { SensorData } from './node.type';

@Controller()
export class NodeController {
  private logger = new Logger('NodeController');
  private client: MqttClient;

  constructor(
    private readonly nodeService: NodeService,
    private readonly nodeGateway: NodeGateway,
  ) {
    const data: SensorData = { __type: '', temp: 0, press: 0 };

    this.client = connect('mqtt://192.168.31.128:1883');

    this.client.on('connect', () => {
      this.logger.log('on mqtt connect');
      this.client.subscribe('sensor', (err) => {
        if (err) {
          this.logger.error('on subscribe error');
        }
      });
    });

    this.client.on('message', (topic, buf) => {
      this.logger.log('on mqtt message');
      const temp = buf.readFloatLE(0);
      const press = buf.readFloatLE(4);
      Object.assign(data, { __type: topic, temp, press });
      this.nodeGateway.sendSensorData(data);
    });
  }

  @Get()
  @Render('node/index')
  index() {
    return [];
  }
}
