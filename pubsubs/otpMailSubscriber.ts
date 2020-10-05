import { generateOTPMicroservice } from '../microservices/otpMicroServiceContollers';
import pubsub from '../utils/pubusbSingleton'


export default function otpMailSubscriber() {
  const subscription = pubsub.subscription("user_registered");

  const handler = (message: any) => {
    const t = message.data.toString();
    const payload = JSON.parse(t)
    setTimeout(async () => {
      //do async work here like sending mail
      console.log({ payload});
    }, 5000);
    message.ack();
  };

  subscription.on("message", handler);
};

