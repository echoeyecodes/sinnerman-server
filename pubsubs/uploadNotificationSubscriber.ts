import pubsub from "../utils/pubusbSingleton";
import UploadNotification from "../models/UploadNotification";
import User from "../models/User";

export default function uploadNotificationSubscriber() {
  const subscription = pubsub.subscription("video_uploaded");

  const handler = async (message: any) => {
    const data = message.data.toString();
    const payload = JSON.parse(data);
    console.log({ payload });

    try {
      const users = await User.findAll();
      users.map(async (user) => {
        const new_payload = Object.assign({}, payload, {
          user_id: user.get().id,
        });
        const notification = UploadNotification.build(new_payload);
        await notification.save();
      });
      message.ack();
    } catch (error) {
      throw new Error(error);
    }
  };

  subscription.on("message", handler);
}
