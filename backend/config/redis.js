import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient;
let redisPubClient;
let redisSubClient;

export async function initRedis() {
  const redisConfig = {
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    },
  };

  if (process.env.REDIS_PASSWORD) {
    redisConfig.password = process.env.REDIS_PASSWORD;
  }

  // Main client
  redisClient = createClient(redisConfig);
  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  await redisClient.connect();

  // Pub/Sub clients
  redisPubClient = createClient(redisConfig);
  await redisPubClient.connect();

  redisSubClient = createClient(redisConfig);
  await redisSubClient.connect();

  return { redisClient, redisPubClient, redisSubClient };
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

export function getRedisPubClient() {
  if (!redisPubClient) {
    throw new Error('Redis pub client not initialized');
  }
  return redisPubClient;
}

export function getRedisSubClient() {
  if (!redisSubClient) {
    throw new Error('Redis sub client not initialized');
  }
  return redisSubClient;
}

export { redisClient, redisPubClient, redisSubClient };