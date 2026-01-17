const redis = require("redis");
const config = require("./config");

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      socket: {
        host: config.redis.host || "127.0.0.1",
        port: config.redis.port || 6379,
      },
      password: config.redis.password,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    await redisClient.connect();
  } catch (error) {
    console.error("❌ Redis connection failed:", error.message);
    process.exit(1);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectRedis() first.");
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
