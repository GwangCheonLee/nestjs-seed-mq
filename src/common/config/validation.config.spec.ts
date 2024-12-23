import * as Joi from 'joi';
import { validationSchemaConfig } from './validation.config';

describe('Joi Validation Schema Configuration', () => {
  let schema: Joi.ObjectSchema;

  beforeEach(() => {
    schema = validationSchemaConfig();
  });

  it('should validate environment variables and set default values for optional fields', () => {
    const result = schema.validate({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'testdb',
      DB_USER_NAME: 'user',
      DB_USER_PASSWORD: 'password',
      RABBITMQ_URLS: 'amqp://user:password@localhost:5672',
      RABBITMQ_QUEUE: 'default',
    });

    expect(result.error).toBeUndefined();
    expect(result.value.TZ).toBe('UTC');
    expect(result.value.SERVER_PORT).toBe(3000);
    expect(result.value.RABBITMQ_QUEUE_DURABLE).toBe(false);
  });

  it('should throw an error if required fields are missing', () => {
    const { error } = schema.validate({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
    });

    expect(error).toBeDefined();
    expect(error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining('"DB_NAME" is required'),
        }),
      ]),
    );
  });
});
