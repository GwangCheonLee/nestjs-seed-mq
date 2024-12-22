import { Module } from '@nestjs/common';
import { RabbitMQConsumerController } from './rabbit-mq-consumer.controller';

/**
 * RabbitMQ 컨슈머 모듈
 *
 * RabbitMQ 컨슈머의 컨트롤러와 서비스를 제공하는 모듈입니다.
 */
@Module({
  controllers: [RabbitMQConsumerController],
})
export class RabbitMQConsumerModule {}
