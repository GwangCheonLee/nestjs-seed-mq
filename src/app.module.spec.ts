import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RabbitMQProducerService } from './rabbitmq/producer/rabbit-mq-producer.service';
import { RabbitMQConsumerController } from './rabbitmq/consumer/rabbit-mq-consumer.controller';
import * as amqplibMocks from 'amqplib-mocks';
import { setupDataSource } from '../jest/setup';

jest.mock('amqp-connection-manager', () => {
  return {
    connect: jest.fn(() => amqplibMocks.connect()),
    AmqpConnectionManager: jest.fn().mockImplementation(() => ({
      createChannel: jest.fn().mockResolvedValue({
        assertQueue: jest.fn(),
        sendToQueue: jest.fn(),
        consume: jest.fn(),
      }),
      addListener: jest.fn(),
    })),
  };
});

describe('AppModule', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await setupDataSource();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'test',
          synchronize: true,
          entities: [], // 실제 엔티티 경로 추가
        }),
      ],
    })
      .overrideProvider('RABBIT_MQ_PRODUCER')
      .useValue({
        connect: jest.fn().mockResolvedValue(undefined),
        emit: jest.fn(),
      })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should load ConfigModule and provide ConfigService globally', () => {
    const configService = app.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
    expect(configService.get('DB_HOST')).toBe('localhost');
  });

  it('should initialize TypeOrmModule and connect to the database', async () => {
    const isConnected = dataSource.isInitialized;
    expect(isConnected).toBe(true);
  });

  it('should initialize RabbitMQProducerService and RabbitMQConsumerController', () => {
    const producerService = app.get<RabbitMQProducerService>(
      RabbitMQProducerService,
    );
    const consumerController = app.get<RabbitMQConsumerController>(
      RabbitMQConsumerController,
    );

    expect(producerService).toBeDefined();
    expect(consumerController).toBeDefined();
  });
});
