import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RabbitMQConsumerController } from './rabbit-mq-consumer.controller';

describe('RabbitMQConsumerController', () => {
  let controller: RabbitMQConsumerController;
  let configService: ConfigService;

  // Mock RmqContext
  const mockChannel = {
    ack: jest.fn(),
    nack: jest.fn(),
  };

  const mockContext = {
    getChannelRef: jest.fn().mockReturnValue(mockChannel),
    getMessage: jest.fn(),
  };

  beforeEach(async () => {
    // ConfigService Mock 생성
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

  describe('constructor', () => {
    it('should get queue name from config service', () => {
      expect(configService.get).toHaveBeenCalledWith('RABBITMQ_QUEUE');
    });
  });

  describe('handleMessage', () => {
    beforeEach(() => {
      // Logger mock 설정
      jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    });

    it('should successfully process valid message', async () => {
      const mockData = {
        pattern: 'test-pattern',
        data: { foo: 'bar' },
      };

      await controller.handleMessage(mockData, mockContext as any);

      expect(mockContext.getChannelRef).toHaveBeenCalled();
      expect(mockContext.getMessage).toHaveBeenCalled();
      expect(mockChannel.ack).toHaveBeenCalled();
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Received message'),
      );
    });

    it('should handle invalid message format', async () => {
      const invalidData = null;

      await controller.handleMessage(invalidData, mockContext as any);

      expect(mockChannel.ack).not.toHaveBeenCalled();
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Invalid message format received',
      );
    });

    it('should handle processing error', async () => {
      const mockData = {
        pattern: 'test-pattern',
        data: { foo: 'bar' },
      };

      // getMessage가 에러를 던지도록 설정
      mockContext.getMessage.mockImplementationOnce(() => {
        throw new Error('Processing error');
      });

      await controller.handleMessage(mockData, mockContext as any);

      expect(mockChannel.nack).toHaveBeenCalledWith(undefined, false, false);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error processing message'),
        expect.any(String),
      );
    });
  });
});
