import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

/**
 * Rabbit MQ 프로듀서 서비스
 *
 * 메시지를 Rabbit MQ 토픽으로 발송하는 기능을 제공합니다.
 */
@Injectable()
export class RabbitMQProducerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RabbitMQProducerService.name);

  constructor(
    @Inject('RABBIT_MQ_PRODUCER') private readonly rabbitMQClient: ClientProxy,
  ) {}

  /** 애플리케이션 부트스트랩 시 Rabbit MQ 클라이언트와 연결합니다. */
  async onApplicationBootstrap() {
    await this.rabbitMQClient.connect();
  }

  onModuleInit() {}

  /**
   * Rabbit MQ 큐에 메시지를 보냅니다.
   *
   * @param {string} pattern 메시지를 보낼 큐 이름
   * @param {object} data 전송할 메시지 데이터 (객체 형식이어야 함)
   * @param {number} deliveryMode 메시지 지속성 옵션 (1: 비영구적, 2: 영구적)
   */
  sendMessage(pattern: string, data: object, deliveryMode: number = 2): void {
    if (typeof data !== 'object' || data === null) {
      throw new Error('The data must be a non-null object');
    }

    this.logger.log(
      `Sending message to pattern: ${pattern}, data: ${JSON.stringify(data)}, deliveryMode: ${deliveryMode}`,
    );

    this.rabbitMQClient.emit(pattern, {
      pattern,
      data,
      options: {
        deliveryMode,
      },
    });
  }
}
