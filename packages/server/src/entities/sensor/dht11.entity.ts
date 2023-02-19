import { Sensor } from './sensor.entity';

const VALID_INPUT = '-';
const VALID_HUMIDITY_RANGE = [30, 50];
const VALID_TEMPERATURE_RANGE = [20, 25];

export interface IDHT11 {
  humidity: string;
  temperature: string;
  datetime: string;
}

export class DHT11 extends Sensor {
  humidity: string;
  temperature: string;

  constructor({ humidity, temperature, datetime }: IDHT11) {
    super(datetime);

    this.humidity = humidity;
    this.temperature = temperature;
  }

  isInvalid() {
    const { humidity, temperature } = this;
    const result: { invalid: boolean; message?: string } = { invalid: false };

    if (humidity === VALID_INPUT || temperature === VALID_INPUT) return result;

    const [numeric_humidity, numeric_temperature] = [
      Number(humidity),
      Number(temperature),
    ];

    if (
      numeric_humidity < VALID_HUMIDITY_RANGE[0] ||
      numeric_humidity >= VALID_HUMIDITY_RANGE[1]
    ) {
      Object.assign(result, {
        invalid: true,
        message: 'INVALID_HUMIDITY_RANGE',
      });
    }

    if (
      numeric_temperature < VALID_TEMPERATURE_RANGE[0] ||
      numeric_temperature >= VALID_HUMIDITY_RANGE[1]
    ) {
      Object.assign(result, {
        invalid: true,
        message: 'INVALID_TEMPERATURE_RANGE',
      });
    }

    return result;
  }
}
