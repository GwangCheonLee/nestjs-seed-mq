import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validationSchemaConfig } from './common/config/validation.config';
import { getEnvPath } from './common/config/env-path.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './common/config/typeorm.config';
import { RabbitMQProducerModule } from './rabbitmq/producer/rabbit-mq-producer.module';
import { RabbitMQConsumerModule } from './rabbitmq/consumer/rabbit-mq-consumer.module';

@Module({
  imports: [
    RabbitMQProducerModule,
    RabbitMQConsumerModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeormConfig,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvPath(),
      validationSchema: validationSchemaConfig(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
