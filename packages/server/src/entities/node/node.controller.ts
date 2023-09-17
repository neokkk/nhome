import { Controller, Get, Logger, Render } from '@nestjs/common';
import { NodeGateway } from './node.gateway';

@Controller()
export class NodeController {
  private logger = new Logger('NodeController');

  constructor(
    private readonly nodeGateway: NodeGateway,
  ) {}

  @Get()
  @Render('node/index')
  index() {
    return [];
  }
}
