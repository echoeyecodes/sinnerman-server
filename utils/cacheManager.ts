import redis from "redis";
import { promisify } from "util";

const client = redis.createClient();

async function deleteUserCacheByEmail(email: string) {
  promisify(() => {
    client.DEL(`${email}`);
  })().catch(console.log);
}

async function deleteUserEmailFromCache(email: string) {
  promisify(() => {
    client.hgetall(`${email}`, (err, result) => {
      if (result) {
        deleteUserCacheByEmail(email);
      }
    });
  })().catch(console.log);
}

async function createUserCacheByEmail(email: string, otp: string) {
  promisify(async () => {
    await deleteUserEmailFromCache(email);
    client.hmset(`${email}`, { otp });
  })().catch(console.log);
}

export { deleteUserCacheByEmail, createUserCacheByEmail };
