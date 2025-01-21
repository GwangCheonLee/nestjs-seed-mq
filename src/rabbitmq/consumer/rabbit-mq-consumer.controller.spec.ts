import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RabbitMQConsumerController } from './rabbit-mq-consumer.controller';

describe('RabbitMQConsumerController', () => {
  let controller: RabbitMQConsumerController;
  let configService: ConfigService;

  const mockChannel = {
    ack: jest.fn(),
    nack: jest.fn(),
  };

  const mockContext = {
    getChannelRef: jest.fn().mockReturnValue(mockChannel),
    getMessage: jest.fn(),
  };

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-queue'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RabbitMQConsumerController],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<RabbitMQConsumerController>(
      RabbitMQConsumerController,
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should correctly initialize message pattern from config service', () => {
    const expectedPattern = 'test-queue';
    expect(controller['messagePattern']).toBe(expectedPattern);
  });

  describe('handleMessage', () => {
    beforeEach(() => {
      jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    });

    it('should handle data without pattern', async () => {
      const invalidData = 1 as unknown as {
        pattern: string;
        data: any;
      };

      await controller.handleMessage(invalidData, mockContext as any);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Invalid message format received',
      );
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it('should successfully process valid message', async () => {
      const mockData = {
        pattern: 'test-pattern',
        data: { foo: 'bar' },
      };

      await controller.handleMessage(mockData, mockContext as any);

      expect(mockContext.getChannelRef).toHaveBeenCalled();
      expect(mockContext.getMessage).toHaveBeenCalled();
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Received message'),
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Processing message with pattern'),
      );
      expect(mockChannel.ack).toHaveBeenCalled();
    });

    it('should handle invalid message format', async () => {
      const invalidData = null;

      await controller.handleMessage(invalidData, mockContext as any);

      expect(mockChannel.ack).not.toHaveBeenCalled();
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Invalid message format received',
      );
    });

    it('should verify the message pattern matches configuration', () => {
      const expectedPattern = configService.get('RABBITMQ_QUEUE');
      expect(controller['messagePattern']).toBe(expectedPattern);
    });
  });
});
