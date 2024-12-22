import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { RabbitMQProducerService } from './rabbit-mq-producer.service';
import { ConfigService } from '@nestjs/config';
import { getRabbitMQProducerConfig } from '../../common/config/rabbit-mq.config';

/**
 * RabbitMQ 프로듀서 모듈
 *
 * RabbitMQ 프로듀서를 위한 설정과 서비스를 제공합니다.
 */
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBIT_MQ_PRODUCER',
        useFactory: async (configService: ConfigService) =>
          getRabbitMQProducerConfig(configService),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [RabbitMQProducerService],
  exports: [RabbitMQProducerService],
})
export class RabbitMQProducerModule {}
