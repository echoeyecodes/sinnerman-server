import generateOTP from "../utils/generateOTP";
import pubsub from "../utils/pubusbSingleton";
import redis from "redis";
import { createUserCacheByEmail } from "../utils/cacheManager";

const client = redis.createClient();

async function mailPublisher(email: string) {
  const otp = generateOTP();
  console.warn("OTP IS " + otp);

  await createUserCacheByEmail(email, otp)
  const data = JSON.stringify({ email, otp });

  const buffer = Buffer.from(data);
  try {
    const messageId = await pubsub.topic("create_mail").publish(buffer);
    console.log({ messageId });
  } catch (error) {
    console.log(error);
  }
}

export { mailPublisher };