import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

/**
 * RabbitMQ 컨슈머 컨트롤러
 *
 * RabbitMQ 메시지를 수신하고 처리하는 컨트롤러입니다.
 */
@Controller()
export class RabbitMQConsumerController {
  private readonly logger = new Logger(RabbitMQConsumerController.name);
  private readonly messagePattern: string;

  /**
   * RabbitMQConsumerController 인스턴스를 생성합니다.
   *
   * @param {ConfigService} configService - 환경 설정 서비스
   */
  constructor(private readonly configService: ConfigService) {
    this.messagePattern = this.configService.get<string>('RABBITMQ_QUEUE');
  }

  /**
   * Rabbit MQ 큐에서 메시지를 처리합니다.
   *
   * @param {object} data - 메시지 데이터 (객체 형태)
   * @param {RmqContext} context - 메시지 컨텍스트
   */
  @MessagePattern(
    (controller: RabbitMQConsumerController) => controller.messagePattern,
  )
  async handleMessage(
    @Payload() data: { pattern: string; data: any },
    @Ctx() context: RmqContext,
  ) {
    if (!data || typeof data !== 'object' || !data.pattern) {
      this.logger.error('Invalid message format received');
      return;
    }

    this.logger.log(`Received message: ${JSON.stringify(data)}`);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Processing message with pattern: ${data.pattern}`);

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Error processing message: ${error.message}`,
        error.stack,
      );
      channel.nack(originalMsg, false, false);
    }
  }
}
