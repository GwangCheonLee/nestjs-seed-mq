import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { setupDataSource } from '../jest/setup';
import { RabbitMQProducerService } from './rabbitmq/producer/rabbit-mq-producer.service';
import { RabbitMQConsumerController } from './rabbitmq/consumer/rabbit-mq-consumer.controller';

describe('AppModule', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await setupDataSource();
    moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'test',
          entities: [],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([]),
      ],
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
    const rabbitMQProducerService = app.get<RabbitMQProducerService>(
      RabbitMQProducerService,
    );
    const rabbitMQConsumerController = app.get<RabbitMQConsumerController>(
      RabbitMQConsumerController,
    );

    expect(rabbitMQProducerService).toBeDefined();
    expect(rabbitMQConsumerController).toBeDefined();
  });
});
