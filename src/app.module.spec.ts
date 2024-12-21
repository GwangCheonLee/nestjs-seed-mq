import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {AppModule} from './app.module';
import {ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {setupDataSource} from '../jest/setup';
import {User} from './users/entities/user.entity';
import {KafkaProducerService} from './kafka/producer/kafka-producer.service';
import {KafkaConsumerService} from './kafka/consumer/kafka-consumer.service';

describe('AppModule', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let dataSource: DataSource;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    dataSource = await setupDataSource();
    moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'test',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    app = moduleRef.createNestApplication();
    userRepository = moduleRef.get('UserRepository');
    await app.init();
  });

  afterAll(async () => {
    await userRepository.clear();
    await app.close();
  });

  it('should load ConfigModule and provide ConfigService globally', () => {
    const configService = app.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
    expect(configService.get('DB_HOST')).toBe('localhost'); // 예시: 환경 변수 검증
  });

  it('should initialize TypeOrmModule and connect to the database', async () => {
    const isConnected = dataSource.isInitialized;
    expect(isConnected).toBe(true);
  });

  it('should save and retrieve a user entity', async () => {
    const user = userRepository.create({
      email: 'test@example.com',
      nickname: 'testuser',
    });
    const savedUser = await userRepository.save(user);

    expect(savedUser).toBeDefined();
    expect(savedUser.id).toBeDefined();

    const retrievedUser = await userRepository.findOneBy({id: savedUser.id});
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser!.nickname).toBe('testuser');
  });

  it('should initialize KafkaProducerService and KafkaConsumerService', () => {
    const kafkaProducerService =
      app.get<KafkaProducerService>(KafkaProducerService);
    const kafkaConsumerService =
      app.get<KafkaConsumerService>(KafkaConsumerService);

    expect(kafkaProducerService).toBeDefined();
    expect(kafkaConsumerService).toBeDefined();
  });
});
