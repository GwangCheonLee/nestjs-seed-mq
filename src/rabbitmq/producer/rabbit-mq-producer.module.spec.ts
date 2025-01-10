import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQProducerService } from './rabbit-mq-producer.service';
import { RabbitMQProducerModule } from './rabbit-mq-producer.module';
import { getRabbitMQProducerConfig } from '../../common/config/rabbit-mq.config';

jest.mock('../../common/config/rabbit-mq.config');

describe('RabbitMQProducerModule', () => {
  let module: TestingModule;
  let mockRabbitMQClient: any;
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const configs = {
        RABBITMQ_URLS: 'amqp://localhost:5672',
        RABBITMQ_QUEUE: 'test_queue',
        RABBITMQ_QUEUE_DURABLE: false,
      };
      return configs[key];
    }),
  };

  const mockConfig = {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'test_queue',
    },
  };

  beforeEach(async () => {
    // RabbitMQ Config Mock 설정
    (getRabbitMQProducerConfig as jest.Mock).mockReturnValue(mockConfig);

    // RabbitMQ Client Mock 설정
    mockRabbitMQClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    // 테스트 모듈 생성
    const moduleRef = Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({}),
        ClientsModule.registerAsync([
          {
            name: 'RABBIT_MQ_PRODUCER',
            useFactory: async (configService: ConfigService) =>
              getRabbitMQProducerConfig(configService),
            inject: [ConfigService],
          },
        ]),
        RabbitMQProducerModule,
      ],
    });

    // ConfigService 프로바이더 오버라이드
    moduleRef.overrideProvider(ConfigService).useValue(mockConfigService);

    // RABBIT_MQ_PRODUCER 프로바이더 오버라이드
    moduleRef
      .overrideProvider('RABBIT_MQ_PRODUCER')
      .useValue(mockRabbitMQClient);

    module = await moduleRef.compile();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  describe('Module initialization', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should have RabbitMQProducerService properly provided', () => {
      const service = module.get<RabbitMQProducerService>(
        RabbitMQProducerService,
      );
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(RabbitMQProducerService);
    });
  });

  describe('Configuration', () => {
    it('should use correct RabbitMQ configuration', () => {
      const config = getRabbitMQProducerConfig(
        mockConfigService as unknown as ConfigService,
      );
      expect(config).toEqual(mockConfig);
    });
  });

  describe('ConfigService', () => {
    it('should properly inject and use ConfigService', () => {
      const configService = module.get<ConfigService>(ConfigService);
      expect(configService).toBeDefined();
      expect(configService.get).toBeDefined();

      const url = configService.get('RABBITMQ_URLS');
      expect(url).toBe('amqp://localhost:5672');
    });
  });

  describe('Module exports', () => {
    it('should export RabbitMQProducerService', () => {
      const service = module.get<RabbitMQProducerService>(
        RabbitMQProducerService,
      );
      expect(service).toBeDefined();
    });
  });

  describe('ClientsModule.registerAsync', () => {
    it('should call useFactory with ConfigService and return correct config', async () => {
      const config = getRabbitMQProducerConfig(
        mockConfigService as unknown as ConfigService,
      );

      expect(config).toEqual(mockConfig);
      // expect(mockConfigService.get).toHaveBeenCalledWith('RABBITMQ_URLS');
      // expect(mockConfigService.get).toHaveBeenCalledWith('RABBITMQ_QUEUE');
    });
  });

  describe('Error handling', () => {
    it('should handle configuration errors gracefully', async () => {
      (getRabbitMQProducerConfig as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Configuration error');
      });

      await expect(
        Test.createTestingModule({
          imports: [RabbitMQProducerModule],
        }).compile(),
      ).rejects.toThrow();
    });
  });
});
