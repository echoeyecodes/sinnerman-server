import redis from "redis";
import { promisify } from "util";

const client = redis.createClient();

async function deleteUserCacheByEmail(email: string) {
  promisify(() => {
    client.DEL(`${email}`);
  })().catch((error) => {
    console.log("error");
  });
}

async function createUserCacheByEmail(email: string, otp: string) {
    promisify(() => {
        client.hmset(`${email}`, { otp });
    })().catch((error) => {
      console.log("error");
    });
  }

  
export { deleteUserCacheByEmail, createUserCacheByEmail };
