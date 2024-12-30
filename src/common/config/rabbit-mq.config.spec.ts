import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import {
  getRabbitMQConfig,
  getRabbitMQProducerConfig,
} from './rabbit-mq.config';

describe('RabbitMQ Configurations', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  describe('getRabbitMQConfig', () => {
    it('should return the correct RabbitMQ microservice options', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        const config = {
          RABBITMQ_URLS: 'amqp://localhost,amqp://remotehost',
          RABBITMQ_QUEUE: 'test_queue',
          RABBITMQ_QUEUE_DURABLE: true,
        };
        return config[key];
      });

      const result = getRabbitMQConfig(configService);

      expect(result).toEqual({
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost', 'amqp://remotehost'],
          queue: 'test_queue',
          noAck: false,
          prefetchCount: 1,
          queueOptions: {
            durable: true,
          },
        },
      });
    });
  });

  describe('getRabbitMQProducerConfig', () => {
    it('should return the correct RabbitMQ producer options', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        const config = {
          RABBITMQ_URLS: 'amqp://localhost,amqp://remotehost',
          RABBITMQ_QUEUE: 'test_queue',
          RABBITMQ_QUEUE_DURABLE: true,
        };
        return config[key];
      });

      const result = getRabbitMQProducerConfig(configService);

      expect(result).toEqual({
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost', 'amqp://remotehost'],
          queue: 'test_queue',
          queueOptions: {
            durable: true,
          },
        },
      });
    });
  });
});
