import {createClient, type RedisClientType} from 'redis';

const getRedisEnv = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is not set');
  }
  return { redisUrl };
}

let redisClient: RedisClientType | null = null;

export const getRedisClient = async () => {
  if (!redisClient) {
    const { redisUrl } = getRedisEnv();
    redisClient = await (createClient({
      url: redisUrl,
    }).connect()) as RedisClientType;

    return redisClient;
  }
  return redisClient;
}