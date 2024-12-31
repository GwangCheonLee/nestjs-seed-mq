import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQProducerService } from './rabbit-mq-producer.service';
import { Logger } from '@nestjs/common';

describe('RabbitMQProducerService', () => {
  let service: RabbitMQProducerService;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQProducerService,
        {
          provide: 'RABBIT_MQ_PRODUCER',
          useValue: {
            connect: jest.fn().mockResolvedValue(undefined),
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RabbitMQProducerService>(RabbitMQProducerService);
    clientProxy = module.get<ClientProxy>('RABBIT_MQ_PRODUCER');
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onApplicationBootstrap', () => {
    it('should connect to RabbitMQ client', async () => {
      await service.onApplicationBootstrap();
      expect(clientProxy.connect).toHaveBeenCalled();
    });

    it('should handle connection error', async () => {
      jest
        .spyOn(clientProxy, 'connect')
        .mockRejectedValue(new Error('Connection failed'));
      await expect(service.onApplicationBootstrap()).rejects.toThrow(
        'Connection failed',
      );
    });
  });

  describe('sendMessage', () => {
    const validPattern = 'test-queue';
    const validData = { message: 'test' };

    it('should successfully send message with default delivery mode', () => {
      service.sendMessage(validPattern, validData);

      expect(clientProxy.emit).toHaveBeenCalledWith(validPattern, {
        pattern: validPattern,
        data: validData,
        options: { deliveryMode: 2 },
      });
      expect(Logger.prototype.log).toHaveBeenCalled();
    });

    it('should successfully send message with non-persistent delivery mode', () => {
      service.sendMessage(validPattern, validData, 1);

      expect(clientProxy.emit).toHaveBeenCalledWith(validPattern, {
        pattern: validPattern,
        data: validData,
        options: { deliveryMode: 1 },
      });
    });

    it('should throw error for empty pattern', () => {
      expect(() => service.sendMessage('', validData)).toThrow(
        'Pattern must be a non-empty string',
      );
    });

    it('should throw error for whitespace pattern', () => {
      expect(() => service.sendMessage('   ', validData)).toThrow(
        'Pattern must be a non-empty string',
      );
    });

    it('should throw error for invalid delivery mode', () => {
      expect(() => service.sendMessage(validPattern, validData, 3)).toThrow(
        'Delivery mode must be either 1 (non-persistent) or 2 (persistent)',
      );
    });

    it('should throw error for null data', () => {
      expect(() => service.sendMessage(validPattern, null)).toThrow(
        'The data must be a non-null object',
      );
    });

    it('should throw error for non-object data', () => {
      expect(() => service.sendMessage(validPattern, 'string' as any)).toThrow(
        'The data must be a non-null object',
      );
    });

    it('should handle emit errors', () => {
      jest.spyOn(clientProxy, 'emit').mockImplementation(() => {
        throw new Error('Emit failed');
      });

      expect(() => service.sendMessage(validPattern, validData)).toThrow(
        'Emit failed',
      );
    });
  });
});
