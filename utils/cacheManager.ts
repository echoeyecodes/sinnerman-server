import redis from "redis";
import { promisify } from "util";

const client = redis.createClient();

async function deleteUserCacheByEmail(email: string) {
  promisify(() => {
    client.DEL(`${email}`);
  }).bind(client)
}

async function deleteUserEmailFromCache(email: string) {
  promisify(() => {
    client.hgetall(`${email}`, (err, result) => {
      if (result) {
        deleteUserCacheByEmail(email);
      }
    });
  }).bind(client)()
}

async function addUserEMailToCache(email: string, otp:string) {
  promisify(() => {
    client.hmset(`${email}`, { otp });
  }).bind(client)()
}


async function createUserCacheByEmail(email: string, otp: string) {
  promisify(async () => {
    await deleteUserEmailFromCache(email);
    await addUserEMailToCache(email, otp)
  }).bind(client)()
}

export { deleteUserCacheByEmail, createUserCacheByEmail };
