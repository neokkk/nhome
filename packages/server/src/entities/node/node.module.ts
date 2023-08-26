import { Module } from '@nestjs/common';
import { NodeController } from './node.controller';
import { NodeGateway } from './node.gateway';
import { NodeService } from './node.service';

@Module({
  imports: [],
  controllers: [NodeController],
  providers: [NodeGateway, NodeService],
})
export class NodeModule {}
