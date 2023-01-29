import { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  collectCoverage: false,
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.test\\.ts$',
  testTimeout: 30000,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  verbose: true,
};

export default config;
