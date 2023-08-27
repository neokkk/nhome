import { Message } from '../../types/socket';

export type SystemData = Message<{
  name: string;
  cores: number;
  engine: Engine;
  process: Process;
  memory: Memory;
  disk: Disk;
}>

export type SensorData = Message<{
  temp: number;
  press: number;
}>;

export type Engine = {
  motor_1_speed: number;
  motor_2_speed: number;
};

export type Process = {
  total: number;
  running: number;
  load_avg_for_1: number;
  load_avg_for_5: number;
};

export type Memory = {
  total: number;
  available: number;
  active: number;
  inactive: number;
  swapped: number;
  mapped: number;
};

export type Disk = {
  mount: string;
  total: number;
  used: number;
};