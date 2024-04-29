
const getUpstashRedisEnv = () => {
  const upsatashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
  const authToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!upsatashRedisRestUrl || !authToken) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required');
  }
  return { upsatashRedisRestUrl, authToken };
}

type Command = 'zrange' | 'sismember' | 'get' | 'smembers' | 'del' | 'incr';

export async function fetchRedis(command: Command, ...args: (string | number)[]) {
  
  const { upsatashRedisRestUrl, authToken } = getUpstashRedisEnv();
  const commandUrl = `${upsatashRedisRestUrl}/${command}/${args.join('/')}`
  const response = await fetch(commandUrl, {
		headers: {
			Authorization: `Bearer ${authToken}`,
		},
		cache: 'no-store',
	});
  
  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }
  const data = await response.json();
  return data.result;
}