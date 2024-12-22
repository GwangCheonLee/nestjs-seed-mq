import * as Joi from 'joi';

/**
 * Defines a Joi validation schema for environment variables
 * @return {Joi.ObjectSchema} Joi object schema for env variables
 */
export const validationSchemaConfig = (): Joi.ObjectSchema => {
  return Joi.object({
    TZ: Joi.string().default('UTC'),
    SERVER_PORT: Joi.number().default(3000),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_USER_NAME: Joi.string().required(),
    DB_USER_PASSWORD: Joi.string().required(),
    RABBITMQ_URLS: Joi.string().required(),
    RABBITMQ_QUEUE: Joi.string().required(),
    RABBITMQ_QUEUE_DURABLE: Joi.boolean().default(false),
  });
};
