import { Message } from '../../types/socket';

export type SensorData = Message<{
  temp: number;
  press: number;
}>;
