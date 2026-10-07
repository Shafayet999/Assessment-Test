import { createClient } from "redis";
import config from "../config";

export const redisClient = createClient({
    username: config.redis_user,
    password: config.redis_password,
    socket: {
        host: config.redis_host,
        port: Number(config.redis_port),
        // সকেট ড্রপ করলে অটো রিকানেক্ট পলিসি
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error("Redis: Max reconnect attempts reached");
                return new Error("Redis connection failed");
            }
            return Math.min(retries * 100, 3000); // ১০০ms ব্যবধানে পুনরায় চেষ্টার লজিক
        },
    },
});

// ⚠️ সবচেয়ে গুরুত্বপূর্ণ অংশ: এটি থাকলে সকেট ড্রপ হলেও সার্ভার ক্র্যাশ করবে না
redisClient.on("error", (err) => {
    console.warn("⚠️ Redis Client Warning:", err.message);
});

redisClient.on("connect", () => {
    console.log("✅ Redis Client Connected");
});

redisClient.on("reconnecting", () => {
    console.log("🔄 Redis Client Reconnecting...");
});