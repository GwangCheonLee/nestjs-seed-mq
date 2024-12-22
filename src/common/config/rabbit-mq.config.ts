import {
  ClientProvider,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

/**
 * RabbitMQ 마이크로서비스 설정을 반환합니다.
 *
 * @param {ConfigService} configService 애플리케이션 설정 서비스 인스턴스
 * @return {MicroserviceOptions} RabbitMQ 마이크로서비스 옵션 객체
 */
export function getRabbitMqConfig(
  configService: ConfigService,
): MicroserviceOptions {
  const rabbitMqUrls = configService.get<string>('RABBITMQ_URLS');
  const rabbitMqQueue = configService.get<string>('RABBITMQ_QUEUE');
  const rabbitMqDurable = configService.get<boolean>('RABBITMQ_QUEUE_DURABLE');

  return {
    transport: Transport.RMQ,
    options: {
      urls: rabbitMqUrls.split(','),
      queue: rabbitMqQueue,
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: rabbitMqDurable,
      },
    },
  };
}

/**
 * RabbitMq 프로듀서 설정을 반환합니다.
 *
 * @param {ConfigService} configService - ConfigService 인스턴스
 * @return {ClientProvider} RabbitMq 클라이언트 설정
 */
export function getRabbitMqProducerConfig(
  configService: ConfigService,
): ClientProvider {
  const rabbitMqUrls = configService.get<string>('RABBITMQ_URLS');
  const rabbitMqQueue = configService.get<string>('RABBITMQ_QUEUE');
  const rabbitMqDurable = configService.get<boolean>('RABBITMQ_QUEUE_DURABLE');

  return {
    transport: Transport.RMQ,
    options: {
      urls: rabbitMqUrls.split(','),
      queue: rabbitMqQueue,
      queueOptions: {
        durable: rabbitMqDurable,
      },
    },
  };
}
