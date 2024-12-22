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
export function getRabbitMQConfig(
  configService: ConfigService,
): MicroserviceOptions {
  const rabbitMQUrls = configService.get<string>('RABBITMQ_URLS');
  const rabbitMQQueue = configService.get<string>('RABBITMQ_QUEUE');
  const rabbitMQDurable = configService.get<boolean>('RABBITMQ_QUEUE_DURABLE');

  return {
    transport: Transport.RMQ,
    options: {
      urls: rabbitMQUrls.split(','),
      queue: rabbitMQQueue,
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: rabbitMQDurable,
      },
    },
  };
}

/**
 * RabbitMQ 프로듀서 설정을 반환합니다.
 *
 * @param {ConfigService} configService - ConfigService 인스턴스
 * @return {ClientProvider} RabbitMQ 클라이언트 설정
 */
export function getRabbitMQProducerConfig(
  configService: ConfigService,
): ClientProvider {
  const rabbitMQUrls = configService.get<string>('RABBITMQ_URLS');
  const rabbitMQQueue = configService.get<string>('RABBITMQ_QUEUE');
  const rabbitMQDurable = configService.get<boolean>('RABBITMQ_QUEUE_DURABLE');

  return {
    transport: Transport.RMQ,
    options: {
      urls: rabbitMQUrls.split(','),
      queue: rabbitMQQueue,
      queueOptions: {
        durable: rabbitMQDurable,
      },
    },
  };
}
